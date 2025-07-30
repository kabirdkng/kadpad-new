/**
 * Treasury Contract Template
 * Generates complete Pact smart contract for DEX liquidity management and treasury operations
 */

import { getDexConfiguration } from './dexUtils.js';
import { getNetworkConfig } from './networkUtils.js';

export const generateTreasuryContract = (moduleName, namespace, options = {}) => {
  // Follow exact pattern from TreasuryBlock.jsx
  const networkConfig = getNetworkConfig();
  const network = networkConfig.networkId; // Use dynamic network instead of hardcoded "testnet04"
  const keys = `(define-keyset "${namespace}.operator" (read-keyset "ks"))`;

  const supply = options.supplyChain || networkConfig.chainId || "1";
  const { dexNs } = getDexConfiguration(supply, network);

  return `(namespace '${namespace})
${keys}

(module ${moduleName}-treasury GOVERNANCE
  (implements ${dexNs}.swap-callable-v1)
  (use ${dexNs}.exchange [get-pair-key get-pair-by-key reserve-for add-liquidity swap remove-liquidity FEE])
  (use free.util-math)
  (use free.util-time)
  (use free.util-lists)
  (use n_e309f0fa7cf3a13f93a8da5325cdad32790d2070.burn [BURN-ACCOUNT BURN-GUARD])

  ;-----------------------------------------------------------------------------
  ; Administrative and ops capabilities
  ;-----------------------------------------------------------------------------
  (defcap GOVERNANCE ()
    (enforce-keyset "${namespace}.gov"))

  (defcap INIT ()
    (compose-capability (GOVERNANCE))
    (compose-capability (LIQUIDITY)))

  (defcap OPERATOR ()
    (enforce-keyset "${namespace}.operator"))

  (defcap OPERATE-TREASURY ()
    (compose-capability (OPERATOR))
    (compose-capability (TREASURY)))

  (defcap OPERATE-DEX ()
    (compose-capability (OPERATOR))
    (compose-capability (LIQUIDITY)))

  ;-----------------------------------------------------------------------------
  ; Caps and internal accounts management
  ;-----------------------------------------------------------------------------
  (defcap TREASURY () true)
  (defconst TREASURY-GUARD (create-capability-guard (TREASURY)))
  (defconst TREASURY-ACCOUNT (create-principal TREASURY-GUARD))

  (defcap LIQUIDITY () true)
  (defconst LIQUIDITY-GUARD (create-capability-guard (LIQUIDITY)))
  (defconst LIQUIDITY-ACCOUNT (create-principal LIQUIDITY-GUARD))

   ; Using a defconst for the DEX key saves gas
  (defconst DEX-KEY (get-pair-key coin ${moduleName}))

  (defcap BURN-LP (token:string from:string to:string amount:decimal)
    @event 
    true
  )

  ;-----------------------------------------------------------------------------
  ; Schemas and Tables
  ;-----------------------------------------------------------------------------
  (defschema liquidity-management-sch
    liquidity-target:decimal
    init:bool
  )

  (deftable liquidity-management:{liquidity-management-sch})

  ;-----------------------------------------------------------------------------
  ; Utility functions
  ;-----------------------------------------------------------------------------
  (defun div:decimal (num:decimal den:decimal)
    @doc "Divide and limit numbers of decimal (gas optimisation)"
    (floor (/ num den) 24))

  (defun get-pair ()
    (get-pair-by-key DEX-KEY))

  (defun dex-reserves:[decimal] ()
    @doc "Returns the Reserve of the DEXs to an array [Token $KDA]"
    (let ((pair (get-pair)))
      [(reserve-for pair ${moduleName}), (reserve-for pair coin)]))

  (defun dex-account:string ()
    @doc "Returns the DEX's pair account"
    (at 'account (get-pair)))

  (defun liquidity-ratio:decimal ()
    @doc "Returns the ratio (Geom Mean of liquidity) / (LP total supply)"
    (div (sqrt (prod (dex-reserves)))
         (${dexNs}.tokens.total-supply DEX-KEY)))

  (defun current-balance:decimal ()
    @doc "Return our LP token balance"
    (${dexNs}.tokens.get-balance DEX-KEY LIQUIDITY-ACCOUNT))

  (defun current-liquidity:decimal ()
    @doc "Returns the total liquidity we own"
    (* (current-balance) (liquidity-ratio)))

  (defun liquidity-to-remove:decimal ()
    @doc "Compute the liquidity to remove to meet our target 'intitial liquidity \\
        \\ Note: We don't take into account eckoDEX fees (minted through mint-fee) \\
        \\ Not a big deal: this may add a small hysteresis => But on the long term, it's OK"
    (with-read liquidity-management "" {'liquidity-target:=target}
      (floor (- (current-balance) (div target (liquidity-ratio)))
             (${dexNs}.tokens.precision DEX-KEY))))

  (defun kda-to-${moduleName}:decimal (x:decimal)
    @doc "Compute the amount of ${moduleName} we can have from a given amount of KDA"
    (let ((res (dex-reserves)))
      (floor (- (at 0 res) (div (prod res)
                                (+ (* x (- 1.0 FEE)) (at 1 res))))
             (${moduleName}.precision)))
  )

  (defun kda-balance:decimal ()
    @doc "KDA balance of the liquidity account"
    (coin.get-balance LIQUIDITY-ACCOUNT))

  (defun ${moduleName}-balance:decimal ()
    @doc "Token balance of the liquidity account"
    (${moduleName}.get-balance LIQUIDITY-ACCOUNT))

  (defun ${moduleName}-t-balance:decimal ()
    @doc "Token balance of the treasury account"
    (${moduleName}.get-balance TREASURY-ACCOUNT))

  (defun coin-t-balance:decimal ()
    @doc "Coin balance of the treasury account"
    (coin.get-balance TREASURY-ACCOUNT))

  ;-----------------------------------------------------------------------------
  ; Private functions
  ;-----------------------------------------------------------------------------
  ; Function automatically called by the DEX (interface callable-v1) during the swap
  (defun swap-call:bool (token-in:module{fungible-v2} token-out:module{fungible-v2} amount-out:decimal sender:string recipient:string recipient-guard:guard)
    (require-capability (OPERATE-DEX))
    (install-capability (coin.TRANSFER LIQUIDITY-ACCOUNT sender (kda-balance)))
    (coin.transfer LIQUIDITY-ACCOUNT sender (kda-balance))
    true
  )

  ;-----------------------------------------------------------------------------
  ; Public functions
  ;-----------------------------------------------------------------------------

  (defun transfer-funds (receiver:string g:guard amount:decimal)
    @doc "Send module Tokens to the receiver"
    (let (
      (b (${moduleName}-t-balance)))
    (with-capability (OPERATE-TREASURY)
    (enforce (<= amount b) "Insufficient Treasury balance")
    (install-capability (${moduleName}.TRANSFER TREASURY-ACCOUNT receiver amount))
    (${moduleName}.transfer-create TREASURY-ACCOUNT receiver g amount)
    ))
  )

  (defun transfer-coin-funds (receiver:string g:guard amount:decimal)
    @doc "Send KDA Tokens to the receiver"
    (let (
      (b (coin-t-balance)))
    (with-capability (OPERATE-TREASURY)
    (enforce (<= amount b) "Insufficient Treasury balance")
    (install-capability (coin.TRANSFER TREASURY-ACCOUNT receiver amount))
    (coin.transfer-create TREASURY-ACCOUNT receiver g amount)
    ))
  )

  (defun gather-rewards:string ()
    @doc "Administrative function to be called regurarly to gather DEX rewards"
    (with-capability (OPERATE-DEX)
      ; Withdraw the reward liquidity
      (let ((amount (liquidity-to-remove)))
        (enforce (> amount 0.0) "No rewards to gather")
        (install-capability (${dexNs}.tokens.TRANSFER DEX-KEY LIQUIDITY-ACCOUNT (dex-account) amount))
        (remove-liquidity coin ${moduleName} amount 0.0 0.0 LIQUIDITY-ACCOUNT LIQUIDITY-ACCOUNT LIQUIDITY-GUARD))

      ; Transfer all Tokens to the treasury
      (install-capability (${moduleName}.TRANSFER LIQUIDITY-ACCOUNT TREASURY-ACCOUNT (${moduleName}-balance)))
      (${moduleName}.transfer-create LIQUIDITY-ACCOUNT TREASURY-ACCOUNT TREASURY-GUARD (${moduleName}-balance))

      ; Swap all KDAs directly to the Token treasury
      (swap ${moduleName}-treasury TREASURY-ACCOUNT TREASURY-GUARD ${moduleName} (kda-to-${moduleName} (kda-balance)) coin)
      "Rewards successfuly gathered")
  )

  (defun burn-lp:string ()
    @doc "Burn all LP tokens"
    (let (
         (balance (current-balance)))
    (with-capability (OPERATE-DEX)
    (install-capability (${dexNs}.tokens.TRANSFER DEX-KEY LIQUIDITY-ACCOUNT BURN-ACCOUNT balance))
    (${dexNs}.tokens.transfer-create DEX-KEY LIQUIDITY-ACCOUNT BURN-ACCOUNT BURN-GUARD balance)
    (emit-event (BURN-LP DEX-KEY LIQUIDITY-ACCOUNT BURN-ACCOUNT balance))
    (format "{} LP tokens burned for {}" [DEX-KEY balance])))
  )

  (defun init-liquidity:string ()
    @doc "To be called only once.. It creates the intial liquidity reserve"
    (with-capability (INIT)
      (with-default-read liquidity-management "" {'init:false} {'init:=init}
        (enforce (not init) "Liquidity already init"))

      ;; Attempt to create the pair, defaulting to success if it already exists
      (try
        (${dexNs}.exchange.create-pair coin ${moduleName} "")
        (format "Pair already exists: {}" [(get-pair)]))

      (install-capability (coin.TRANSFER LIQUIDITY-ACCOUNT (dex-account) (kda-balance)))
      (install-capability (${moduleName}.TRANSFER LIQUIDITY-ACCOUNT  (dex-account) (${moduleName}-balance)))
      (add-liquidity coin ${moduleName} (kda-balance) (${moduleName}-balance) 0.0 0.0 LIQUIDITY-ACCOUNT LIQUIDITY-ACCOUNT LIQUIDITY-GUARD)

      (write liquidity-management "" {'liquidity-target:(current-liquidity),
                                      'init:true}))
  )

  ;-----------------------------------------------------------------------------
  ; Public getters for external module access
  ;-----------------------------------------------------------------------------
  (defun get-treasury-account:string ()
    @doc "Get treasury account address"
    TREASURY-ACCOUNT)

  (defun get-treasury-guard:guard ()
    @doc "Get treasury guard"
    TREASURY-GUARD)

  (defun get-liquidity-account:string ()
    @doc "Get liquidity account address"
    LIQUIDITY-ACCOUNT)

  (defun get-liquidity-guard:guard ()
    @doc "Get liquidity guard"
    LIQUIDITY-GUARD)

)
  (create-table liquidity-management)`;
};
