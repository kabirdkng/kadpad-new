import config from '../wallet/config.js';

/**
 * Sales Contract Template
 * Generates complete Pact smart contract for token sales with phases, reservations, and distribution
 */
export const generateSalesContract = (moduleName, namespace, salesDetails) => {
  const keys = `(define-keyset "${namespace}.sales-operator" (read-keyset "ks"))`;
  
  // Determine burn namespace based on network environment from config
  const burnNamespace = config.name === 'mainnet' ? 'user' : 'n_e309f0fa7cf3a13f93a8da5325cdad32790d2070';
  
  const formatDecimal = (value) => `${parseFloat(value || 0).toFixed(1)}`;
  const formatDateTime = (dateTime) => {
    if (!dateTime) return new Date().toISOString().split('.')[0] + 'Z';
    try {
      const date = new Date(dateTime);
      return date.toISOString().split('.')[0] + 'Z';
    } catch (error) {
      console.error('Error formatting date:', error);
      return new Date().toISOString().split('.')[0] + 'Z';
    }
  };

  const batches = salesDetails.totalBatches || 1;
  const formattedAmountPerBatch = formatDecimal(salesDetails.amountPerBatch || salesDetails.tokensPerBatch || 0);
  const formattedPhase0Price = formatDecimal(salesDetails.phase0Price || salesDetails.phase0price || 0);
  const formattedPhase1Price = formatDecimal(salesDetails.phase1Price || 0);
  const formattedWhitelistLimit = Number(salesDetails.whitelistLimit || 0);
  
  const formattedPhase0Start = formatDateTime(salesDetails.phase0StartDate || salesDetails.phase0startDate || salesDetails.phase0start);
  const formattedPhase1Start = formatDateTime(salesDetails.phase1StartDate || salesDetails.phase1start);
  const formattedEndSales = formatDateTime(salesDetails.salesEndDate || salesDetails.endsales);

 return `(namespace '${namespace})
${keys}

(module ${moduleName}-sales GOVERNANCE ;; Variable
  (use free.util-time)
  (use free.util-math)

  ;-----------------------------------------------------------------------------
  ; Administrative and ops capabilities
  ;-----------------------------------------------------------------------------
  (defcap GOVERNANCE ()
    (enforce-keyset "${namespace}.gov")) ;; Variable

  (defcap SALES-OPERATOR ()
    (enforce-keyset "${namespace}.sales-operator") ;; Variable
    (compose-capability (RESERVE))
    )

  ;-----------------------------------------------------------------------------
  ; Constants
  ;-----------------------------------------------------------------------------
  (defconst TOTAL-BATCHES:integer ${batches} @doc "Number of Batches to sell") ;; Variable

  (defconst P0-RESERVED:integer ${formattedWhitelistLimit} @doc "Number of tokens that Whitelist can purchase") ;; Variable

  (defconst AMOUNT-PER-BATCH:decimal ${formattedAmountPerBatch} 
    @doc "Number of tokens per batch Total Batches * Amount-Per-Batch = total sale") ;; Variable

  (defconst PHASE0:string "phase-0" @doc "Whitelist Phase")

  (defconst PHASE1:string "phase-1" @doc "Public Sales Phase")

  ; Dates must be adjusted before launch
  (defconst PHASE-0-START (time "${formattedPhase0Start}")) ;; Variable
  
  (defconst PHASE-1-START (time "${formattedPhase1Start}")) ;; Variable
  
  ;; No sales can occur after End-of-Presales
  (defconst END-OF-PRESALES (time "${formattedEndSales}")) ;; Variable

  (defconst HEAD "HEAD")

  ; The number of accounts to handle during a single (distribute-tokens) call
  ; Must be tweaked depending on the complexity of (distribute-to-account) function
  ; not not go above max gas per block (150k)
  (defconst MAX-PER-ROUND 200)

  ;-----------------------------------------------------------------------------
  ; Dates functions to pre-sales phases
  ;-----------------------------------------------------------------------------
  (defun in-phase-0:bool ()
    (and (is-past PHASE-0-START) (is-future PHASE-1-START)))

  (defun in-phase-1:bool ()
    (and (is-past PHASE-1-START) (is-future END-OF-PRESALES)))

  (defun ended:bool ()
    (is-past END-OF-PRESALES))

  ;-----------------------------------------------------------------------------
  ; Schemas and Tables
  ;-----------------------------------------------------------------------------
  (defschema counters-sch
    sold:integer
    reserved:integer
    accounts:integer
  )

  (deftable global-counters:{counters-sch})

  (defschema presale-account-sch
    account:string
    reserved:integer
    bought:integer
    prev-account:string
  )

  (deftable accounts-table:{presale-account-sch})

  (defschema fee-Schemas
    price:decimal
    count:integer
  )

  (deftable fees:{fee-Schemas})

  (defschema tail
    @doc "Last account that reserved tokens"
    tail-account:string
  )
  ; Singleton table
  (deftable tail-table:{tail})

  ;-----------------------------------------------------------------------------
  ; Caps and internal accounts management
  ;-----------------------------------------------------------------------------
  (defcap SALES-INCOME () true)

  (defconst SALES-GUARD (create-capability-guard (SALES-INCOME)))

  (defconst SALES-ACCOUNT (create-principal SALES-GUARD))

  (defcap RESERVE () true)

  (defconst RESERVE-GUARD (create-capability-guard (RESERVE)))

  (defconst RESERVE-ACCOUNT (create-principal RESERVE-GUARD))

  ; Just an event for testing purpose
  (defcap TOKEN-DISTRIBUTED (account:string amount:integer)
    @event
    true)

  ;-----------------------------------------------------------------------------
  ; Utility functions
  ;-----------------------------------------------------------------------------
  (defun account-exist:bool (account:string)
    @doc "Check whether an account exist"
    (= account (try "" (at 'account (${moduleName}.details account))))
  )

  (defun current-phase:string ()
   (if (in-phase-0) PHASE0 PHASE1)
  )

  (defun get-price:decimal ()
    @doc "Retrieve the current price based on the current phase"
      (with-read fees (current-phase) {'price:=price}
      price)
  )

  (defun transfer-amount:decimal ()
    @doc "Compute the amount to transfer to the treasury"
   (with-read fees PHASE0 {'price:=p0t, 'count:=p0c}
    (with-read fees PHASE1 {'price:=p1t, 'count:=p1c}
      (+ (* p0t (dec p0c)) (* p1t (dec p1c)))))
  )

  (defun set-price:string (phase:string price:decimal)
    @doc "Set the price for a given phase"
      
     (enforce (or? (= PHASE0) (= PHASE1) phase) "Invalid phase")
      (with-capability (SALES-OPERATOR)
     (enforce (< (now) PHASE-0-START) "Price can only be updated Before phase 0 begins")
     (write fees phase {'price:price, 'count:0})
      )
     (format "Price for phase {} set to {}" [phase price])
  )

  (defun -safe:integer (x:integer y:integer)
    @doc "Substract 2 integers, return 0 in case of negative result "
    (if (>= x y) (- x y) 0))

  (defun enforce-available-for-reservation:bool ()
    @doc "Verify that new accounts can reserve"
    (with-read global-counters "" {'sold:=sold, 'reserved:=reserved}
      (enforce (< (+ sold reserved) TOTAL-BATCHES) "No tokens are available for reservation"))
  )

  (defun available-for-free-sales:integer ()
    @doc "Returns the number of batches still available for sale"
    (with-read global-counters "" {'sold:=sold, 'reserved:=reserved}
      (cond
        ((in-phase-1) (-safe TOTAL-BATCHES sold))
        0))
  )

  (defun available-batches:integer (account:string)
    @doc "Returns the number of batches available for purchase by an account"
    (with-read global-counters "" {'sold:=global-sold}
      (let ((global-available (- TOTAL-BATCHES global-sold)))
        (if (in-phase-0)
          (with-default-read accounts-table account {'reserved:0, 'bought:0} {'reserved:=reserved, 'bought:=bought}
            (min-int (- reserved bought) global-available))
          global-available)))
  )

  (defun min-int:integer (x:integer y:integer)
    @doc "Returns the minimum of two integers"
    (if (< x y) x y)
  )

  (defun enforce-at-least-one-for-sale:bool ()
    @doc "Verify that at least 1 token is for sale"
    (let ((afr (available-for-free-sales)))
      (enforce (> afr 0) "No tokens for sale"))
  )

  (defun has-reservation:bool (account:string)
    @doc "Verify that the account has reserved a batch"
    (enforce (in-phase-0) "No Reservation found")
          (with-default-read accounts-table account {'reserved:0, 'bought:0} {'reserved:=reserved, 'bought:=bought}
            (and (< bought reserved) (> reserved 0)))
  )

  (defun enforce-has-reservation:bool (account:string)
    (let ((hr (has-reservation account)))
      (enforce hr "Account has no reservation")))

  (defun to-token-amount:decimal (x:integer)
    @doc "Convert a batch count to the token amount"
    (* (dec x) AMOUNT-PER-BATCH))

  (defun distribute-to-account:string (account:string)

    (with-read accounts-table account {'prev-account:=prev-account, 'bought:=bought}
     
     (require-capability (RESERVE))
        (install-capability (${moduleName}.TRANSFER RESERVE-ACCOUNT account (to-token-amount bought))) ;; Variable
        (${moduleName}.transfer RESERVE-ACCOUNT account (to-token-amount bought)) ;; Variable

      ; here we just emit an event
      (emit-event (TOKEN-DISTRIBUTED account bought))

      ; And most important return the linked account
      prev-account)
  )

  (defun check-distribute-to-account:string (account:string  _:integer)
  ; Check that if we reached the head of the list => In this case we do nothing,
  ; Otherwise do the distribution
  (require-capability (SALES-OPERATOR))

  (if (= account HEAD)
      HEAD
      (distribute-to-account account))
  )

  ;-----------------------------------------------------------------------------
  ; Public functions
  ;-----------------------------------------------------------------------------
  (defun reserve-batch:string (account:string)
    @doc "Reserve a batch for a given account"
    (enforce (in-phase-0) "Reservation can only be done in Phase 0")
    (enforce-available-for-reservation)

    ; Check that this is the first reservation for this account
    (with-default-read accounts-table account {'reserved:0, 'bought:0} {'reserved:=reserved, 'bought:=bought}
      (enforce (and (= 0 bought) (= 0 reserved)) "Only 1 reservation entry per account"))

    (with-capability (SALES-OPERATOR)
      ; Increment the reservation count
      (with-read global-counters "" {'reserved:=x}
        (update global-counters "" {'reserved: (+ x P0-RESERVED)}))
      ; And update the account
      (write accounts-table account {'account:account,
                                     'reserved:P0-RESERVED, ;; Needed for update
                                     'bought:0,
                                     'prev-account: ""}
                                     ))
  )

  (defun buy:string (account:string guard:guard amount:integer)
    @doc "Buy batches for an account. Guard is used to create the Token account"
    (enforce (not (ended)) "Pre-sales have ended")
    (enforce (> amount 0) "Amount must be greater than 0")

    ; Two possibilities: either
      ;  - The account has reservation
      ;  - or there is some batch left
      (enforce-one "Not possible to buy: Sorry" [(enforce-has-reservation account)
        (enforce-at-least-one-for-sale)])
    
    (with-default-read tail-table "" {'tail-account:HEAD} {'tail-account:=tail-account}
      (with-default-read accounts-table account {'bought:0, 'reserved:0, 'prev-account:""} 
      {'bought:=bought, 'reserved:=reserved, 'prev-account:=prev-account}
        
        (enforce (or (in-phase-1) (<= (+ bought amount) reserved)) "Cannot buy more than Available")
        
      ; Calculate available batches
      (let (
        (available-global (with-read global-counters "" {'sold:=sold} (- TOTAL-BATCHES sold)))
        (to-buy (if (in-phase-0) 
                  (min-int amount (- reserved bought))
                  (min-int amount available-global)))
            )
        (enforce (> to-buy 0) "No batches available to buy")

        ; Update account
        (write accounts-table account {
          'account: account,
          'bought: (+ bought to-buy),
          'reserved: (if (in-phase-0) reserved 0),
          'prev-account: (if (= prev-account "") tail-account prev-account)
        })

        ; We update the tail in case the account is a new record
        (write tail-table "" {'tail-account: (if (= prev-account "") account tail-account)})

        ; Update global counters
        (with-read global-counters "" {'sold:=sold, 'reserved:=global-reserved, 'accounts:=accounts}
          (let ((is-new-account (= prev-account "")))
            (update global-counters "" {
            'sold: (+ sold to-buy),
            'reserved: (if (in-phase-0) (- global-reserved to-buy) 0),
            'accounts: (if is-new-account (+ accounts 1) accounts)
          })))

        ; Update fee table
        (with-read fees (current-phase) {'count:=count}
          (update fees (current-phase) {'count:(+ count to-buy)}))

        ; Create the token account if it doesn't exist
        (if (not (account-exist account))
            (${moduleName}.create-account account guard) ;;Variable
            "")

      ; Transfer KDAs
      (coin.transfer-create account SALES-ACCOUNT SALES-GUARD (* (get-price) (dec to-buy))))))
  )

  (defun distribute-tokens:string ()
    @doc "This function is supposed to be called by the token issuer several times"
    
    (enforce (ended) "Pre-sales are not ended")

    (with-read tail-table "" {'tail-account:=tail}
      (enforce (!= tail HEAD) "All accounts already got their tokens")

      ; We call iteratively the (distribute-to-account) function and then update the tail with the next account to
      ; be handled for the next round
      (with-capability (SALES-OPERATOR)
        (update tail-table ""
          {'tail-account: (fold (check-distribute-to-account) tail (enumerate 1 MAX-PER-ROUND))}))
    )
  )

  (defun end-sales:string ()
    @doc "Definitively end the sales and close the contract"
    (enforce (ended) "Pre-sales are not ended")
    (with-default-read tail-table "" {'tail-account:HEAD} {'tail-account:=tail-account}
          (enforce (= tail-account HEAD) "Tokens have not been distributed yet"))

    (with-capability (SALES-OPERATOR)
      
      (with-read global-counters "" {'sold:=sold}
        ; burn tokens (if not all sold)
        (if (< sold TOTAL-BATCHES)
            (with-capability (RESERVE)
              (install-capability (${moduleName}.TRANSFER RESERVE-ACCOUNT ${burnNamespace}.burn.BURN-ACCOUNT (to-token-amount (- TOTAL-BATCHES sold)))) ;; Variable
              (${moduleName}.transfer-create RESERVE-ACCOUNT ${burnNamespace}.burn.BURN-ACCOUNT ${burnNamespace}.burn.BURN-GUARD (to-token-amount (- TOTAL-BATCHES sold)))) ;; Variable
            "")

      ; Transfer the income (in KDA) to treasury (for DEX liquidity)
      (with-capability (SALES-INCOME)
        (install-capability (coin.TRANSFER SALES-ACCOUNT ${moduleName}-treasury.LIQUIDITY-ACCOUNT (transfer-amount))) ;; Variable
        (coin.transfer-create SALES-ACCOUNT ${moduleName}-treasury.LIQUIDITY-ACCOUNT ${moduleName}-treasury.LIQUIDITY-GUARD (transfer-amount)))) ;; Variable
      "Pre-sales ended")
  )

  (defun init:string (p0:decimal p1:decimal)
    (with-capability (GOVERNANCE)
      (insert global-counters "" {'sold:0, 'reserved:0, 'accounts:0})
      (insert fees "phase-0" {'price:p0, 'count:0})
      (insert fees "phase-1" {'price:p1, 'count:0})
      )
    "Sales counters initialized"
  )

  ;-----------------------------------------------------------------------------
  ; Local callable functions
  ;-----------------------------------------------------------------------------
  (defun get-counters ()
    @doc "Returns the counters: sold, reserved and accounts"
    (read global-counters "")
  )

  (defun get-distribution-rounds-needed:integer ()
    @doc "Returns the number of distribution rounds needed"
    (with-read global-counters "" {'accounts:=accounts}
      (let ((rounds (/ accounts MAX-PER-ROUND))
            (remainder (mod accounts MAX-PER-ROUND)))
        (if (> remainder 0)
            (+ rounds 1)
            rounds)))
  )

  (defun get-reservations:[object{presale-account-sch}] ()
    @doc "Returns the list of reservations"
    (if  (in-phase-0)
        (select accounts-table (where 'reserved (< 0)))
        [])
  )

  (defun get-account-sales (account:string)
    @doc "Returns the sales for a given account"
   (at 'bought (read accounts-table account))
  )

  (defun get-sales ()
    @doc "Return the list of sold batch"
    (let (
        (p0 (at 'count (get-data-with-phases PHASE0)))
        (p1 (at 'count (get-data-with-phases PHASE1)))
          ) 
        (+ p0 p1)  
    )
  )

  (defun get-p0-price:decimal ()
    @doc "Retrieve all prices"
    (with-read fees PHASE0 {'price:=price}
      price)
  )

  (defun get-p1-price:decimal ()
    @doc "Retrieve all prices"
    (with-read fees PHASE1 {'price:=price}
      price)
  )

  (defun get-data-with-phases:object (p:string)
    @doc "Retrieve all prices"
    (read fees p)
  )

)

(create-table global-counters)
(create-table accounts-table)
(create-table fees)
(create-table tail-table)
(init ${formattedPhase0Price} ${formattedPhase1Price})
`;
};
