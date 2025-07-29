import React, { useState, useEffect } from 'react';
import { pactCalls, transferCoinTreasury } from '../pactcalls/kadena';
import usePresaleStore from '../store/usePresaleStore';
import { useWalletConnectClient } from '../wallet/providers/ClientContextProvider';
import useWalletStore from '../wallet/walletStore';
import useTreasuryStore from '../store/useTreasuryStore';
import { toast } from 'react-toastify';

const AccessTreasury = ({ namespace, moduleName }) => {
  const { supplyChain, salesEndTime } = usePresaleStore();
  const { account, pubKey } = useWalletStore();
  const { client, session } = useWalletConnectClient();
  
  const {
    treasuryTokenBalance,
    liquidityTokenBalance,
    treasuryKdaBalance,
    treasuryContractAccount,
    treasuryGuard,
    liquidityAccount,
    ac,
    amt,
    setAc,
    setAmt,
    getTreasuryContractAccount,
    getTreasuryGuard,
    getLiquidityAccount,
    getTreasuryTokenBalance,
    getLiquidityTokenBalance,
    getTreasuryKdaBalance,
  } = useTreasuryStore();

  const now = new Date();
  const isSalesEnd = now > salesEndTime;

  useEffect(() => {
    const fetchDetails = async () => {
      await getTreasuryContractAccount(namespace, moduleName, supplyChain);
      await getTreasuryTokenBalance(namespace, moduleName, supplyChain, treasuryContractAccount);
      await getLiquidityAccount(namespace, moduleName, supplyChain);
      await getLiquidityTokenBalance(namespace, moduleName, supplyChain, liquidityAccount);
      await getTreasuryGuard(namespace, moduleName, supplyChain);
      if (isSalesEnd) {
        await getTreasuryKdaBalance(supplyChain, treasuryContractAccount);
      }
    };
    fetchDetails();
  }, [treasuryContractAccount, liquidityAccount, isSalesEnd, supplyChain, namespace, moduleName]);
  
  const transferTokens = async () => {
    const token = `${namespace}.${moduleName}`;
    const code = `(${token}.transfer-create "${treasuryContractAccount}" "${ac}" [${treasuryGuard}] ${amt})`;
    try {
      const res = await transferCoinTreasury(token, code, supplyChain, pubKey, treasuryContractAccount, ac, treasuryGuard, amt, client, session);
      console.log(res);
      if (res && res.preflightResult && res.preflightResult.result.status === 'success') {
        toast.success('Transfer successful');
        // Refresh balances after transfer
        await getTreasuryTokenBalance(namespace, moduleName, supplyChain, treasuryContractAccount);
      } else {
        toast.error('Transfer failed');
      }
    } catch (error) {
      console.error('Error in transferTokens:', error);
      toast.error('Transfer failed: ' + error.message);
    }
  };

  return (
    <div className='dashboard-container'>
      <h1>${moduleName} Treasury</h1>
      <div className='d-grid'>
        <div className='treasury-balance'>
          <h3>Treasury Balance : </h3>
          <h3>{treasuryTokenBalance} ${moduleName}</h3>
        </div>
        <div className='treasury-balance'>
          <h3>Liquidity Balance : </h3>
          <h3>{liquidityTokenBalance} ${moduleName}</h3>
        </div>
        {isSalesEnd && (
          <div className='treasury-balance'>
            <h3>Treasury KDA Balance : </h3>
            <h3>{treasuryKdaBalance} KDA</h3>
          </div>
        )}
        <div>
          <h4>Transfer tokens</h4>
          <div>
            <label htmlFor="account">Account</label>
            <input 
              type='text' 
              id="account"
              value={ac}
              onChange={(e) => setAc(e.target.value)}
              placeholder="Enter recipient account"
            />
            <label htmlFor="amount">Amount</label>
            <input 
              type='number' 
              id="amount"
              value={amt}
              onChange={(e) => setAmt(parseFloat(e.target.value))}
              placeholder="Enter amount to transfer"
            />
            <button 
              onClick={transferTokens}
              disabled={!ac || !amt || amt <= 0 || amt > treasuryTokenBalance}
            >
              Send
            </button>
          </div>
        </div>
      </div>
      {!isSalesEnd && (
        <div className="warning-message">
          <p>Note: KDA balance will be available after the sale ends.</p>
        </div>
      )}
    </div>
  );
};

export default AccessTreasury;