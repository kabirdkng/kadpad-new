import { useState, useCallback } from 'react';
import { pactCalls } from '../pactcalls/kadena';

export const usePresaleData = (namespace, salesModuleName, supplyChain, pubKey) => {
  const [totalBatches, setTotalBatches] = useState(0);
  const [counters, setCounters] = useState({ sold: null, reserved: null });
  const [reservations, setReservations] = useState([]);
  const [availableToWhitelist, setAvailableToWhitelist] = useState(0);

  const getTotalBatches = useCallback(async () => {
    try {
      const code = `(use ${namespace}.${salesModuleName}) TOTAL-BATCHES`;
      const res = await pactCalls(code, supplyChain, pubKey);
      
      const data = res.result?.data || res.result || 0;
      let value = 0;
      if (data?.int !== undefined) {
        value = data.int;
      } else if (data?.decimal !== undefined) {
        value = parseFloat(data.decimal);
      } else if (typeof data === 'number') {
        value = data;
      } else if (typeof data === 'string') {
        value = parseFloat(data);
      }
      
      setTotalBatches(Number(value) || 0);
    } catch (error) {
      console.error('Error fetching total batches:', error);
    }
  }, [namespace, salesModuleName, supplyChain, pubKey]);

  const getCounters = useCallback(async () => {
    try {
      const code = `(${namespace}.${salesModuleName}.get-counters)`;
      const res = await pactCalls(code, supplyChain, pubKey);
      
      const data = res.result?.data || res.result || {};
      
      let soldValue = 0;
      if (data.sold !== undefined) {
        soldValue = data.sold?.int ?? data.sold?.decimal ?? data.sold ?? 0;
      }
      
      let reservedValue = 0;
      if (data.reserved !== undefined) {
        reservedValue = data.reserved?.int ?? data.reserved?.decimal ?? data.reserved ?? 0;
      }
      
      const sold = typeof soldValue === 'string' ? parseFloat(soldValue) : Number(soldValue) || 0;
      const reserved = typeof reservedValue === 'string' ? parseFloat(reservedValue) : Number(reservedValue) || 0;
      
      setCounters({ sold, reserved });
      
      const available = Math.max(0, totalBatches - (sold + reserved));
      setAvailableToWhitelist(available);
    } catch (error) {
      console.error('Error fetching counters:', error);
    }
  }, [namespace, salesModuleName, supplyChain, pubKey, totalBatches]);

  const getReservations = useCallback(async () => {
    try {
      const code = `(${namespace}.${salesModuleName}.get-reservations)`;
      const res = await pactCalls(code, supplyChain, pubKey);
      setReservations(res.result.data || []);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    }
  }, [namespace, salesModuleName, supplyChain, pubKey]);

  return {
    totalBatches,
    counters,
    reservations,
    availableToWhitelist,
    getTotalBatches,
    getCounters,
    getReservations
  };
};
