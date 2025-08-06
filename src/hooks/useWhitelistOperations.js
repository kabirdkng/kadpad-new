import { useState } from 'react';
import { toast } from 'react-toastify';
import { pactCallsSales, pollForTransactionResult } from '../pactcalls/kadena';

export const useWhitelistOperations = (
  namespace, 
  salesModuleName, 
  supplyChain,
  client,
  session,
  moduleName,
  setReqKey,
  setTransactionStatus,
  setTransactionMessage
) => {
  const [isWhitelisting, setIsWhitelisting] = useState(false);

  const whitelistAddresses = async (walletsToWhitelist, onSuccess) => {
    try {
      setIsWhitelisting(true);
      if (setTransactionStatus) {
        setTransactionStatus('');
        setTransactionMessage('');
        setReqKey && setReqKey('');
      }
      
      const walletList = walletsToWhitelist.map(
        (wallet) => `(reserve-batch "${wallet}")`
      );
      
      toast.info('Submitting whitelist transaction...', { position: 'top-center', autoClose: 2000 });
      const code = `(use ${namespace}.${salesModuleName}) ${walletList.join(' ')}`;
      const res = await pactCallsSales(code, supplyChain, client, session, namespace, moduleName);
      
      if (res?.preflightResult?.result?.status === 'success') {
        const txKey = res.transactionDescriptor?.requestKey;
        if (setReqKey && txKey) {
          setReqKey(txKey);
          setTransactionStatus && setTransactionStatus('pending');
          setTransactionMessage && setTransactionMessage('Whitelist transaction submitted, waiting for confirmation...');
        }
        
        toast.info('Transaction submitted! Waiting for confirmation...', { 
          position: 'top-center', 
          autoClose: 3000 
        });

        try {
          const finalResult = await pollForTransactionResult(
            res.pactClient, 
            res.transactionDescriptor,
            30,
            3000
          );

          if (finalResult?.result?.status === 'success') {
            setTransactionStatus && setTransactionStatus('success');
            setTransactionMessage && setTransactionMessage('Addresses whitelisted successfully!');
            toast.success('Addresses whitelisted successfully!', { 
              position: 'top-center',
              autoClose: 5000 
            });
            
            onSuccess && onSuccess();
          } else {
            setTransactionStatus && setTransactionStatus('error');
            setTransactionMessage && setTransactionMessage(finalResult?.result?.error?.message || 'Whitelist failed');
            toast.error(`Whitelist failed: ${finalResult?.result?.error?.message || 'Unknown error'}`, {
              position: 'top-center',
              autoClose: 5000
            });
          }
        } catch (pollError) {
          console.error('Polling error:', pollError);
          setTransactionStatus && setTransactionStatus('error');
          setTransactionMessage && setTransactionMessage('Transaction status unknown - please check explorer');
          toast.warning('Transaction submitted but confirmation timed out. Please check the explorer for status.', {
            position: 'top-center',
            autoClose: 7000
          });
        }
      } else {
        setTransactionStatus && setTransactionStatus('error');
        setTransactionMessage && setTransactionMessage('Whitelist submission failed');
        toast.error('Failed to whitelist addresses');
      }
    } catch (error) {
      console.error('Error whitelisting addresses:', error);
      setTransactionStatus && setTransactionStatus('error');
      setTransactionMessage && setTransactionMessage(`Whitelist failed: ${error.message}`);
      toast.error('Failed to whitelist addresses');
    } finally {
      setIsWhitelisting(false);
    }
  };

  return {
    isWhitelisting,
    whitelistAddresses
  };
};
