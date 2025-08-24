// src/store/usePresaleStore.js
import { create } from 'zustand';
import { pactCalls, fetchBalance, pactCallsSig } from '../pactcalls/kadena';

const usePresaleStore = create((set, get) => ({
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
  // New consolidated data properties
  availableForFreeSales: 0,
  currentPhase: 'pre-sale',
  totalBatches: 0,
  remainingBatches: 0,
  // Auto-refresh properties
  isAutoRefreshing: false,
  refreshInterval: null,
  lastRefreshTime: null,
  // User purchase data
  userPurchaseData: null,
  userBoughtBatches: 0,
  userBoughtTokens: 0,
  
  setKdaInput: (input) => set({kdaInput: input}) ,
  setBatchCount: (input) => set({batchCount: input}),
  setAvailableBatches: (input) => set({availableBatches: input}),
  setBalance: (input) => set({balance: input}),
  setP0Price: (input) => set({p0Price: input}),
  setP1Price: (input) => set({p1Price: input}),
  settotalSales: (input) => set({totalSales: input}),
  setUserBoughtTokens: (input) => set({userBoughtTokens: input}),
  
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

  fetchUserPurchaseData: async (NS, SALES_MODULE_NAME, account, chain, pubKey) => {
    try {
      const code = `(use ${NS}.${SALES_MODULE_NAME}) (read accounts-table "${account}")`;
      const res = await pactCalls(code, chain, pubKey);
      console.log('fetchUserPurchaseData response:', res.result.data);
      
      if (res.result && res.result.data) {
        const purchaseData = res.result.data;
        const boughtBatches = purchaseData.bought?.int || purchaseData.bought?.decimal || purchaseData.bought || 0;
        
        // Calculate tokens bought (batches * amount per batch)
        const state = get();
        const tokensPerBatch = state.amountPerBatch || 0;
        const totalTokensBought = boughtBatches * tokensPerBatch;
        
        set({ 
          userPurchaseData: purchaseData,
          userBoughtBatches: boughtBatches,
          userBoughtTokens: totalTokensBought
        });
      } else {
        // User hasn't made any purchases yet
        set({ 
          userPurchaseData: null,
          userBoughtBatches: 0,
          userBoughtTokens: 0
        });
      }
    } catch (err) {
      console.error('Error fetching user purchase data:', err);
      // If account doesn't exist in table, set to 0
      set({ 
        userPurchaseData: null,
        userBoughtBatches: 0,
        userBoughtTokens: 0
      });
    }
  },
  
  // NEW: Consolidated fetch function that gets all sales data in one call
  fetchAllSalesData: async (NS, MODULE_NAME, SALES_MODULE_NAME, chain) => {
    try {
      // Fetch both sales data and token details in parallel
      const [salesDataResult, tokenDetailsResult] = await Promise.all([
        // Get all sales data in one consolidated call
        pactCalls(`(use ${NS}.${SALES_MODULE_NAME}) {
          "free-sales": (available-for-free-sales), 
          "current-phase": (current-phase), 
          "price": (get-price), 
          "phase0": PHASE-0-START, 
          "phase1": PHASE-1-START, 
          "end": END-OF-PRESALES, 
          "escrow": SALES-ACCOUNT,
          "batches": TOTAL-BATCHES,
          "batch-size": AMOUNT-PER-BATCH,
          "reserveable": P0-RESERVED,
          "remaining": (- TOTAL-BATCHES (at 'sold (get-counters))),
          "sold": (at 'sold (get-counters)),
          "p0-price": (get-p0-price),
          "p1-price": (get-p1-price),
          "counters": (get-counters)
        }`, chain).catch(() => ({ result: { data: {} } })),
        
        // Get token details
        pactCalls(`(use ${NS}.${MODULE_NAME}) DETAILS`, chain).catch(() => ({ result: { data: {} } }))
      ]);

      const salesData = salesDataResult.result?.data || {};
      const tokenDetails = tokenDetailsResult.result?.data || {};

      console.log('Consolidated sales data response:', salesData);
      console.log('Token details response:', tokenDetails);

      // Extract and set all the data at once
      const updates = {
        // Sales data
        currentPrice: salesData.price?.decimal || salesData.price?.int || salesData.price || null,
        p0Price: salesData["p0-price"]?.decimal || salesData["p0-price"]?.int || salesData["p0-price"] || null,
        p1Price: salesData["p1-price"]?.decimal || salesData["p1-price"]?.int || salesData["p1-price"] || null,
        amountPerBatch: salesData["batch-size"]?.decimal || salesData["batch-size"]?.int || salesData["batch-size"] || null,
        p0Reserved: salesData.reserveable?.int || salesData.reserveable?.decimal || salesData.reserveable || 0,
        totalSales: salesData.sold?.int || salesData.sold?.decimal || salesData.sold || 0,
        salesAccount: salesData.escrow || '',
        counters: salesData.counters || {},
        
        // Phase timings
        phase0startTime: salesData.phase0?.time ? new Date(salesData.phase0.time) : null,
        phase1startTime: salesData.phase1?.time ? new Date(salesData.phase1.time) : null,
        salesEndTime: salesData.end?.time ? new Date(salesData.end.time) : null,
        
        // Token details
        tokenSymbol: tokenDetails.symbol ? tokenDetails.symbol.toUpperCase() : '',
        imageUrl: tokenDetails.imageUrl || '',
        totalSupply: tokenDetails.supply?.int || tokenDetails.supply?.decimal || tokenDetails.supply || null,
        tokenName: MODULE_NAME,
        contractNamespace: NS,
        
        // Additional useful data
        availableForFreeSales: salesData["free-sales"]?.int || salesData["free-sales"]?.decimal || salesData["free-sales"] || 0,
        currentPhase: salesData["current-phase"] || 'pre-sale',
        totalBatches: salesData.batches?.int || salesData.batches?.decimal || salesData.batches || 0,
        remainingBatches: salesData.remaining?.int || salesData.remaining?.decimal || salesData.remaining || 0,
      };

      set(updates);
      
      console.log('Updated presale store with consolidated data:', updates);
      return updates;
    } catch (err) {
      console.error('Error fetching consolidated sales data:', err);
      throw err;
    }
  },

  // Auto-refresh functionality
  startAutoRefresh: (NS, MODULE_NAME, SALES_MODULE_NAME, chain, account = null, pubKey = null, intervalMs = 5000) => {
    const state = get();
    
    // Don't start if already refreshing
    if (state.isAutoRefreshing) {
      return;
    }

    console.log('Starting auto-refresh for presale data every', intervalMs / 1000, 'seconds');
    
    const refreshData = async () => {
      try {
        console.log('Auto-refreshing presale data...');
        
        // Fetch consolidated sales data
        await get().fetchAllSalesData(NS, MODULE_NAME, SALES_MODULE_NAME, chain);
        
        // Fetch account-specific data if account is available
        if (account && pubKey) {
          await Promise.all([
            get().fetchBalance(account, chain),
            get().fetchWlStatus(NS, SALES_MODULE_NAME, account, chain, pubKey),
            get().fetchAvailableBatches(NS, SALES_MODULE_NAME, account, chain, pubKey),
            get().fetchUserPurchaseData(NS, SALES_MODULE_NAME, account, chain, pubKey)
          ]);
        }
        
        set({ lastRefreshTime: new Date() });
        console.log('Auto-refresh completed successfully');
      } catch (error) {
        console.error('Auto-refresh failed:', error);
      }
    };

    // Set up interval
    const intervalId = setInterval(refreshData, intervalMs);
    
    set({ 
      isAutoRefreshing: true,
      refreshInterval: intervalId 
    });

    // Do initial refresh
    refreshData();
  },

  stopAutoRefresh: () => {
    const state = get();
    
    if (state.refreshInterval) {
      clearInterval(state.refreshInterval);
      console.log('Auto-refresh stopped');
    }
    
    set({ 
      isAutoRefreshing: false,
      refreshInterval: null 
    });
  },

  // Manual refresh function
  refreshPresaleData: async (NS, MODULE_NAME, SALES_MODULE_NAME, chain, account = null, pubKey = null) => {
    try {
      console.log('Manual refresh triggered...');
      
      // Fetch consolidated sales data
      await get().fetchAllSalesData(NS, MODULE_NAME, SALES_MODULE_NAME, chain);
      
      // Fetch account-specific data if account is available
      if (account && pubKey) {
        await Promise.all([
          get().fetchBalance(account, chain),
          get().fetchWlStatus(NS, SALES_MODULE_NAME, account, chain, pubKey),
          get().fetchAvailableBatches(NS, SALES_MODULE_NAME, account, chain, pubKey),
          get().fetchUserPurchaseData(NS, SALES_MODULE_NAME, account, chain, pubKey)
        ]);
      }
      
      set({ lastRefreshTime: new Date() });
      console.log('Manual refresh completed successfully');
      return true;
    } catch (error) {
      console.error('Manual refresh failed:', error);
      return false;
    }
  },

  resetState: () => {
    // Stop auto refresh when resetting state
    const state = get();
    if (state.refreshInterval) {
      clearInterval(state.refreshInterval);
    }

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
      // Reset new consolidated data properties
      availableForFreeSales: 0,
      currentPhase: 'pre-sale',
      totalBatches: 0,
      remainingBatches: 0,
      // Reset auto-refresh properties
      isAutoRefreshing: false,
      refreshInterval: null,
      lastRefreshTime: null,
      // Reset user purchase data
      userPurchaseData: null,
      userBoughtBatches: 0,
      userBoughtTokens: 0,
    });
  },
}));

export default usePresaleStore;
