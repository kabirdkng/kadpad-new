(module protocol-treasury GOV
  @doc "Protocol-owned liquidity management across DEXs"

(use free.util-time)

(defcap GOV ()
  (enforce-keyset "PROTOCOL_NS.GOV"))

;; Schemas

(defschema protocol-position
  @doc "Protocol-owned LP position"
  project-token:module{fungible-v2}
  token0:module{fungible-v2}
  token1:module{fungible-v2}
  lp-token:string
  dex-name:string
  amount:decimal
  is-transferable:bool
  locked-time:time
  project-keyset:keyset)

(deftable positions:{protocol-position})

(defschema position-tracker
  @doc "Track position index for each user"
  position:integer)

(deftable position-trackers:{position-tracker})

(defschema transfer-request
  @doc "Multi-sig transfer request for LP migration"
  target-dex:string
  amount:decimal
  requester:string
  project-signed:bool
  vault-signed:bool
  request-time:time
  executed:bool)

(deftable transfer-requests:{transfer-request})

;; Capabilities

(defcap PROJECT_SIGN (position-key:string)
  @doc "Project owner signature capability"
  (with-read positions position-key
    {"project-keyset" := keyset}
    (enforce-keyset keyset)))

(defcap VAULT_SIGN ()
  @doc "Vault operator signature capability"
  (enforce-keyset "PROTOCOL_NS.VAULTSIGNER"))

(defcap REMOVE_LIQUIDITY () true)

(defcap ADD_LIQUIDITY () true)

;; DEX Constants
(defconst DEX_ECKO "ecko")
(defconst DEX_SUSHI "sushi")

;; Account for temporary token holding during migration (position-specific)
(defcap MIGRATION (position-key:string)
  @doc "Position-specific migration capability"
  true)

;; Account for holding LP tokens (position-specific)
(defcap LIQUIDITY (position-key:string)
  @doc "Position-specific liquidity capability"
  true)

;; Helper Functions

(defun create-liquidity-guard:guard (position-key:string)
  @doc "Create a capability guard for a specific position's liquidity"
  (create-capability-guard (LIQUIDITY position-key)))

(defun get-liquidity-account:string (position-key:string)
  @doc "Get the liquidity account for a specific position"
  (create-principal (create-liquidity-guard position-key)))

(defun create-migration-guard:guard (position-key:string)
  @doc "Create a capability guard for a specific position's migration"
  (create-capability-guard (MIGRATION position-key)))

(defun get-migration-account:string (position-key:string)
  @doc "Get the migration account for a specific position"
  (create-principal (create-migration-guard position-key)))

(defun remove-liquidity-by-dex (dex-name:string token0:module{fungible-v2} token1:module{fungible-v2} amount:decimal position-key:string)
  @doc "Remove liquidity from specific DEX - LP comes from position's liquidity account, tokens go to position's migration account"
  (require-capability (LIQUIDITY position-key))
  (enforce-s-dex dex-name)
  (let ((liquidity-account (get-liquidity-account position-key))
        (migration-account (get-migration-account position-key))
        (migration-guard (create-migration-guard position-key)))

    (with-capability (REMOVE_LIQUIDITY)
      (dex-remove-liquidity dex-name token0 token1 amount liquidity-account migration-account migration-guard))))

(defun add-liquidity-by-dex:decimal (dex-name:string token0:module{fungible-v2} token1:module{fungible-v2} amount0:decimal amount1:decimal position-key:string)
  @doc "Add liquidity to specific DEX - LP goes to position's liquidity account, returns liquidity amount"
  (enforce-s-dex dex-name)
  (let ((liquidity-account (get-liquidity-account position-key))
        (liquidity-guard (create-liquidity-guard position-key))
        (migration-account (get-migration-account position-key)))

    (with-capability (ADD_LIQUIDITY)
      (at "liquidity" (dex-add-liquidity dex-name token0 token1 amount0 amount1 migration-account liquidity-account liquidity-guard)))))

;; Functions

(defun lock-protocol-lp
  ( project-token:module{fungible-v2}
    user:string
    token0:module{fungible-v2}
    token1:module{fungible-v2}
    lp-token:string
    dex-name:string
    amount:decimal
    is-transferable:bool
    project-keyset:keyset
  )
  @doc "Lock LP tokens as protocol-owned - transfers LP to position-specific liquidity account"
  (enforce-s-dex dex-name)
  (with-default-read position-trackers (tracker-key project-token user)
    {"position": 0}
    {"position":= current-position}

      (let ((position-key (format-position-key project-token user current-position))
            (liquidity-account (get-liquidity-account (format-position-key project-token user current-position)))
            (liquidity-guard (create-liquidity-guard (format-position-key project-token user current-position))))

      ; Transfer LP tokens from user to position-specific liquidity account
      (if (= dex-name DEX_ECKO)
          (DEX_NS.tokens.transfer-create lp-token user liquidity-account liquidity-guard amount)
          (SUSHI_NS.tokens.transfer-create lp-token user liquidity-account liquidity-guard amount))
      ; Insert the new position
      (insert positions position-key
        { "project-token": project-token
        , "token0": token0
        , "token1": token1
        , "lp-token": lp-token
        , "dex-name": dex-name
        , "amount": amount
        , "is-transferable": is-transferable
        , "locked-time": (now)
        , "project-keyset": project-keyset
        })

      ; Update the tracker for next position
      (write position-trackers (tracker-key project-token user)
        {"position": (+ current-position 1)})

      (format "Locked {} LP for {} at position {}" [amount project-token position-key]))))

(defun create-transfer-request:string (position-key:string target-dex:string amount:decimal)
  @doc "Create request to transfer LP to different DEX (requires project signature)"
    (with-capability (PROJECT_SIGN position-key)
      (with-read positions position-key
        { "amount" := available
        , "is-transferable" := transferable }

        (enforce transferable "This LP is not transferable")
        (enforce (<= amount available) "Insufficient LP balance")

        (let ((request-id (format "{}:{}:{}" [position-key target-dex (now)])))

          (insert transfer-requests request-id
            { "target-dex": target-dex
            , "amount": amount
            , "requester": position-key
            , "project-signed": true  ; Already signed via PROJECT_SIGN capability
            , "vault-signed": false
            , "request-time": (now)
            , "executed": false
            })

          request-id))))

(defun sign-transfer-vault:string (request-id:string)
  @doc "Vault operator signs and executes transfer"
  (with-capability (VAULT_SIGN)
    (with-read transfer-requests request-id
      { "executed" := executed
      , "project-signed" := p-signed
      , "target-dex" := target-dex
      , "requester" := position-key }

      (enforce (not executed) "Request already executed")
      (enforce p-signed "Project must sign first")

      (update transfer-requests request-id
        { "vault-signed": true
        , "executed": true })

      ; Execute migration immediately after vault signs
      (migrate-lp position-key target-dex))))

(defun migrate-lp:string (position-key:string target-dex:string)
  @doc "Atomic LP migration between DEXs"
  (require-capability (VAULT_SIGN))
  (with-read positions position-key
    { "token0" := token0:module{fungible-v2}
    , "token1" := token1:module{fungible-v2}
    , "dex-name" := current-dex
    , "lp-token" := lp-token
    , "amount" := lp-amount }
    (enforce-m-dex current-dex target-dex)
    (let ((liquidity-account (get-liquidity-account position-key)))
      ; LP should already be in position's liquidity account from lock-protocol-lp
      ; Install capability for LP transfer from position's liquidity account to pair account
      (dex-lp-transfer-cap current-dex lp-token liquidity-account (get-pair-account current-dex token0 token1) lp-amount)

      (with-capability (LIQUIDITY position-key)
        ; Remove from old DEX (LP from position's liquidity account, tokens go to position's migration account)
        (remove-liquidity-by-dex current-dex token0 token1 lp-amount position-key)))

    ; Get token balances from position's migration account
    (let ((migration-account (get-migration-account position-key))
          (bal0 (token0::get-balance migration-account))
          (bal1 (token1::get-balance migration-account))
          (pair-account (get-pair-account target-dex token0 token1)))

      ; Install capabilities for transferring tokens from migration account to pair account
      (install-capability (token0::TRANSFER migration-account pair-account bal0))
      (install-capability (token1::TRANSFER migration-account pair-account bal1))

      (with-capability (MIGRATION position-key)
        ; Add to new DEX (new LP goes to position's liquidity account)
        (let ((new-lp (add-liquidity-by-dex target-dex token0 token1 bal0 bal1 position-key))
              (liquidity-account (get-liquidity-account position-key)))

          ; Sweep any leftover tokens from migration account to liquidity account
          (let ((remaining0 (token0::get-balance migration-account))
                (remaining1 (token1::get-balance migration-account))
                (liquidity-guard (create-liquidity-guard position-key)))
            (if (> remaining0 0.0)
              (do
                (install-capability (token0::TRANSFER migration-account liquidity-account remaining0))
                (token0::transfer-create migration-account liquidity-account liquidity-guard remaining0))
              "")
            (if (> remaining1 0.0)
              (do
                (install-capability (token1::TRANSFER migration-account liquidity-account remaining1))
                (token1::transfer-create migration-account liquidity-account liquidity-guard remaining1))
              ""))

          ; Update position with new LP amount
          (update positions position-key
            { "dex-name": target-dex
            , "amount": new-lp })

          (format "Migrated {} LP to {}" [new-lp target-dex]))))))

;; Helper Functions

(defun ecko-pair (token0:module{fungible-v2} token1:module{fungible-v2})
  @doc "Get pair from Ecko DEX"
  (DEX_NS.exchange.get-pair-by-key (DEX_NS.exchange.get-pair-key token0 token1)))

(defun sushi-pair (token0:module{fungible-v2} token1:module{fungible-v2})
  @doc "Get pair from Sushi DEX"
  (SUSHI_NS.exchange.get-pair-by-key (SUSHI_NS.exchange.get-pair-key token0 token1)))

(defun ecko-reserves:[decimal] (token0:module{fungible-v2} token1:module{fungible-v2})
  @doc "Get reserves from Ecko DEX"
  (let ((pair (ecko-pair token0 token1)))
    [(DEX_NS.exchange.reserve-for pair token0)
      (DEX_NS.exchange.reserve-for pair token1)]))

(defun sushi-reserves:[decimal] (token0:module{fungible-v2} token1:module{fungible-v2})
  @doc "Get reserves from Sushi DEX"
  (let ((pair (sushi-pair token0 token1)))
    [(SUSHI_NS.exchange.reserve-for pair token0)
      (SUSHI_NS.exchange.reserve-for pair token1)]))

(defun get-dex-pair (dex-name:string token0:module{fungible-v2} token1:module{fungible-v2})
  @doc "Get pair from the specified DEX"
  (if (= dex-name DEX_ECKO)
      (ecko-pair token0 token1)
      (sushi-pair token0 token1)))

(defun get-pair-account:string (dex-name:string token0:module{fungible-v2} token1:module{fungible-v2})
  @doc "Get pair account for the specified DEX"
  (at 'account (get-dex-pair dex-name token0 token1)))

(defun dex-remove-liquidity (dex-name:string token0:module{fungible-v2} token1:module{fungible-v2} amount:decimal sender:string to:string to-guard:guard)
  @doc "Remove liquidity from the specified DEX"
  (enforce-s-dex dex-name)
  (require-capability (REMOVE_LIQUIDITY))

  (if (= dex-name DEX_ECKO)
      (DEX_NS.exchange.remove-liquidity token0 token1 amount 0.0 0.0 sender to to-guard)
      (SUSHI_NS.exchange.remove-liquidity token0 token1 amount 0.0 0.0 sender to to-guard)))

(defun dex-add-liquidity:object (dex-name:string token0:module{fungible-v2} token1:module{fungible-v2} amount0:decimal amount1:decimal sender:string to:string to-guard:guard)
  @doc "Add liquidity to the specified DEX"
  (enforce-s-dex dex-name)
  (require-capability (ADD_LIQUIDITY))
  (if (= dex-name DEX_ECKO)
      (DEX_NS.exchange.add-liquidity token0 token1 amount0 amount1 0.0 0.0 sender to to-guard)
      (SUSHI_NS.exchange.add-liquidity token0 token1 amount0 amount1 0.0 0.0 sender to to-guard)))

(defun dex-lp-transfer-cap (dex-name:string lp-token:string from:string to:string amount:decimal)
  @doc "Install LP token transfer capability for the specified DEX"
  (enforce-s-dex dex-name)
  (if (= dex-name DEX_ECKO)
      (install-capability (DEX_NS.tokens.TRANSFER lp-token from to amount))
      (install-capability (SUSHI_NS.tokens.TRANSFER lp-token from to amount))))

;; Read Functions

(defun get-position:object{protocol-position} (position-key:string)
  @doc "Get protocol position by key"
  (read positions position-key))

(defun get-position-by-token:object{protocol-position} (project-token:module{fungible-v2} user:string index:integer)
  @doc "Get protocol position for a project token"
  (read positions (format-position-key project-token user index)))

(defun get-transfer-request:object{transfer-request} (request-id:string)
  @doc "Get transfer request details"
  (read transfer-requests request-id))

(defun get-pending-requests ()
  @doc "Get all pending transfer requests"
  (select transfer-requests (where "executed" (= false))))

(defun pair-key:string (token0:module{fungible-v2} token1:module{fungible-v2})
  @doc "Get DEX pair key"
  (DEX_NS.exchange.get-pair-key token0 token1))

(defun format-position-key:string (project-token:module{fungible-v2} user:string index:integer)
  @doc "Format position key as project-token:user:index"
    (format "{}:{}:{}" [project-token user index]))

(defun tracker-key:string (project-token:module{fungible-v2} user:string)
  @doc "Format tracker key for position index"
    (format "{}:{}" [project-token user]))

(defun dex-reserves:[decimal] (dex-name:string token0:module{fungible-v2} token1:module{fungible-v2})
  @doc "Compute DEX reserves for token pair"
  (enforce-s-dex dex-name)
  (if (= dex-name DEX_ECKO)
      (ecko-reserves token0 token1)
      (sushi-reserves token0 token1)))

;; Enforcement Helpers

(defun enforce-m-dex:bool (d1:string d2:string)
  @doc "Enforce DEX existence"
    (enforce (or (= d1 DEX_ECKO) (= d1 DEX_SUSHI)) "Not in Dex list")
    (enforce (or (= d2 DEX_ECKO) (= d2 DEX_SUSHI)) "Not in Dex list")
    (enforce (!= d1 d2) "DEXs must be different"))

(defun enforce-s-dex:bool (d:string)
  @doc "Enforce SUSHI DEX existence"
  (enforce (or (= d DEX_ECKO) (= d DEX_SUSHI)) "Not in Dex list"))

)