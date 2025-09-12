import config from '../config';
import { useKadenaWallet } from '@kadena/wallet-adapter-react';

export const METAMASK = 'METAMASK';

const metamask = {
  name: 'MetaMask Snap',
  connect: async function() {
    try {
      console.log("Starting MetaMask Snap connection...");
      
      const { detectSnapProvider, SnapAdapter } = await import('@kadena/wallet-adapter-metamask-snap');
      
      // Detect MetaMask provider - only show prompt when user explicitly connects
      const provider = await detectSnapProvider({ silent: false });
      if (!provider) {
        return {
          status: "error",
          message: "MetaMask not available. Please install MetaMask."
        };
      }

      // Create adapter instance using the constructor
      const adapter = new SnapAdapter({ provider });
      
      // Connect using the adapter's request method with kadena_connect
      const response = await adapter.request({
        id: 1,
        method: 'kadena_connect'
      });

      const account = response.result;
      console.log("MetaMask connection successful:", account);
      
      return {
        status: "success",
        account: {
          account: account.accountName,
          publicKey: account.guard?.keys?.[0] || account.keyset?.keys?.[0]
        }
      };
    } catch (error) {
      console.error("MetaMask connection error:", error);
      return {
        status: "error",
        message: error.message || "Failed to connect to MetaMask Snap"
      };
    }
  },
  
  disconnect: async function() {
    try {
      const { detectSnapProvider, SnapAdapter } = await import('@kadena/wallet-adapter-metamask-snap');
      
      const provider = await detectSnapProvider({ silent: true });
      if (provider) {
        const adapter = new SnapAdapter({ provider });
        await adapter.disconnect();
      }
      return { status: "success" };
    } catch (error) {
      console.error("MetaMask disconnect error:", error);
      return {
        status: "error",
        message: error.message
      };
    }
  },
  
  sign: async function(signingCommand) {
    try {
      const { detectSnapProvider, SnapAdapter } = await import('@kadena/wallet-adapter-metamask-snap');
      const provider = await detectSnapProvider({ silent: true });
      
      if (!provider) {
        throw new Error("MetaMask Snap not available");
      }
      
      const adapter = new SnapAdapter({ provider });

      // First ensure we're connected to get the account ID
      const connectResponse = await adapter.request({
        id: 1,
        method: 'kadena_connect'
      });

      // The SnapAdapter uses request method, not direct sign method
      // Use kadena_sign_v1 but it's not implemented, so we'll use kadena_quicksign_v1
      const commandObj = JSON.parse(signingCommand.cmd);
      const signers = commandObj.payload.exec.data.ks.keys.map(pubKey => {
        return {
          pubKey: pubKey,
          sig: null,
          clist: commandObj.signers[0].clist, 
        };
      });

      const commandSigData = {
        cmd: JSON.stringify(commandObj),
        sigs: signers,
      };

      const response = await adapter.request({
        id: 1,
        method: 'kadena_quicksign_v1',
        params: {
          commandSigDatas: [commandSigData]
        }
      });

      return response.result;
    } catch (error) {
      console.error("Error in MetaMask sign function:", error);
      return null;
    }
  },
  
  quickSign: async function(signingCommand) {
    try {
      const { detectSnapProvider, SnapAdapter } = await import('@kadena/wallet-adapter-metamask-snap');
      const provider = await detectSnapProvider({ silent: true });
      
      if (!provider) {
        throw new Error("MetaMask Snap not available");
      }
      
      const adapter = new SnapAdapter({ provider });

      // First ensure we're connected to get the account ID
      const connectResponse = await adapter.request({
        id: 1,
        method: 'kadena_connect'
      });

      const commandObj = JSON.parse(signingCommand.cmd);
      const signers = commandObj.payload.exec.data.ks.keys.map(pubKey => {
        return {
          pubKey: pubKey,
          sig: null, // Initial signature is null
          clist: commandObj.signers[0].clist, 
        };
      });

      const commandSigData = {
        cmd: JSON.stringify(commandObj),
        sigs: signers,
      };

      // Use the adapter's request method with kadena_quicksign_v1
      // The snap internally calls _signTransaction which needs the connected account id
      const response = await adapter.request({
        id: 1,
        method: 'kadena_quicksign_v1',
        params: {
          commandSigDatas: [commandSigData]
        }
      });

      return response.result;
    } catch (error) { 
      console.error("Error in MetaMask quickSign function:", error);
      return null;
    }
  },
  
  quickSignAll: async function(signingCommands) {
    try {
      const { detectSnapProvider, SnapAdapter } = await import('@kadena/wallet-adapter-metamask-snap');
      const provider = await detectSnapProvider({ silent: true });
      
      if (!provider) {
        throw new Error("MetaMask Snap not available");
      }
      
      const adapter = new SnapAdapter({ provider });

      // First ensure we're connected to get the account ID
      const connectResponse = await adapter.request({
        id: 1,
        method: 'kadena_connect'
      });

      const commandSigDatas = signingCommands.map(command => {
        const commandObj = JSON.parse(command.cmd);
        const signers = commandObj.payload.exec.data.ks.keys.map(pubKey => {
          return {
            pubKey: pubKey,
            sig: null, 
            clist: commandObj.signers[0].clist,
          };
        });

        return {
          cmd: JSON.stringify(commandObj),
          sigs: signers,
        };
      });

      // Use the adapter's request method with kadena_quicksign_v1 for multiple commands
      const response = await adapter.request({
        id: 1,
        method: 'kadena_quicksign_v1',
        params: {
          commandSigDatas: commandSigDatas
        }
      });

      return response.result;
    } catch (error) {
      console.error("Error in MetaMask quickSignAll function:", error);
      throw error;
    }
  },
  
  quickSignCont: async function(signingCommand) {
    try {
      const { detectSnapProvider, SnapAdapter } = await import('@kadena/wallet-adapter-metamask-snap');
      const provider = await detectSnapProvider({ silent: true });
      
      if (!provider) {
        throw new Error("MetaMask Snap not available");
      }
      
      const adapter = new SnapAdapter({ provider });

      // First ensure we're connected to get the account ID
      const connectResponse = await adapter.request({
        id: 1,
        method: 'kadena_connect'
      });

      const commandObj = JSON.parse(signingCommand.cmd);
      const signers = commandObj.payload.cont.data.ks.keys.map(pubKey => {
        return {
          pubKey: pubKey,
          sig: null, // Initial signature is null
          clist: commandObj.signers[0].clist, 
        };
      });

      const commandSigData = {
        cmd: JSON.stringify(commandObj),
        sigs: signers,
      };

      // Use the adapter's request method with kadena_quicksign_v1
      const response = await adapter.request({
        id: 1,
        method: 'kadena_quicksign_v1',
        params: {
          commandSigDatas: [commandSigData]
        }
      });

      return response.result;
    } catch (error) { 
      console.error("Error in MetaMask quickSignCont function:", error);
      return null;
    }
  }
};

export default metamask;
