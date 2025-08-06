import { useState } from 'react';
import { toast } from 'react-toastify';
import { pactCallsSales, pollForTransactionResult } from '../pactcalls/kadena';

export const usePriceUpdates = (
  namespace, 
  salesModuleName, 
  supplyChain,
  client,
  session,
  moduleName,
  setReqKey,
  setTransactionStatus,
  setTransactionMessage,
  fetchP0Price,
  fetchP1Price,
  pubKey
) => {
  const [isUpdatingPrices, setIsUpdatingPrices] = useState(false);

  const updatePrices = async (newP0Price, newP1Price, onSuccess) => {
    try {
      setIsUpdatingPrices(true);
      if (setTransactionStatus) {
        setTransactionStatus('');
        setTransactionMessage('');
        setReqKey && setReqKey('');
      }
      
      const formatPriceForPact = (price) => {
        const numPrice = parseFloat(price);
        return numPrice % 1 === 0 ? `${numPrice}.0` : numPrice.toString();
      };
      
      const formattedP0Price = formatPriceForPact(newP0Price);
      const formattedP1Price = formatPriceForPact(newP1Price);
      
      toast.info('Submitting price update...', { position: 'top-center', autoClose: 2000 });
      const code = `(${namespace}.${salesModuleName}.set-price "phase-0" ${formattedP0Price}) (${namespace}.${salesModuleName}.set-price "phase-1" ${formattedP1Price})`;
      const res = await pactCallsSales(code, supplyChain, client, session, namespace, moduleName);
      
      if (res?.preflightResult?.result?.status === 'success') {
        const txKey = res.transactionDescriptor?.requestKey;
        if (setReqKey && txKey) {
          setReqKey(txKey);
          setTransactionStatus && setTransactionStatus('pending');
          setTransactionMessage && setTransactionMessage('Price update submitted, waiting for confirmation...');
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
            setTransactionMessage && setTransactionMessage('Prices updated successfully!');
            toast.success('Prices updated successfully!', { 
              position: 'top-center',
              autoClose: 5000 
            });
            
            await fetchP0Price(namespace, salesModuleName, supplyChain, pubKey);
            await fetchP1Price(namespace, salesModuleName, supplyChain, pubKey);
            
            onSuccess && onSuccess();
          } else {
            setTransactionStatus && setTransactionStatus('error');
            setTransactionMessage && setTransactionMessage(finalResult?.result?.error?.message || 'Price update failed');
            toast.error(`Price update failed: ${finalResult?.result?.error?.message || 'Unknown error'}`, {
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
        setTransactionMessage && setTransactionMessage('Price update submission failed');
        toast.error('Price update submission failed');
      }
    } catch (error) {
      console.error('Error updating prices:', error);
      setTransactionStatus && setTransactionStatus('error');
      setTransactionMessage && setTransactionMessage(`Price update failed: ${error.message}`);
      toast.error('Failed to update prices');
    } finally {
      setIsUpdatingPrices(false);
    }
  };

  return {
    isUpdatingPrices,
    updatePrices
  };
};
