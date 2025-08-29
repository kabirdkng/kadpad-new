import config from '../config';

export const MAGIC = 'MAGIC';

const magic = {
  name: 'magic',
  connect: async function() {
    try {
      if (!import.meta.env.VITE_APP_MAGIC_API_KEY) {
        return {
          status: "error",
          message: "Magic API key not configured. Please set VITE_APP_MAGIC_API_KEY in your environment."
        };
      }
      
      try {
        const { createMagicAdapter } = await import('@kadena/wallet-adapter-magic');
        
        const magicAdapterFactory = createMagicAdapter({
          magicApiKey: import.meta.env.VITE_APP_MAGIC_API_KEY,
          chainId: config.chainId,
          chainwebApiUrl: config.apiUrl,
          networkId: config.networkId
        });
        
        const provider = await magicAdapterFactory.detect();
        if (!provider) {
          return {
            status: "error",
            message: "Magic Wallet not available. Please ensure Magic is properly configured."
          };
        }

        const adapter = await magicAdapterFactory.adapter(provider);
        
        const response = await adapter.request({
          id: 1,
          method: 'kadena_connect'
        });

        const account = response.result;
        
        // Get account info
        const accountInfo = await adapter.getActiveAccount();

        console.log(accountInfo)

        // Extract public key from keyset or guard
        let publicKey = null;
        if (accountInfo?.keyset?.keys?.[0]) {
          // Use first key from keyset if available
          publicKey = accountInfo.keyset.keys[0];
        } else if (accountInfo?.guard?.keysetref) {
          // For keysetref, we need to use the account name as the reference
          // since the actual keys are stored on-chain
          publicKey = `keysetref:${accountInfo.guard.keysetref.ns}:${accountInfo.guard.keysetref.ksn}`;
        } else if (accountInfo?.publicKey) {
          publicKey = accountInfo.publicKey;
        } else {
          // Fallback to original method
          publicKey = account.guard?.keys?.[0] || account.keyset?.keys?.[0];
        }
        
        return {
          status: "success",
          account: {
            account: account.accountName,
            publicKey: publicKey
          }
        };
        
      } catch (factoryError) {
        const { detectMagicProvider, MagicAdapter } = await import('@kadena/wallet-adapter-magic');
        
        const provider = await detectMagicProvider();
        if (!provider) {
          return {
            status: "error",
            message: "Magic Wallet not available after fallback attempt."
          };
        }

        const adapter = new MagicAdapter({ 
          provider,
          magicApiKey: import.meta.env.VITE_APP_MAGIC_API_KEY,
          chainId: config.chainId,
          chainwebApiUrl: config.apiUrl,
          networkId: config.networkId
        });
        
        const response = await adapter.request({
          id: 1,
          method: 'kadena_connect'
        });

        const account = response.result;
        
        // Get account info
        const accountInfo = await adapter.getActiveAccount();

        // Extract public key from keyset or guard
        let publicKey = null;
        if (accountInfo?.keyset?.keys?.[0]) {
          // Use first key from keyset if available
          publicKey = accountInfo.keyset.keys[0];
        } else if (accountInfo?.guard?.keysetref) {
          // For keysetref, we need to use the account name as the reference
          // since the actual keys are stored on-chain
          publicKey = `keysetref:${accountInfo.guard.keysetref.ns}:${accountInfo.guard.keysetref.ksn}`;
        } else if (accountInfo?.publicKey) {
          publicKey = accountInfo.publicKey;
        } else {
          // Fallback to original method
          publicKey = account.guard?.keys?.[0] || account.keyset?.keys?.[0];
        }
        
        return {
          status: "success",
          account: {
            account: account.accountName,
            publicKey: publicKey
          }
        };
      }
    } catch (error) {
      return {
        status: "error",
        message: error.message || "Failed to connect to Magic Wallet"
      };
    }
  },
  
  disconnect: async function() {
    try {
      const { detectMagicProvider, MagicAdapter } = await import('@kadena/wallet-adapter-magic');
      
      const provider = await detectMagicProvider();
      if (provider) {
        const adapter = new MagicAdapter({ 
          provider,
          magicApiKey: import.meta.env.VITE_APP_MAGIC_API_KEY,
          chainId: config.chainId,
          chainwebApiUrl: config.apiUrl,
          networkId: config.networkId
        });
        await adapter.disconnect();
      }
      return { status: "success" };
    } catch (error) {
      console.error("Magic Wallet disconnect error:", error);
      return {
        status: "error",
        message: error.message
      };
    }
  },
  
  sign: async function(signingCommand) {
    try {
      const { detectMagicProvider, MagicAdapter } = await import('@kadena/wallet-adapter-magic');
      const provider = await detectMagicProvider();
      
      if (!provider) {
        throw new Error("Magic Wallet not available");
      }
      
      const adapter = new MagicAdapter({ 
        provider,
        magicApiKey: import.meta.env.VITE_APP_MAGIC_API_KEY,
        chainId: config.chainId,
        chainwebApiUrl: config.apiUrl,
        networkId: config.networkId
      });

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

      // Return consistent structure with X Wallet
      return {
        status: "success",
        ...response.result
      };
    } catch (error) {
      return {
        status: "fail",
        message: error.message || "Signing failed"
      };
    }
  },
  
  quickSign: async function(signingCommand) {
    try {
      const { detectMagicProvider, MagicAdapter } = await import('@kadena/wallet-adapter-magic');
      const provider = await detectMagicProvider();
      
      if (!provider) {
        throw new Error("Magic Wallet not available");
      }
      
      const adapter = new MagicAdapter({ 
        provider,
        magicApiKey: import.meta.env.VITE_APP_MAGIC_API_KEY,
        chainId: config.chainId,
        chainwebApiUrl: config.apiUrl,
        networkId: config.networkId
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

      const response = await adapter.request({
        id: 1,
        method: 'kadena_quicksign_v1',
        params: {
          commandSigDatas: [commandSigData]
        }
      });

      // Return consistent structure with X Wallet
      return {
        status: "success",
        ...response.result
      };
    } catch (error) { 
      return {
        status: "fail",
        message: error.message || "Quick signing failed"
      };
    }
  },
  
  quickSignAll: async function(signingCommands) {
    try {
      const { detectMagicProvider, MagicAdapter } = await import('@kadena/wallet-adapter-magic');
      const provider = await detectMagicProvider();
      
      if (!provider) {
        throw new Error("Magic Wallet not available");
      }
      
      const adapter = new MagicAdapter({ 
        provider,
        magicApiKey: import.meta.env.VITE_APP_MAGIC_API_KEY,
        chainId: config.chainId,
        chainwebApiUrl: config.apiUrl,
        networkId: config.networkId
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

      const response = await adapter.request({
        id: 1,
        method: 'kadena_quicksign_v1',
        params: {
          commandSigDatas: commandSigDatas
        }
      });

      // Return consistent structure with X Wallet
      return {
        status: "success",
        ...response.result
      };
    } catch (error) {
      return {
        status: "fail",
        message: error.message || "Quick sign all failed"
      };
    }
  },
  
  quickSignCont: async function(signingCommand) {
    try {
      const { detectMagicProvider, MagicAdapter } = await import('@kadena/wallet-adapter-magic');
      const provider = await detectMagicProvider();
      
      if (!provider) {
        throw new Error("Magic Wallet not available");
      }
      
      const adapter = new MagicAdapter({ 
        provider,
        magicApiKey: import.meta.env.VITE_APP_MAGIC_API_KEY,
        chainId: config.chainId,
        chainwebApiUrl: config.apiUrl,
        networkId: config.networkId
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

      const response = await adapter.request({
        id: 1,
        method: 'kadena_quicksign_v1',
        params: {
          commandSigDatas: [commandSigData]
        }
      });

      // Return consistent structure with X Wallet
      return {
        status: "success",
        ...response.result
      };
    } catch (error) { 
      return {
        status: "fail",
        message: error.message || "Quick sign continuation failed"
      };
    }
  }
};

export default magic;
