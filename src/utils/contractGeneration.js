/**
 * Contract generation utilities for sales and treasury contracts
 */

export const generateNamespaceAndKeyset = (namespace) => {
  const ns = `(define-namespace (ns.create-principal-namespace (read-keyset "ks")) (read-keyset "ks") (read-keyset "ks"))`;
  const n = `(namespace '${namespace})`;
  const keys = `(define-keyset "${namespace}.gov" (read-keyset "ks"))`;
  
  return { ns, n, keys };
};

export const generateSalesContract = (moduleName, namespace, salesDetails) => {
  const keys = `(define-keyset "${namespace}.sales-operator" (read-keyset "ks"))`;
  
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

  const formattedAmountPerBatch = formatDecimal(salesDetails.amountPerBatch || salesDetails.tokensPerBatch || 0);
  const formattedPhase0Price = formatDecimal(salesDetails.phase0Price || salesDetails.phase0price || 0);
  const formattedPhase1Price = formatDecimal(salesDetails.phase1Price || 0);
  const formattedWhitelistLimit = Number(salesDetails.whitelistLimit || 0);
  
  const formattedPhase0Start = formatDateTime(salesDetails.phase0StartDate || salesDetails.phase0startDate);
  const formattedPhase1Start = formatDateTime(salesDetails.phase1StartDate);
  const formattedEndSales = formatDateTime(salesDetails.salesEndDate);

  return `(namespace '${namespace})
${keys}

(module ${moduleName}-sales GOVERNANCE
  (use free.util-time)
  (use free.util-math)

  ;-----------------------------------------------------------------------------
  ; Administrative and ops capabilities
  ;-----------------------------------------------------------------------------
  (defcap GOVERNANCE ()
    (enforce-keyset "${namespace}.gov"))

  (defcap SALES-OPERATOR ()
    (enforce-keyset "${namespace}.sales-operator")
    (compose-capability (RESERVE))
    )

  ;-----------------------------------------------------------------------------
  ; Constants
  ;-----------------------------------------------------------------------------
  (defconst TOTAL-BATCHES:integer ${salesDetails.totalBatches || 1} @doc "Number of Batches to sell")

  (defconst P0-RESERVED:integer ${formattedWhitelistLimit} @doc "Number of tokens that Whitelist can purchase")

  (defconst AMOUNT-PER-BATCH:decimal ${formattedAmountPerBatch} 
    @doc "Number of tokens per batch Total Batches * Amount-Per-Batch = total sale")

  (defconst PHASE0:string "phase-0" @doc "Whitelist Phase")

  (defconst PHASE1:string "phase-1" @doc "Public Sales Phase")

  (defconst PHASE0-PRICE:decimal ${formattedPhase0Price} @doc "Phase 0 token price")

  (defconst PHASE1-PRICE:decimal ${formattedPhase1Price} @doc "Phase 1 token price")

  (defconst PHASE0-START:time (time "${formattedPhase0Start}") @doc "Phase 0 start time")

  (defconst PHASE1-START:time (time "${formattedPhase1Start}") @doc "Phase 1 start time")

  (defconst END-SALES:time (time "${formattedEndSales}") @doc "Sales end time")

  ;-----------------------------------------------------------------------------
  ; Storage
  ;-----------------------------------------------------------------------------
  (defschema sales-account-schema
    @doc "Schema for sales account balances"
    balance:decimal
    guard:guard
  )

  (deftable sales-accounts:{sales-account-schema})

  (defschema batch-schema
    @doc "Schema for batch tracking"
    batch-id:integer
    tokens-sold:decimal
    phase:string
  )

  (deftable batches:{batch-schema})

  ;-----------------------------------------------------------------------------
  ; Capabilities
  ;-----------------------------------------------------------------------------
  (defcap RESERVE ()
    @doc "Capability for token reservation"
    true
  )

  (defcap BUY (account:string amount:decimal phase:string)
    @doc "Capability for token purchase"
    @event
    (enforce (> amount 0.0) "Amount must be positive")
    (enforce (!= account "") "Account cannot be empty")
  )

  ;-----------------------------------------------------------------------------
  ; Functions
  ;-----------------------------------------------------------------------------
  (defun buy-tokens:string (account:string guard:guard amount:decimal)
    @doc "Buy tokens in current phase"
    (let* 
      (
        (current-time (at 'block-time (chain-data)))
        (current-phase (get-current-phase current-time))
        (price (get-phase-price current-phase))
        (cost (* amount price))
      )
      (with-capability (BUY account amount current-phase)
        (coin.transfer account "${namespace}.${moduleName}-treasury" cost)
        (write sales-accounts account {
          "balance": amount,
          "guard": guard
        })
        (format "Purchased {} tokens for {} KDA in {}" [amount cost current-phase])
      )
    )
  )

  (defun get-current-phase:string (current-time:time)
    @doc "Get current sales phase"
    (cond
      ((< current-time PHASE0-START) "pre-sale")
      ((and (>= current-time PHASE0-START) (< current-time PHASE1-START)) PHASE0)
      ((and (>= current-time PHASE1-START) (< current-time END-SALES)) PHASE1)
      "ended"
    )
  )

  (defun get-phase-price:decimal (phase:string)
    @doc "Get price for current phase"
    (cond
      ((= phase PHASE0) PHASE0-PRICE)
      ((= phase PHASE1) PHASE1-PRICE)
      0.0
    )
  )

  (defun get-sales-info:object ()
    @doc "Get sales contract information"
    {
      "total-batches": TOTAL-BATCHES,
      "amount-per-batch": AMOUNT-PER-BATCH,
      "phase0-price": PHASE0-PRICE,
      "phase1-price": PHASE1-PRICE,
      "phase0-start": PHASE0-START,
      "phase1-start": PHASE1-START,
      "end-sales": END-SALES,
      "whitelist-limit": P0-RESERVED
    }
  )
)

(create-table sales-accounts)
(create-table batches)`;
};

