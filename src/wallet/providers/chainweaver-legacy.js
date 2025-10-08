import config from '../config';

export const CHAINWEAVER_LEGACY = 'CHAINWEAVER_LEGACY';

// Custom HTTP requests for signing operations
const CHAINWEAVER_URL = 'http://127.0.0.1:9467';

// Helper function to make direct requests to Chainweaver for signing
const makeChainweaverRequest = async (endpoint, data) => {
  try {
    const response = await fetch(`${CHAINWEAVER_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    // Enhanced error handling with specific ad blocker guidance
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('❌ Cannot connect to Chainweaver Legacy desktop application.\n\n📋 Please check:\n• Chainweaver desktop app is installed and running\n• The application is running on your local machine\n• Your firewall is not blocking port 9467');
    }
    
    if (error.message.includes('ERR_BLOCKED_BY_CLIENT') || error.message.includes('net::ERR_BLOCKED_BY_CLIENT')) {
      throw new Error('🚫 Connection blocked by browser or ad blocker!\n\n🛠️ To fix this issue:\n• DISABLE ad blockers (uBlock Origin, AdBlock Plus, etc.)\n• Disable browser extensions that block requests\n• Add this site to your ad blocker whitelist\n• Try using a different browser\n• Ensure Chainweaver Legacy desktop app is running\n\n💡 Ad blockers often block localhost requests for security');
    }
    
    if (error.message.includes('NetworkError') || error.message.includes('ERR_CONNECTION_REFUSED')) {
      throw new Error('🔌 Cannot reach Chainweaver Legacy.\n\n📋 Please ensure:\n• Chainweaver Legacy desktop application is running\n• The app is not blocked by your firewall\n• Port 9467 is not being used by another application');
    }
    
    throw error;
  }
};

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
      
      // Check for ad blocker interference
      if (error.message.includes('ERR_BLOCKED_BY_CLIENT') || error.message.includes('net::ERR_BLOCKED_BY_CLIENT')) {
        return {
          status: "error",
          message: "🚫 Connection blocked by ad blocker!\n\n🛠️ To fix this:\n• DISABLE ad blockers (uBlock Origin, AdBlock Plus, etc.)\n• Add this site to your ad blocker whitelist\n• Try a different browser\n• Ensure Chainweaver Legacy desktop app is running"
        };
      }
      
      return {
        status: "error",
        message: error.message || "Failed to connect to Chainweaver Legacy"
      };
    }
  },
  
  disconnect: async function() {
    // Disconnection is handled at the UI level for Chainweaver Legacy
    return { status: "success" };
  },
  
  sign: async function(signingCommand) {
    try {
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

      // Use our custom HTTP request for regular signing
      const response = await makeChainweaverRequest('/v1/sign', commandSigData);

      return response;
    } catch (error) {
      console.error("Error in Chainweaver Legacy sign function:", error);
      
      // Provide helpful error messages
      if (error.message.includes('Cannot connect to Chainweaver Legacy')) {
        throw error; // Re-throw our custom connection message
      }
      
      throw new Error("Failed to sign transaction. Please ensure Chainweaver Legacy is running and try again.");
    }
  },
  
  quickSign: async function(signingCommand) {
    try {
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

      // Use our custom HTTP request to bypass adapter CORS issues
      const response = await makeChainweaverRequest('/v1/quicksign', {
        cmdSigDatas: [commandSigData]
      });

      return response;
    } catch (error) { 
      console.error("Error in Chainweaver Legacy quickSign function:", error);
      
      // Provide helpful error messages based on the error type
      if (error.message.includes('Cannot connect to Chainweaver Legacy')) {
        throw error; // Re-throw our custom connection message
      }
      
      if (error.message.includes('HTTP 4') || error.message.includes('HTTP 5')) {
        throw new Error("Chainweaver Legacy rejected the signing request. Please check the transaction details and try again.");
      }
      
      throw new Error("Failed to sign transaction. Please ensure Chainweaver Legacy is running and try again.");
    }
  },
  
  quickSignAll: async function(signingCommands) {
    try {
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

      // Use our custom HTTP request to bypass adapter CORS issues
      const response = await makeChainweaverRequest('/v1/quicksign', {
        cmdSigDatas: commandSigDatas
      });

      return response;
    } catch (error) {
      console.error("Error in Chainweaver Legacy quickSignAll function:", error);
      
      // Provide helpful error messages
      if (error.message.includes('Cannot connect to Chainweaver Legacy')) {
        throw error; // Re-throw our custom connection message
      }
      
      if (error.message.includes('HTTP 4') || error.message.includes('HTTP 5')) {
        throw new Error("Chainweaver Legacy rejected the signing request. Please check the transaction details and try again.");
      }
      
      throw new Error("Failed to sign transactions. Please ensure Chainweaver Legacy is running and try again.");
    }
  },
  
  quickSignCont: async function(signingCommand) {
    try {
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

      // Use our custom HTTP request to bypass adapter CORS issues
      const response = await makeChainweaverRequest('/v1/quicksign', {
        cmdSigDatas: [commandSigData]
      });

      return response;
    } catch (error) { 
      console.error("Error in Chainweaver Legacy quickSignCont function:", error);
      
      // Provide helpful error messages
      if (error.message.includes('Cannot connect to Chainweaver Legacy')) {
        throw error; // Re-throw our custom connection message
      }
      
      if (error.message.includes('HTTP 4') || error.message.includes('HTTP 5')) {
        throw new Error("Chainweaver Legacy rejected the continuation signing request. Please check the transaction details and try again.");
      }
      
      throw new Error("Failed to sign continuation transaction. Please ensure Chainweaver Legacy is running and try again.");
    }
  }
};

export default chainweaverLegacy;