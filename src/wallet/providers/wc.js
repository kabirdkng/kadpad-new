import useWalletStore from "../walletStore.jsx";
import { useWalletConnectClient } from "./ClientContextProvider";
import config from "../config";
import { createWalletConnectQuicksign } from "@kadena/client";

// Helper function to safely parse JSON
const safeJsonParse = (jsonString) => {
  try {
    return typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
  } catch {
    return null;
  }
};

export const WC = "WC";

const wc = {
  name: "wc",
  connect: async function () {
    const { client, session, connect } = useWalletConnectClient();
    // Use WalletConnect client to connect to the wallet
    await connect();

    if (client && session) {
      const fullAccountString = session.namespaces.kadena.accounts[0];
      const pubKey = fullAccountString.split(":").slice(2).join(":");
      const account = `k:${pubKey}`;

      // Save the session data and account data to the Zustand store.
      useWalletStore.setState({
        session,
        account,
        pubKey,
      });
      return account;
    } else {
      throw new Error("Failed to connect to the wallet");
    }
  },
  disconnect: async function () {
    const { client, disconnect } = useWalletConnectClient();

    if (client) {
      // Use WalletConnect client to disconnect from the wallet
      await disconnect();
      return;
    } else {
      throw new Error("WalletConnect client is not initialized");
    }
  },
  sign: async function (signingCommand, client, session) {
    // Use passed client and session parameters if available, otherwise fall back to hook
    let wcClient = client;
    let wcSession = session;
    
    if (!wcClient || !wcSession) {
      const { client: hookClient, session: hookSession } = useWalletConnectClient();
      wcClient = hookClient;
      wcSession = hookSession;
    }
    
    if (!wcClient || !wcSession) {
      throw new Error(
        "WalletConnect client is not initialized or session is not connected"
      );
    }
    
    const request = {
      topic: wcSession.topic,
      chainId: `kadena:${config.networkId}`,
      request: {
        method: "kadena_sign_v1",
        params: signingCommand,
      },
    };

    try {
      const result = await wcClient.request(request);
      
      // Handle different response formats
      let command;
      if (result?.result?.body) {
        command = result.result.body;
      } else if (result?.body) {
        command = result.body;
      } else if (result?.result) {
        command = result.result;
      } else {
        command = result;
      }
      
      return command;
    } catch (error) {
      console.error("Error during signing:", error);
      throw error;
    }
  },
  quickSign: async function (data, client, session) {
    // Use passed client and session parameters if available, otherwise fall back to hook
    let wcClient = client;
    let wcSession = session;
    
    if (!wcClient || !wcSession) {
      const { client: hookClient, session: hookSession } = useWalletConnectClient();
      wcClient = hookClient;
      wcSession = hookSession;
    }
    
    if (!wcClient || !wcSession) {
      throw new Error(
        "WalletConnect client is not initialized or session is not connected"
      );
    }
    
    const chainId = `kadena:${config.networkId}`;
    const quicksignWithWalletConnect = createWalletConnectQuicksign(
      wcClient,
      wcSession,
      chainId
    );
    
    try {
      const result = await quicksignWithWalletConnect(data);
      return result;
    } catch (error) {
      console.error("Error during quick signing:", error);
      throw error;
    }
  },
  quickSignAll: async function (data, client, session) {
    // Use passed client and session parameters if available, otherwise fall back to hook
    let wcClient = client;
    let wcSession = session;
    
    if (!wcClient || !wcSession) {
      const { client: hookClient, session: hookSession } = useWalletConnectClient();
      wcClient = hookClient;
      wcSession = hookSession;
    }
    
    if (!wcClient || !wcSession) {
      throw new Error(
        "WalletConnect client is not initialized or session is not connected"
      );
    }
    
    const chainId = `kadena:${config.networkId}`;
    const quicksignWithWalletConnect = createWalletConnectQuicksign(
      wcClient,
      wcSession,
      chainId
    );
    
    try {
      const result = await quicksignWithWalletConnect(data);
      return { responses: result };
    } catch (error) {
      console.error("Error during quick signing:", error);
      throw error;
    }
  },
};

export default wc;