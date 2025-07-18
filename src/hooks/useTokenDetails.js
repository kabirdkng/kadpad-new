import { useState, useCallback } from 'react';
import { pactCalls } from '../wallet/kadena';
import config from '../wallet/config';

export const useTokenDetails = () => {
  const [tokenDetails, setTokenDetails] = useState(null);
  const [salesDetails, setSalesDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTokenDetails = useCallback(async (contractAddress) => {
    setIsLoading(true);
    setError(null);
    try {
      const chain = config.chainId;
      const code = `(use ${contractAddress}) DETAILS`;
      const res = await pactCalls(code, chain);
      if (res.result.status === 'success') {
        setTokenDetails({
          name: contractAddress.split('.')[1],
          symbol: res.result.data.symbol,
          imageUrl: res.result.data.imageUrl,
          supply: res.result.data.supply,
          contractAddress: contractAddress
        });
      } else {
        throw new Error('Failed to fetch token details');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchSalesDetails = useCallback(async (contractAddress) => {
    setIsLoading(true);
    setError(null);
    try {
      const chain = config.chainId;
      const NS = contractAddress.split('.')[0];
      const MODULE_NAME = contractAddress.split('.')[1];
      const SALES_MODULE_NAME = `${MODULE_NAME}-sales`;
      
      const salesDetailsPromises = [
        pactCalls(`(use ${NS}.${SALES_MODULE_NAME}) PHASE-0-START`, chain),
        pactCalls(`(use ${NS}.${SALES_MODULE_NAME}) PHASE-1-START`, chain),
        pactCalls(`(use ${NS}.${SALES_MODULE_NAME}) END-OF-PRESALES`, chain),
        pactCalls(`(${NS}.${SALES_MODULE_NAME}.get-p0-price)`, chain),
        pactCalls(`(${NS}.${SALES_MODULE_NAME}.get-p1-price)`, chain),
        pactCalls(`(use ${NS}.${SALES_MODULE_NAME}) AMOUNT-PER-BATCH`, chain),
        pactCalls(`(use ${NS}.${SALES_MODULE_NAME}) TOTAL-BATCHES`, chain),
      ];

      const [
        phase0Start,
        phase1Start,
        salesEnd,
        p0Price,
        p1Price,
        amountPerBatch,
        totalBatches,
      ] = await Promise.all(salesDetailsPromises);

      const totalTokensToSale = amountPerBatch?.result.data * totalBatches?.result.data;

      setSalesDetails({
        phase0startDate: new Date(phase0Start.result.data.time),
        phase1StartDate: new Date(phase1Start.result.data.time),
        salesEndDate: new Date(salesEnd.result.data.time),
        phase0price: p0Price.result.data,
        phase1Price: p1Price.result.data,
        totalTokensToSale: totalBatches.result.data,
        tokensPerBatch: 1,
        phase0whitelist: [], // This might need to be fetched separately if required
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { tokenDetails, salesDetails, isLoading, error, fetchTokenDetails, fetchSalesDetails };
};