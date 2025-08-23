import config from "../config.js";

export const WC = "WC";
const networkId = config.networkId;

// Create a function to get the client from React context
let clientInstance = null;

export const setWalletClient = (client) => {
  clientInstance = client;
};

const wc = {
  name: "wc",
  config: {
    networkId: networkId,
    adapterName: 'WalletConnect'
  },
  connect: async function () {
    try {
      if (!clientInstance) {
        throw new Error("Wallet client not initialized. Make sure KadenaWalletProvider is wrapping your app.");
      }
      
      const account = await clientInstance.connect('WalletConnect');
      
      // Return the account data for the caller to handle store updates
      return {
        success: true,
        account: account.accountName,
        pubKey: account.publicKey,
        provider: "WC",
        session: { connected: true, account }
      };
    } catch (error) {
      console.error("Failed to connect to WalletConnect:", error);
      throw new Error("Failed to connect to the wallet");
    }
  },
  
  disconnect: async function () {
    try {
      if (!clientInstance) {
        throw new Error("Wallet client not initialized.");
      }
      
      await clientInstance.disconnect('WalletConnect');
      
      // Return success for the caller to handle store updates
      return { success: true };
    } catch (error) {
      console.error("WalletConnect disconnect failed:", error);
      throw new Error("WalletConnect client disconnection failed");
    }
  },
  
  sign: async function (signingCommand) {
    try {
      if (!clientInstance) {
        throw new Error("Wallet client not initialized.");
      }
      
      console.log("WalletConnect sign with command:", signingCommand);
      
      // Try different method names that might be available
      let result;
      if (typeof clientInstance.signTransaction === 'function') {
        console.log("Using signTransaction method for sign");
        result = await clientInstance.signTransaction('WalletConnect', signingCommand);
      } else if (typeof clientInstance.sign === 'function') {
        console.log("Using sign method for sign");
        result = await clientInstance.sign('WalletConnect', signingCommand);
      } else {
        console.error("No supported signing method found on client for sign");
        throw new Error("No supported signing method found");
      }
      
      console.log("WalletConnect sign result:", result);
      return result;
    } catch (error) {
      console.error("Error during signing:", error);
      throw error;
    }
  },
  
  quickSign: async function (data) {
    try {
      if (!clientInstance) {
        throw new Error("Wallet client not initialized.");
      }
      
      console.log("WalletConnect client methods:", Object.keys(clientInstance));
      console.log("Attempting to sign transaction with data:", data);
      
      // Try different method names that might be available
      let result;
      if (typeof clientInstance.signTransaction === 'function') {
        console.log("Using signTransaction method");
        result = await clientInstance.signTransaction('WalletConnect', data);
      } else if (typeof clientInstance.sign === 'function') {
        console.log("Using sign method");
        result = await clientInstance.sign('WalletConnect', data);
      } else if (typeof clientInstance.signCommand === 'function') {
        console.log("Using signCommand method");
        result = await clientInstance.signCommand('WalletConnect', data);
      } else {
        console.error("No supported signing method found on client. Available methods:", Object.keys(clientInstance));
        throw new Error("No supported signing method found");
      }
      
      console.log("WalletConnect signing result:", result);
      return result;
    } catch (error) {
      console.error("Error during quick signing:", error);
      throw error;
    }
  },
  
  quickSignAll: async function (data) {
    try {
      if (!clientInstance) {
        throw new Error("Wallet client not initialized.");
      }
      
      console.log("WalletConnect quickSignAll with data:", data);
      
      // Try different method names that might be available
      let result;
      if (typeof clientInstance.signTransaction === 'function') {
        console.log("Using signTransaction method for quickSignAll");
        result = await clientInstance.signTransaction('WalletConnect', data);
      } else if (typeof clientInstance.sign === 'function') {
        console.log("Using sign method for quickSignAll");
        result = await clientInstance.sign('WalletConnect', data);
      } else if (typeof clientInstance.signCommand === 'function') {
        console.log("Using signCommand method for quickSignAll");
        result = await clientInstance.signCommand('WalletConnect', data);
      } else {
        console.error("No supported signing method found on client for quickSignAll");
        throw new Error("No supported signing method found");
      }
      
      console.log("WalletConnect quickSignAll result:", result);
      return { responses: result };
    } catch (error) {
      console.error("Error during quick signing:", error);
      throw error;
    }
  },
};

export default wc;
