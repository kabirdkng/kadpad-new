import useWalletStore from "../walletStore.jsx";
import { useWalletConnectClient } from "./ClientContextProvider";
import config from "../config.js";
import { createWalletConnectQuicksign } from "@kadena/client";


export const WC = "WC";
const networkId = config.networkId;

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
      // console.log("pb", pubKey);
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
    if (client && session) {
      const request = {
        topic: session.topic,
        chainId: `kadena:${networkId}`,
        request: {
          method: "kadena_sign_v1", // use the Kadena signing method
          params: signingCommand, // directly pass the signingCommand
        },
      };

      try {
        // Use WalletConnect client to send signing request to the wallet
        const result = await client.request(request);
        return result;
      } catch (error) {
        console.error("Error during signing:", error);
        throw error;
      }
    } else {
      throw new Error(
        "WalletConnect client is not initialized or session is not connected"
      );
    }
  },
  quickSign: async function (data, client, session) {
    if (client && session) {
      const chainId = `kadena:${networkId}`;
      const quicksignWithWalletConnect = createWalletConnectQuicksign(
        client,
        session,
        chainId
      );
      console.log("data", data)
      try {
        const result = await quicksignWithWalletConnect(data);
        return result;
      } catch (error) {
        console.error("Error during quick signing:", error);
        throw error;
      }
    } else {
      throw new Error(
        "WalletConnect client is not initialized or session is not connected"
      );
    }
  },
  quickSignAll: async function (data, client, session) {
    // console.log("data", data)
    if (client && session) {
      const chainId = `kadena:${networkId}`;
      console.log("dt", data)
      // console.log("client", client)
      // console.log("session", session)
      const quicksignWithWalletConnect = createWalletConnectQuicksign(
        client,
        session,
        chainId
      );
      try {
        // Use the quicksign function with the provided data
        const result = await quicksignWithWalletConnect(data);
        console.log("result", result)
        return { responses: result };
      } catch (error) {
        console.error("Error during quick signing:", error);
        throw error;
      }
    } else {
      throw new Error(
        "WalletConnect client is not initialized or session is not connected"
      );
    }
  },
};

export default wc;
