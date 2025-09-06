(module staking GOVERNANCE
  (defcap GOVERNANCE ()
    (enforce-keyset "STAKE_NS.gov"))

; Data Structures

(defschema token-lock-schema
  @doc "Key is account"
  account:string
  guard:guard
  total:decimal
  unlockDate:time
)

(defschema total-tokens-schema
  @doc "Key is TKEY"
  total:decimal
)

(deftable token-lock:{token-lock-schema})
(deftable total-tokens:{total-tokens-schema})

; Capabilities

(defcap VERIFY-LOCKER (account:string)
  (compose-capability (LOCKER account)))

(defcap UPDATES ()
    @doc "Internal Capability for updating the total tokens"
  true)

; Event Caps

(defcap ADD-TK (account:string amount:decimal total:decimal unlock:time) @event true)

(defcap REMOVE-TK (account:string amount:decimal total:decimal) @event true)

; Locker Account

(defcap LOCKER (account:string)
  @doc "cap for locker guard"
  (enforce-guard (at 'guard (read token-lock account))))

(defun req-LOCKER (account:string)
(require-capability (LOCKER account)))

(defun LOCKER-guard ( account:string)
  (create-user-guard (req-LOCKER account)))

(defun get-LOCKER-account ( account:string)
  (create-principal (LOCKER-guard account)))

; Constants

(defconst YEAR:integer 31536000) ; 1 year in seconds
(defconst TKEY "tokenLocked")
(defconst EPOCH (time "1970-01-01T00:00:00Z"))

; Tier thresholds
(defconst TIER1:decimal 50000.0)
(defconst TIER2:decimal 150000.0)
(defconst TIER3:decimal 350000.0)

; Penalty constants
(defconst PENALTY_DAYS:integer 365)
(defconst DAILY_PENALTY_REDUCTION:decimal 0.00273972602) ; 1/365 for linear decay

; Main Functions

(defun lock-tokens:string (account:string guard:guard amount:decimal)
  @doc "Lock Tokens in a user guarded account"
  (let ((locker-account (get-LOCKER-account account))
        (lg (LOCKER-guard account)))

  (enforce (>= amount 0.0) "Amount must be positive")
;    (enforce (is-principal account) "Must be a principal Account")

  (with-default-read token-lock account
    { 'account: "", 'guard: guard, 'total: 0.0,  'unlockDate: EPOCH }
    { 'account:= acct, 'guard:= g, 'total:= total, 'unlockDate:= ud }
    (enforce (= guard g) "guards must match")
    (write token-lock account {'account: account, 'guard: g, 'total: (+ total amount), 'unlockDate: (if (= 0.0 total) (add-time (now) YEAR) ud)})
      (emit-event (ADD-TK account amount (+ total amount) (now))))

  (with-capability (UPDATES)
    (update-tokens amount))

  (token1.transfer-create account locker-account lg amount) ; REPLACE token1
  )
)

(defun remove-tokens:bool (account:string amount:decimal)
  @doc "Remove tokens from lockup with penalty calculation"
  (let ((locker-account (get-LOCKER-account account)))

  (enforce (>= amount 0.0) "Amount must be positive")

  (with-read token-lock account { 'account:= acct, 'total:= total, 'unlockDate:= ud }
  (enforce (>= total amount) "Not enough tokens in lockup")
  (enforce (= account acct) "Not authorized to withdraw")

  ;; Calculate lock date (unlock date minus 1 year)
  (let ((lock-date (add-time ud (- YEAR)))
         (penalty-data (calculate-penalty amount lock-date))
         (return-amount (floor (at 'return-amount penalty-data) 12))
         (penalty-amount (floor (at 'penalty-amount penalty-data) 12)))

    ;; Update the lock with reduced amount
    (with-capability (VERIFY-LOCKER account)
      (update token-lock account {'total: (- total amount)})

    ;; Transfer return amount to user
    (if (> return-amount 0.0)
      (do
        (install-capability (token1.TRANSFER locker-account account return-amount))
        (token1.transfer locker-account account return-amount))
      "No tokens to return") ; REPLACE token1

    ;; Transfer penalty amount to treasury
    (if (> penalty-amount 0.0)
      (do
        (install-capability (token1.TRANSFER locker-account "treasury" penalty-amount))
        (token1.transfer locker-account "treasury" penalty-amount))
      "No penalty applied"))) ; REPLACE WITH transfer-create and use the burn contract.  user.burn.BURN-ACCOUNT and ...BURN-GUARD

    ;; Update total tokens
    (with-capability (UPDATES)
      (decrement-tokens amount))

    (emit-event (REMOVE-TK account amount (- total amount))))))

; Internal Functions

(defun update-tokens (amount:decimal)
    @doc "Update total tokens account"
    (require-capability (UPDATES))
    (with-default-read total-tokens TKEY { 'total: 0.0 } { 'total:= total }
      (enforce (> amount 0.0) "Amount must be positive")

        (write total-tokens TKEY {'total: (+ total amount)})))

(defun decrement-tokens (amount:decimal)
    @doc "Remove total tokens"
    (require-capability (UPDATES))
    (with-default-read total-tokens TKEY { 'total: 0.0 } { 'total:= total }
      (enforce (> amount 0.0) "Amount must be positive")

    (let ((tl (- total amount)))
        (enforce (>= tl 0.0) "Total tokens can't be negative")
        (write total-tokens TKEY {'total: tl}))))

; Helper Functions

(defun now:time ()
  @doc "Get the current date"
  (at 'block-time (chain-data)))

(defun calculate-penalty (amount:decimal lock-date:time)
  @doc "Calculate penalty and return amount for early withdrawal"
  (let ((seconds-staked (diff-time (now) lock-date))
         (days-staked-int (floor (/ seconds-staked 86400.0)))
         (days-capped-int (if (>= days-staked-int PENALTY_DAYS) PENALTY_DAYS days-staked-int))
         (penalty-percent (if (>= days-staked-int PENALTY_DAYS)
                            0.0
                            (- 1.0 (* (dec days-capped-int) DAILY_PENALTY_REDUCTION))))
         (penalty-amount (* amount penalty-percent))
         (return-amount (- amount penalty-amount)))
    { 'days-staked: days-staked-int
    , 'penalty-percent: penalty-percent
    , 'penalty-amount: penalty-amount
    , 'return-amount: return-amount
    , 'is-mature: (>= days-staked-int PENALTY_DAYS)
    }))

(defun get-lockup (account:string)
  @doc "Return lockup data for an account"
 (read token-lock account))

(defun get-total-count ()
  @doc "Return total tokens"
  (read total-tokens TKEY))

(defun get-lockups ()
  (keys token-lock))

(defun get-tier-data ()
  @doc "Get all staking accounts with their totals"
  (fold-db token-lock (lambda (k obj) (> (at 'total obj) 0.0))
    (lambda (account obj)
      { 'account: account
      , 'total: (at 'total obj)
      })))

(defun get-accounts-by-tier ()
  @doc "Get accounts grouped by staking tiers (mutually exclusive)"
  (let ((all-data (fold-db token-lock (lambda (k obj) (> (at 'total obj) 0.0))
                    (lambda (account obj)
                      { 'account: account, 'total: (at 'total obj) }))))
    { 'tier-1: (filter (lambda (obj) (and (>= (at 'total obj) TIER1) (< (at 'total obj) TIER2))) all-data)
    , 'tier-2: (filter (lambda (obj) (and (>= (at 'total obj) TIER2) (< (at 'total obj) TIER3))) all-data)
    , 'tier-3: (filter (lambda (obj) (>= (at 'total obj) TIER3)) all-data)
    }))

(defun get-staker-count:integer ()
  @doc "Get total number of stakers"
  (length (keys token-lock)))

)