// src/store/usePresaleStore.js
import { create } from 'zustand';
import { pactCalls, fetchBalance, pactCallsSig } from '../pactcalls/kadena';

const usePresaleStore = create((set) => ({
  balance: 0,
  phase0startTime: null,
  phase1startTime: null,
  salesEndTime: null,
  isWhitelisted: false,
  p0Reserved: 0,
  amountPerBatch: null,
  currentPrice: null,
  kdaInput: 0,
  batchCount: 0,
  tokenSymbol: '',
  salesAccount: '',
  availableBatches: 0,
  supplyChain: '1',
  deployer: '' ,
  p0Price: null,
  p1Price: null,
  totalSales: 0,
  counters: {},
  imageUrl: '', // Add imageUrl to the state
  totalSupply: null,
  tokenName: '',
  contractNamespace: '',
  
  setKdaInput: (input) => set({kdaInput: input}) ,
  setBatchCount: (input) => set({batchCount: input}),
  setAvailableBatches: (input) => set({availableBatches: input}),
  setBalance: (input) => set({balance: input}),
  setP0Price: (input) => set({p0Price: input}),
  setP1Price: (input) => set({p1Price: input}),
  settotalSales: (input) => set({totalSales: input}),
  
  fetchBalance: async (account, chain) => {
    try {
      const code = `(coin.get-balance "${account}")`;
      const balance = await fetchBalance(code, chain);
      set({ balance });
    } catch (err) {
      console.error(err);
    }
  },
  fetchPhase0StartTime: async (NS, SALES_MODULE_NAME, chain, pubKey) => {
    try {
      const code = `(use ${NS}.${SALES_MODULE_NAME}) PHASE-0-START`;
      const res = await pactCalls(code, chain, pubKey);
      console.log(res.result.data); // Added log
      set({ phase0startTime: new Date(res.result.data.time) });
    } catch (err) {
      console.error(err);
    }
  },
  fetchPhase1StartTime: async (NS, SALES_MODULE_NAME, chain, pubKey) => {
    try {
      const code = `(use ${NS}.${SALES_MODULE_NAME}) PHASE-1-START`;
      const res = await pactCalls(code, chain, pubKey);
      console.log(res.result.data); // Added log
      set({ phase1startTime: new Date(res.result.data.time) });
    } catch (err) {
      console.error(err);
    }
  },
  fetchSalesEndTime: async (NS, SALES_MODULE_NAME, chain, pubKey) => {
    try {
      const code = `(use ${NS}.${SALES_MODULE_NAME}) END-OF-PRESALES`;
      const res = await pactCalls(code, chain, pubKey);
      console.log(res.result.data); // Added log
      set({ salesEndTime: new Date(res.result.data.time) });
    } catch (err) {
      console.error(err);
    }
  },
  fetchP0Reserved: async (NS, SALES_MODULE_NAME, chain, pubKey) => {
    try {
      const code = `(use ${NS}.${SALES_MODULE_NAME}) P0-RESERVED`;
      const res = await pactCalls(code, chain, pubKey);
      console.log(res.result.data); // Added log
      set({ p0Reserved: res.result.data });
    } catch (err) {
      console.error(err);
    }
  },
  fetchAmountPerBatch: async (NS, SALES_MODULE_NAME, chain, pubKey) => {
    try {
      const code = `(use ${NS}.${SALES_MODULE_NAME}) AMOUNT-PER-BATCH`;
      const res = await pactCalls(code, chain, pubKey);
      console.log(res.result.data); // Added log
      set({ amountPerBatch: res.result.data });
    } catch (err) {
      console.error(err);
    }
  },
  fetchSupplyChain: async (NS, MODULE_NAME, chain, pubKey) => {
    try {
      const code = `(use ${NS}.${MODULE_NAME}) SUPPLY-CHAIN`;
      const res = await pactCalls(code, chain, pubKey);
      console.log(res.result.data); // Added log
      set({ supplyChain: res.result.data });
    } catch (err) {
      console.error(err);
    }
  },
  fetchTokenSymbol: async (NS, MODULE_NAME, chain, pubKey) => {
    try {
      const code = `(use ${NS}.${MODULE_NAME}) DETAILS`;
      const res = await pactCalls(code, chain, pubKey);
      console.log(res.result.data); // Added log
      set({ 
        tokenSymbol: res.result.data.symbol.toUpperCase(),
        imageUrl: res.result.data.imageUrl,
        totalSupply: res.result.data.supply?.int || res.result.data.supply?.decimal || res.result.data.supply,
        tokenName: MODULE_NAME,
        contractNamespace: NS
      });
    } catch (err) {
      console.error(err);
    }
  },
  fetchTokenImage: async (NS, MODULE_NAME, chain, pubKey) => {
    try {
      const code = `(use ${NS}.${MODULE_NAME}) DETAILS`;
      const res = await pactCalls(code, chain, pubKey);
      console.log(res.result.data); // Added log
      set({ imageUrl: res.result.data.imageUrl }); // Set imageUrl
    } catch (err) {
      console.error(err);
    }
  },
  fetchSalesAccount: async (NS, SALES_MODULE_NAME, chain, pubKey) => {
    try {
      const code = `(use ${NS}.${SALES_MODULE_NAME}) SALES-ACCOUNT`;
      const res = await pactCalls(code, chain, pubKey);
      console.log(res.result.data); // Added log
      set({ salesAccount: res.result.data });
    } catch (err) {
      console.error(err);
    }
  },
  fetchCurrentPrice: async (NS, SALES_MODULE_NAME, chain, pubKey) => {
    try {
      const code = `(${NS}.${SALES_MODULE_NAME}.get-price)`;
      const res = await pactCalls(code, chain, pubKey);
      console.log(res.result.data); // Added log
      set({ currentPrice: res.result.data });
    } catch (err) {
      console.error(err);
    }
  },
  fetchWlStatus: async (NS, SALES_MODULE_NAME, account, chain, pubKey) => {
    try {
      const code = `(${NS}.${SALES_MODULE_NAME}.has-reservation "${account}")`;
      const res = await pactCalls(code, chain, pubKey);
      console.log(res.result.data); // Added log
      set({ isWhitelisted: res.result.data });
    } catch (err) {
      console.error(err);
    }
  },
  fetchAvailableBatches: async (NS, SALES_MODULE_NAME, account, chain, pubKey) => {
    try {
      const code = `(${NS}.${SALES_MODULE_NAME}.available-batches "${account}")`;
      const res = await pactCalls(code, chain, pubKey);
      console.log(res.result.data); // Added log
      set({ availableBatches: res.result.data });
    } catch (err) {
      console.error(err);
    }
  },
  fetchDeployer:  async (NS, account, chain, pubKey) => {
    try {
      const code = `(describe-keyset "${NS}.gov")`;
      const res = await pactCallsSig(code, chain, pubKey);
      console.log(res.result.data); // Added log
      set({ deployer: res.result.data.keys[0] });
    } catch (err) {
      console.error(err);
    }
  },
  fetchTotalSales: async (NS, SALES_MODULE_NAME, chain) => {
    try {
      const code = `(${NS}.${SALES_MODULE_NAME}.get-sales)`;
      const res = await pactCalls(code, chain);
      console.log('fetchTotalSales response:', res.result.data);
      // Extract the actual value from Pact response object
      const value = res.result.data?.int || res.result.data?.decimal || res.result.data;
      set({ totalSales: typeof value === 'string' ? parseFloat(value) : value });
    } catch (err) {
      console.error('Error fetching total sales:', err);
    }
  },
  fetchP0Price: async (NS, SALES_MODULE_NAME, chain) => {
    try{
      const code = `(${NS}.${SALES_MODULE_NAME}.get-p0-price)`;
      const res = await pactCalls(code, chain);
      console.log('fetchP0Price response:', res.result.data);
      // Extract the actual value from Pact response object
      const value = res.result.data?.int || res.result.data?.decimal || res.result.data;
      set({ p0Price: typeof value === 'string' ? parseFloat(value) : value });
    } catch (err) {
      console.error('Error fetching P0 price:', err);
    }
  },
  fetchP1Price: async (NS, SALES_MODULE_NAME, chain) => {
    try{
      const code = `(${NS}.${SALES_MODULE_NAME}.get-p1-price)`;
      const res = await pactCalls(code, chain);
      console.log('fetchP1Price response:', res.result.data);
      // Extract the actual value from Pact response object
      const value = res.result.data?.int || res.result.data?.decimal || res.result.data;
      set({ p1Price: typeof value === 'string' ? parseFloat(value) : value });
    } catch (err) {
      console.error('Error fetching P1 price:', err);
    }
  },
  resetState: () => {
    set({
      balance: 0,
      phase0startTime: null,
      phase1startTime: null,
      salesEndTime: null,
      isWhitelisted: false,
      p0Reserved: 0,
      amountPerBatch: null,
      currentPrice: null,
      kdaInput: 0,
      batchCount: 0,
      tokenSymbol: '',
      salesAccount: '',
      availableBatches: 0,
      supplyChain: '1',
      imageUrl: '',
      totalSupply: null,
      tokenName: '',
      contractNamespace: '',
    });
  },
}));

export default usePresaleStore;
