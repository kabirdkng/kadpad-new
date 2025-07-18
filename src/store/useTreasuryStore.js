import { create } from 'zustand';
import { pactCalls } from '../pactcalls/kadena';

const useTreasuryStore = create((set) => ({
  treasuryTokenBalance: 0,
  liquidityTokenBalance: 0,
  treasuryKdaBalance: 0,
  treasuryContractAccount: '',
  treasuryGuard: {},
  liquidityAccount: '',
  ac: '',
  amt: 0,

  setAc: (input) => set({ ac: input }),
  setAmt: (input) => set({ amt: parseFloat(input) }),

  getTreasuryContractAccount: async (NS, MODULE_NAME, supplyChain) => {
    try {
      const code = `(use ${NS}.${MODULE_NAME}-treasury) TREASURY-ACCOUNT`;
      const res = await pactCalls(code, supplyChain);
      set({ treasuryContractAccount: res.result.data });
    } catch (err) {
      console.error(err);
    }
  },

  getTreasuryGuard: async (NS, MODULE_NAME, supplyChain) => {
    try {
      const code = `(use ${NS}.${MODULE_NAME}-treasury) TREASURY-GUARD`;
      const res = await pactCalls(code, supplyChain);
      set({ treasuryGuard: res.result.data });
    } catch (err) {
      console.error(err);
    }
  },

  getLiquidityAccount: async (NS, MODULE_NAME, supplyChain) => {
    try {
      const code = `(use ${NS}.${MODULE_NAME}-treasury) LIQUIDITY-ACCOUNT`;
      const res = await pactCalls(code, supplyChain);
      set({ liquidityAccount: res.result.data });
    } catch (err) {
      console.error(err);
    }
  },

  getTreasuryTokenBalance: async (NS, MODULE_NAME, supplyChain, treasuryContractAccount) => {
    try {
      const code = `(${NS}.${MODULE_NAME}.get-balance "${treasuryContractAccount}")`;
      const res = await pactCalls(code, supplyChain);
      set({ treasuryTokenBalance: res.result.data });
    } catch (err) {
      console.error(err);
    }
  },

  getLiquidityTokenBalance: async (NS, MODULE_NAME, supplyChain, liquidityAccount) => {
    try {
      const code = `(${NS}.${MODULE_NAME}.get-balance "${liquidityAccount}")`;
      const res = await pactCalls(code, supplyChain);
      set({ liquidityTokenBalance: res.result.data });
    } catch (err) {
      console.error(err);
    }
  },

  getTreasuryKdaBalance: async (supplyChain, treasuryContractAccount) => {
    try {
      const code = `(coin.get-balance "${treasuryContractAccount}")`;
      const res = await pactCalls(code, supplyChain);
      set({ treasuryKdaBalance: res.result.data });
    } catch (err) {
      console.error(err);
    }
  },

  resetTreasuryState: () => {
    set({
      treasuryTokenBalance: 0,
      liquidityTokenBalance: 0,
      treasuryKdaBalance: 0,
      treasuryContractAccount: '',
      treasuryGuard: {},
      liquidityAccount: '',
      ac: '',
      amt: 0,
    });
  },
}));

export default useTreasuryStore;
