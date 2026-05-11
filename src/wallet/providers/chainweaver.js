import config from '../config';

export const CHAINWEAVER = 'CHAINWEAVER';

const chainweaver = {
  name: 'Chainweaver',
  connect: async function() {
    try {
      console.log("Starting Chainweaver connection...");
      
      const { createChainweaverAdapter } = await import('@kadena/wallet-adapter-chainweaver');
      
      // Create the adapter factory
      const chainweaverAdapterFactory = createChainweaverAdapter({
        chainId: config.chainId,
        chainwebApiUrl: config.apiUrl,
        networkId: config.networkId,
      });
      
      // Detect Chainweaver provider
      const provider = await chainweaverAdapterFactory.detect();
      if (!provider) {
        return {
          status: "error",
          message: "Chainweaver not available. Please install Chainweaver desktop application."
        };
      }

      // Create adapter instance
      const adapter = await chainweaverAdapterFactory.adapter(provider);
      
      // Connect using the adapter's request method with kadena_connect
      const response = await adapter.request({
        id: 1,
        method: 'kadena_connect'
      });

      const account = response.result;
      console.log("Chainweaver connection successful:", account);
      
      return {
        status: "success",
        account: {
          account: account.accountName,
          publicKey: account.guard?.keys?.[0] || account.keyset?.keys?.[0]
        }
      };
    } catch (error) {
      console.error("Chainweaver connection error:", error);
      return {
        status: "error",
        message: error.message || "Failed to connect to Chainweaver"
      };
    }
  },
  
  disconnect: async function() {
    try {
      const { createChainweaverAdapter } = await import('@kadena/wallet-adapter-chainweaver');
      
      const chainweaverAdapterFactory = createChainweaverAdapter({
        chainId: config.chainId,
        chainwebApiUrl: config.apiUrl,
        networkId: config.networkId,
      });
      
      const provider = await chainweaverAdapterFactory.detect();
      if (provider) {
        const adapter = await chainweaverAdapterFactory.adapter(provider);
        await adapter.disconnect();
      }
      return { status: "success" };
    } catch (error) {
      console.error("Chainweaver disconnect error:", error);
      return {
        status: "error",
        message: error.message
      };
    }
  },
  
  sign: async function(signingCommand) {
    try {
      const { createChainweaverAdapter } = await import('@kadena/wallet-adapter-chainweaver');
      
      const chainweaverAdapterFactory = createChainweaverAdapter({
        chainId: config.chainId,
        chainwebApiUrl: config.apiUrl,
        networkId: config.networkId,
      });
      
      const provider = await chainweaverAdapterFactory.detect();
      
      if (!provider) {
        throw new Error("Chainweaver not available");
      }
      
      const adapter = await chainweaverAdapterFactory.adapter(provider);

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
      console.error("Error in Chainweaver sign function:", error);
      return null;
    }
  },
  
  quickSign: async function(signingCommand) {
    try {
      const { createChainweaverAdapter } = await import('@kadena/wallet-adapter-chainweaver');
      
      const chainweaverAdapterFactory = createChainweaverAdapter({
        chainId: config.chainId,
        chainwebApiUrl: config.apiUrl,
        networkId: config.networkId,
      });
      
      const provider = await chainweaverAdapterFactory.detect();
      
      if (!provider) {
        throw new Error("Chainweaver not available");
      }
      
      const adapter = await chainweaverAdapterFactory.adapter(provider);

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
      const response = await adapter.request({
        id: 1,
        method: 'kadena_quicksign_v1',
        params: {
          commandSigDatas: [commandSigData]
        }
      });

      return response.result;
    } catch (error) { 
      console.error("Error in Chainweaver quickSign function:", error);
      return null;
    }
  },
  
  quickSignAll: async function(signingCommands) {
    try {
      const { createChainweaverAdapter } = await import('@kadena/wallet-adapter-chainweaver');
      
      const chainweaverAdapterFactory = createChainweaverAdapter({
        chainId: config.chainId,
        chainwebApiUrl: config.apiUrl,
        networkId: config.networkId,
      });
      
      const provider = await chainweaverAdapterFactory.detect();
      
      if (!provider) {
        throw new Error("Chainweaver not available");
      }
      
      const adapter = await chainweaverAdapterFactory.adapter(provider);

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
      console.error("Error in Chainweaver quickSignAll function:", error);
      throw error;
    }
  },
  
  quickSignCont: async function(signingCommand) {
    try {
      const { createChainweaverAdapter } = await import('@kadena/wallet-adapter-chainweaver');
      
      const chainweaverAdapterFactory = createChainweaverAdapter({
        chainId: config.chainId,
        chainwebApiUrl: config.apiUrl,
        networkId: config.networkId,
      });
      
      const provider = await chainweaverAdapterFactory.detect();
      
      if (!provider) {
        throw new Error("Chainweaver not available");
      }
      
      const adapter = await chainweaverAdapterFactory.adapter(provider);

      // First ensure we're connected
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
      console.error("Error in Chainweaver quickSignCont function:", error);
      return null;
    }
  }
};

export default chainweaver;