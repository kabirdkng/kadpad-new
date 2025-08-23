import { useState } from 'react';
import { toast } from 'react-toastify';
import { pactCallsSales } from '../pactcalls/kadena';
import useTransactionManager from './useTransactionManager';

export const usePriceUpdates = (
  namespace, 
  salesModuleName, 
  supplyChain,
  moduleName,
  fetchP0Price,
  fetchP1Price,
  pubKey
) => {
  const [isUpdatingPrices, setIsUpdatingPrices] = useState(false);
  const { 
    submitTransaction, 
    createTransactionMetadata, 
    transactionTypes 
  } = useTransactionManager();

  const updatePrices = async (newP0Price, newP1Price, onSuccess) => {
    try {
      setIsUpdatingPrices(true);
      
      const formatPriceForPact = (price) => {
        const numPrice = parseFloat(price);
        return numPrice % 1 === 0 ? `${numPrice}.0` : numPrice.toString();
      };
      
      const formattedP0Price = formatPriceForPact(newP0Price);
      const formattedP1Price = formatPriceForPact(newP1Price);
      
      toast.info('Submitting price update...', { position: 'top-center', autoClose: 2000 });
      const code = `(${namespace}.${salesModuleName}.set-price "phase-0" ${formattedP0Price}) (${namespace}.${salesModuleName}.set-price "phase-1" ${formattedP1Price})`;
      const res = await pactCallsSales(code, supplyChain, namespace, moduleName);
      
      if (res?.preflightResult?.result?.status === 'success') {
        const txKey = res.transactionDescriptor?.requestKey;
        
        // Create transaction metadata
        const metadata = createTransactionMetadata(
          transactionTypes.PRICE_UPDATE,
          `Update prices: Phase 0 to ${formattedP0Price}, Phase 1 to ${formattedP1Price}`,
          {
            p0Price: formattedP0Price,
            p1Price: formattedP1Price,
            chainId: supplyChain,
            namespace,
            moduleName: salesModuleName,
          }
        );

        // Submit transaction using the new manager
        try {
          const finalResult = await submitTransaction({
            txId: txKey,
            pactClient: res.pactClient,
            transactionDescriptor: res.transactionDescriptor,
            metadata,
            pollingConfig: {
              enableToasts: true,
            }
          });

          if (finalResult?.result?.status === 'success') {
            await fetchP0Price(namespace, salesModuleName, supplyChain, pubKey);
            await fetchP1Price(namespace, salesModuleName, supplyChain, pubKey);
            onSuccess && onSuccess();
          }
        } catch (pollError) {
          console.error('Transaction polling error:', pollError);
        }
      } else {
        toast.error('Price update submission failed');
      }
    } catch (error) {
      console.error('Error updating prices:', error);
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