export const generateTreasuryContract = (moduleName, namespace, salesDetails) => {
  const keys = `(define-keyset "${namespace}.operator" (read-keyset "ks"))`;

  return `(namespace '${namespace})
${keys}

(module ${moduleName}-treasury GOVERNANCE
  (use free.util-math)
  (use free.util-time)

  ;-----------------------------------------------------------------------------
  ; Administrative and ops capabilities
  ;-----------------------------------------------------------------------------
  (defcap GOVERNANCE ()
    (enforce-keyset "${namespace}.gov"))

  (defcap OPERATOR ()
    (enforce-keyset "${namespace}.operator"))

  (defcap OPERATE-TREASURY ()
    (compose-capability (OPERATOR))
    (compose-capability (TREASURY)))

  ;-----------------------------------------------------------------------------
  ; Caps and internal accounts management
  ;-----------------------------------------------------------------------------
  (defcap TREASURY () true)
  (defconst TREASURY-GUARD (create-capability-guard (TREASURY)))
  (defconst TREASURY-ACCOUNT (create-principal TREASURY-GUARD))

  ;-----------------------------------------------------------------------------
  ; Schemas and Tables
  ;-----------------------------------------------------------------------------
  (defschema treasury-management-sch
    kda-balance:decimal
    token-balance:decimal
    total-received:decimal
    init:bool
  )

  (deftable treasury-management:{treasury-management-sch})

  ;-----------------------------------------------------------------------------
  ; Utility functions
  ;-----------------------------------------------------------------------------
  (defun div:decimal (num:decimal den:decimal)
    @doc "Divide and limit numbers of decimal (gas optimisation)"
    (floor (/ num den) 24))

  (defun current-kda-balance:decimal ()
    @doc "Return current KDA balance in treasury"
    (coin.get-balance TREASURY-ACCOUNT))

  (defun current-token-balance:decimal ()
    @doc "Return current token balance in treasury"
    (${namespace}.${moduleName}.get-balance TREASURY-ACCOUNT))

  (defun get-treasury-info:object ()
    @doc "Get treasury information"
    (try 
      {"kda-balance": 0.0, "token-balance": 0.0, "total-received": 0.0, "init": false}
      (read treasury-management "main")))

  ;-----------------------------------------------------------------------------
  ; Core Functions
  ;-----------------------------------------------------------------------------
  (defun init ()
    @doc "Initialize treasury"
    (with-capability (GOVERNANCE)
      (insert treasury-management "main" {
        "kda-balance": 0.0,
        "token-balance": 0.0,
        "total-received": 0.0,
        "init": true
      })))

  (defun receive-kda:string (amount:decimal)
    @doc "Receive KDA from sales"
    (with-capability (TREASURY)
      (let ((current-info (get-treasury-info)))
        (update treasury-management "main" {
          "kda-balance": (+ (at "kda-balance" current-info) amount),
          "total-received": (+ (at "total-received" current-info) amount)
        })
        (format "Received {} KDA" [amount]))))

  (defun withdraw-kda:string (account:string amount:decimal)
    @doc "Withdraw KDA from treasury"
    (with-capability (OPERATE-TREASURY)
      (let ((current-info (get-treasury-info)))
        (enforce (>= (at "kda-balance" current-info) amount) "Insufficient KDA balance")
        (coin.transfer TREASURY-ACCOUNT account amount)
        (update treasury-management "main" {
          "kda-balance": (- (at "kda-balance" current-info) amount)
        })
        (format "Withdrawn {} KDA to {}" [amount account]))))

  (defun withdraw-tokens:string (account:string amount:decimal)
    @doc "Withdraw tokens from treasury"
    (with-capability (OPERATE-TREASURY)
      (let ((current-info (get-treasury-info)))
        (enforce (>= (at "token-balance" current-info) amount) "Insufficient token balance")
        (${namespace}.${moduleName}.transfer TREASURY-ACCOUNT account amount)
        (update treasury-management "main" {
          "token-balance": (- (at "token-balance" current-info) amount)
        })
        (format "Withdrawn {} tokens to {}" [amount account]))))

  (defun add-liquidity:string (kda-amount:decimal token-amount:decimal)
    @doc "Add liquidity to DEX (placeholder)"
    (with-capability (OPERATE-TREASURY)
      (format "Added liquidity: {} KDA, {} tokens" [kda-amount token-amount])))

  (defun get-treasury-account:string ()
    @doc "Get treasury account"
    TREASURY-ACCOUNT)
)

(create-table treasury-management)`;
};

export const generateCompleteContracts = (tokenDetails, salesDetails) => {
  const { contractAddress } = tokenDetails;
  const [namespace, moduleName] = contractAddress.split('.');
  
  const salesContract = generateSalesContract(moduleName, namespace, salesDetails);
  const treasuryContract = generateTreasuryContract(moduleName, namespace, salesDetails);
  
  return {
    salesContract,
    treasuryContract,
    moduleName,
    namespace: namespace
  };
};
