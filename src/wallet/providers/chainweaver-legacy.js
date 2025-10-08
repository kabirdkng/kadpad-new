import config from '../config';

export const CHAINWEAVER_LEGACY = 'CHAINWEAVER_LEGACY';

const chainweaverLegacy = {
  name: 'Chainweaver Legacy',
  connect: async function(accountName = null) {
    try {
      console.log("Starting Chainweaver Legacy connection with account:", accountName);
      
      if (!accountName) {
        return {
          status: "error",
          message: "Account name is required for Chainweaver Legacy connection"
        };
      }

      // Use the original library for connection since it handles the kadena_connect properly
      const { createChainweaverLegacyAdapter } = await import('@kadena/wallet-adapter-chainweaver-legacy');
      
      // Create the adapter factory
      const chainweaverLegacyAdapterFactory = createChainweaverLegacyAdapter({
        chainId: config.chainId,
        chainwebApiUrl: config.apiUrl,
        networkId: config.networkId,
      });
      
      // Detect Chainweaver Legacy provider
      const provider = await chainweaverLegacyAdapterFactory.detect();
      if (!provider) {
        return {
          status: "error",
          message: "Chainweaver Legacy not available. Please ensure the desktop application is running."
        };
      }

      // Create adapter instance
      const adapter = await chainweaverLegacyAdapterFactory.adapter(provider);
      
      // Use the kadena_connect method
      const response = await adapter.request({
        id: 1,
        method: 'kadena_connect',
        params: {
          accountName: accountName,
          chainIds: [config.chainId],
          tokenContract: "coin"
        }
      });

      console.log("Chainweaver Legacy full response:", response);

      // Check if the response indicates success
      if (response && response.result && !response.error) {
        const result = response.result;
        console.log("Chainweaver Legacy connection successful:", result);
        
        return {
          status: "success",
          account: {
            account: result.accountName || accountName,
            publicKey: result.guard?.keys?.[0] || result.keyset?.keys?.[0] || null
          }
        };
      } else if (response && response.error) {
        console.error("Chainweaver Legacy connection failed:", response.error);
        return {
          status: "error",
          message: response.error.message || "Failed to connect with provided account"
        };
      } else {
        return {
          status: "error",
          message: "Invalid response from Chainweaver Legacy"
        };
      }
    } catch (error) {
      console.error("Chainweaver Legacy connection error:", error);
      return {
        status: "error",
        message: error.message || "Failed to connect to Chainweaver Legacy"
      };
    }
  },
  
  disconnect: async function() {
    // For direct HTTP approach, we don't need to maintain persistent connections
    // Disconnection is handled at the UI level
    return { status: "success" };
  },
  
  sign: async function(signingCommand) {
    try {
      const { createChainweaverLegacyAdapter } = await import('@kadena/wallet-adapter-chainweaver-legacy');
      
      const chainweaverLegacyAdapterFactory = createChainweaverLegacyAdapter({
        chainId: config.chainId,
        chainwebApiUrl: config.apiUrl,
        networkId: config.networkId,
      });
      
      const provider = await chainweaverLegacyAdapterFactory.detect();
      
      if (!provider) {
        throw new Error("Chainweaver Legacy not available");
      }
      
      const adapter = await chainweaverLegacyAdapterFactory.adapter(provider);

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
        method: 'kadena_sign_v1',
        params: commandSigData
      });

      return response.result;
    } catch (error) {
      console.error("Error in Chainweaver Legacy sign function:", error);
      
      // Provide specific error handling for browser blocking
      if (error.message.includes('ERR_BLOCKED_BY_CLIENT') || 
          error.message.includes('net::ERR_BLOCKED_BY_CLIENT')) {
        throw new Error('Browser is blocking the connection to Chainweaver Legacy. This may be due to:\n• Ad blocker or browser extension blocking localhost requests\n• Browser security policy preventing remote sites from accessing localhost\n• Try disabling ad blockers or using the application on localhost');
      }
      
      return null;
    }
  },
  
  quickSign: async function(signingCommand) {
    try {
      // Use the original library for signing as well
      const { createChainweaverLegacyAdapter } = await import('@kadena/wallet-adapter-chainweaver-legacy');
      
      const chainweaverLegacyAdapterFactory = createChainweaverLegacyAdapter({
        chainId: config.chainId,
        chainwebApiUrl: config.apiUrl,
        networkId: config.networkId,
      });
      
      const provider = await chainweaverLegacyAdapterFactory.detect();
      
      if (!provider) {
        throw new Error("Chainweaver Legacy not available");
      }
      
      const adapter = await chainweaverLegacyAdapterFactory.adapter(provider);

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
      console.error("Error in Chainweaver Legacy quickSign function:", error);
      
      // Provide specific error handling for browser blocking
      if (error.message.includes('ERR_BLOCKED_BY_CLIENT') || 
          error.message.includes('net::ERR_BLOCKED_BY_CLIENT')) {
        throw new Error('Browser is blocking the connection to Chainweaver Legacy. This may be due to:\n• Ad blocker or browser extension blocking localhost requests\n• Browser security policy preventing remote sites from accessing localhost\n• Try disabling ad blockers or using the application on localhost');
      }
      
      if (error.message.includes('Failed to fetch') || 
          error.message.includes('NetworkError') ||
          error.message.includes('ERR_CONNECTION_REFUSED')) {
        throw new Error('Cannot connect to Chainweaver Legacy desktop application. Please ensure:\n• Chainweaver desktop app is installed and running\n• The application is running on your local machine\n• No firewall is blocking port 9467');
      }
      
      throw new Error("Failed to sign transaction. Please ensure Chainweaver Legacy is running and try again.");
    }
  },
  
  quickSignAll: async function(signingCommands) {
    try {
      const { createChainweaverLegacyAdapter } = await import('@kadena/wallet-adapter-chainweaver-legacy');
      
      const chainweaverLegacyAdapterFactory = createChainweaverLegacyAdapter({
        chainId: config.chainId,
        chainwebApiUrl: config.apiUrl,
        networkId: config.networkId,
      });
      
      const provider = await chainweaverLegacyAdapterFactory.detect();
      
      if (!provider) {
        throw new Error("Chainweaver Legacy not available");
      }
      
      const adapter = await chainweaverLegacyAdapterFactory.adapter(provider);

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
      console.error("Error in Chainweaver Legacy quickSignAll function:", error);
      
      // Provide specific error handling for browser blocking
      if (error.message.includes('ERR_BLOCKED_BY_CLIENT') || 
          error.message.includes('net::ERR_BLOCKED_BY_CLIENT')) {
        throw new Error('Browser is blocking the connection to Chainweaver Legacy. This may be due to:\n• Ad blocker or browser extension blocking localhost requests\n• Browser security policy preventing remote sites from accessing localhost\n• Try disabling ad blockers or using the application on localhost');
      }
      
      throw error;
    }
  },
  
  quickSignCont: async function(signingCommand) {
    try {
      const { createChainweaverLegacyAdapter } = await import('@kadena/wallet-adapter-chainweaver-legacy');
      
      const chainweaverLegacyAdapterFactory = createChainweaverLegacyAdapter({
        chainId: config.chainId,
        chainwebApiUrl: config.apiUrl,
        networkId: config.networkId,
      });
      
      const provider = await chainweaverLegacyAdapterFactory.detect();
      
      if (!provider) {
        throw new Error("Chainweaver Legacy not available");
      }
      
      const adapter = await chainweaverLegacyAdapterFactory.adapter(provider);

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
      console.error("Error in Chainweaver Legacy quickSignCont function:", error);
      
      // Provide specific error handling for browser blocking
      if (error.message.includes('ERR_BLOCKED_BY_CLIENT') || 
          error.message.includes('net::ERR_BLOCKED_BY_CLIENT')) {
        throw new Error('Browser is blocking the connection to Chainweaver Legacy. This may be due to:\n• Ad blocker or browser extension blocking localhost requests\n• Browser security policy preventing remote sites from accessing localhost\n• Try disabling ad blockers or using the application on localhost');
      }
      
      return null;
    }
  }
};

export default chainweaverLegacy;