import { useState, useCallback } from 'react';
import { pactCalls } from '../wallet/kadena';
import config from '../wallet/config';

export const useTokenDetails = () => {
  const [tokenDetails, setTokenDetails] = useState(null);
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

  return { tokenDetails, isLoading, error, fetchTokenDetails };
};