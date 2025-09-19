import { useState } from 'react';
import { toast } from 'react-toastify';
import { pactCallsSales } from '../pactcalls/kadena';
import { notifyWhitelistSuccess } from '../api';
import useTransactionManager from './useTransactionManager';

export const useWhitelistOperations = (
  namespace, 
  salesModuleName, 
  supplyChain,
  moduleName
) => {
  const [isWhitelisting, setIsWhitelisting] = useState(false);
  const { 
    submitTransaction, 
    createTransactionMetadata, 
    transactionTypes 
  } = useTransactionManager();

  const whitelistAddresses = async (walletsToWhitelist, onSuccess) => {
    try {
      setIsWhitelisting(true);
      
      const walletList = walletsToWhitelist.map(
        (wallet) => `(reserve-batch "${wallet}")`
      );
      
      const code = `(use ${namespace}.${salesModuleName}) ${walletList.join(' ')}`;
      const res = await pactCallsSales(code, supplyChain, namespace, moduleName);
      
      if (res?.preflightResult?.result?.status === 'success') {
        const txKey = res.transactionDescriptor?.requestKey;
        
        // Create transaction metadata
        const metadata = createTransactionMetadata(
          transactionTypes.WHITELIST_ADDRESSES,
          `Whitelist ${walletsToWhitelist.length} address${walletsToWhitelist.length > 1 ? 'es' : ''}`,
          {
            addresses: walletsToWhitelist,
            count: walletsToWhitelist.length,
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
            // Send whitelist success notification to backend
            try {
              await notifyWhitelistSuccess({
                walletAddresses: walletsToWhitelist,
                projectNamespace: namespace,
                projectModuleName: moduleName,
                transactionHash: txKey,
                chainId: supplyChain
              });
              console.log('Whitelist notification sent successfully');
            } catch (notificationError) {
              console.error('Failed to send whitelist notification:', notificationError);
              // Don't fail the whole transaction if notification fails
              toast.warning('Transaction successful, but email notification may have failed');
            }

            // Pass transaction result to callback
            onSuccess && onSuccess({
              transactionHash: txKey,
              finalResult: finalResult,
              walletsWhitelisted: walletsToWhitelist
            });
          }
        } catch (pollError) {
          console.error('Transaction polling error:', pollError);
        }
      } else {
        toast.error('Failed to whitelist addresses');
      }
    } catch (error) {
      console.error('Error whitelisting addresses:', error);
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
