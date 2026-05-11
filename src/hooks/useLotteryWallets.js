import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getSelectedWallets } from '../api';

export const useLotteryWallets = (namespace, moduleName) => {
  const [selectedWallets, setSelectedWallets] = useState([]);
  const [totalLotteryWallets, setTotalLotteryWallets] = useState(0);
  const [whitelistedLotteryWallets, setWhitelistedLotteryWallets] = useState(0);
  const [hasLotteryData, setHasLotteryData] = useState(false);
  const [lotteryDate, setLotteryDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSelectedWallets = async () => {
    if (!namespace || !moduleName) return;

    setLoading(true);
    setError(null);

    try {
      const response = await getSelectedWallets(namespace, moduleName);
      const data = response.data.data;

      setSelectedWallets(data.selectedWallets || []);
      setTotalLotteryWallets(data.totalLotteryWallets || 0);
      setWhitelistedLotteryWallets(data.whitelistedLotteryWallets || 0);
      setHasLotteryData(data.hasLotteryData || false);
      setLotteryDate(data.lotteryDate);

      console.log(`Loaded ${data.selectedWallets?.length || 0} pending lottery wallets for ${namespace}.${moduleName} (${data.totalLotteryWallets || 0} total, ${data.whitelistedLotteryWallets || 0} already whitelisted)`);
    } catch (err) {
      console.error('Error fetching selected wallets:', err);
      setError(err.response?.data?.message || 'Failed to fetch selected wallets');
      
      // If the error is 404 (project not found), it's not a critical error
      if (err.response?.status !== 404) {
        toast.error('Failed to fetch lottery data');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSelectedWallets();
  }, [namespace, moduleName]);

  return {
    selectedWallets,
    totalLotteryWallets,
    whitelistedLotteryWallets,
    hasLotteryData,
    lotteryDate,
    loading,
    error,
    refetch: fetchSelectedWallets
  };
};
