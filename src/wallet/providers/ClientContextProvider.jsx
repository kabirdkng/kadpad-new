import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import SignClient from "@walletconnect/sign-client";
import { WalletConnectModal } from "@walletconnect/modal";
import { getSdkError } from "@walletconnect/utils";
import useWalletStore from "../walletStore.jsx";
import walletConnectStore from "./connectWalletModalSlice";
import { toast } from "react-toastify";
import { getWalletDisplayName } from "../../utils/walletDetection.js";

export const ClientContext = createContext();

const currentNetwork =
  import.meta.env.VITE_APP_ENV === "mainnet" ? "mainnet01" : "testnet04";

const web3Modal = new WalletConnectModal({
  projectId: import.meta.env.VITE_APP_projectId,
  themeMode: "light",
  walletConnectVersion: 2,
  chains: [`kadena:${currentNetwork}`],
});

function ClientContextProvider({ children }) {
  const [client, setClient] = useState();
  const [pairings, setPairings] = useState([]);
  const [session, setSession] = useState();
  const [accounts, setAccounts] = useState();
  const { sethideConnectWalletModal } = walletConnectStore.getState();
  const [isInitializing, setIsInitializing] = useState(false);

  const reset = () => {
    setSession(undefined);
    // Clear the wallet store when WalletConnect disconnects
    const currentState = useWalletStore.getState();
    if (currentState.provider === "WC") {
      // Use the store's clearWalletSession method for proper cleanup
      useWalletStore.getState().clearWalletSession();
    }
  };

  const onSessionConnected = useCallback(async (_session) => {
    setSession(_session);
    setAccounts(_session?.namespaces?.kadena?.accounts);
    
    // Update the main wallet store with WalletConnect connection info
    if (_session?.namespaces?.kadena?.accounts?.length > 0) {
      const fullAccountString = _session.namespaces.kadena.accounts[0];
      const pubKey = fullAccountString.split(":").slice(2).join(":");
      const account = `k:${pubKey}`;
      
      // Use setSessionData to properly save the session with persistence
      useWalletStore.getState().setSessionData({
        provider: "WC",
        account,
        pubKey,
        isConnected: true,
      });
      
      // Also set the session separately
      useWalletStore.setState({ session: _session });
      
      // Show success toast
      toast.success(`Successfully connected to ${getWalletDisplayName("WC")}`);
    }
  }, []);

  const connect = useCallback(
    async (pairing) => {
      if (typeof client === "undefined") {
        throw new Error("WalletConnect is not initialized");
      }
      try {
        const currentNetwork =
          import.meta.env.VITE_APP_ENV === "mainnet"
            ? "mainnet01"
            : "testnet04";

        const { uri, approval } = await client.connect({
          pairingTopic: pairing?.topic,
          requiredNamespaces: {
            kadena: {
              methods: [
                "kadena_getAccounts_v1",
                "kadena_sign_v1",
                "kadena_quicksign_v1",
              ],
              chains: [`kadena:${currentNetwork}`],
              events: [],
            },
          },
        });
        if (uri) {
          web3Modal.openModal({ uri }).catch((error) => {
            console.error("Error opening modal:", error);
          });
        }

        const session = await approval();
        await onSessionConnected(session);
        web3Modal.closeModal();

        setPairings(client.pairing.getAll({ active: true }));

        const fullAccountString = session.namespaces.kadena.accounts[0];
        const pubKey = fullAccountString.split(":").slice(2).join(":");
        const account = `k:${pubKey}`;
        useWalletStore.setState({
          pubKey: pubKey,
          provider: ["WC"],
          isConnected: true,
        });
        sethideConnectWalletModal();
        useWalletStore.setState({
          session,
          account,
        });
      } catch (e) {
        console.error(e);
      } finally {
        web3Modal.closeModal();
      }
    },
    [client, onSessionConnected]
  );

  const disconnect = useCallback(async () => {
    if (typeof client === "undefined") {
      throw new Error("WalletConnect is not initialized");
    }
    if (typeof session === "undefined") {
      throw new Error("Session is not connected");
    }

    try {
      await client.disconnect({
        topic: session.topic,
        reason: getSdkError("USER_DISCONNECTED"),
      });
    } catch (error) {
      console.error("SignClient.disconnect failed:", error);
    } finally {
      useWalletStore.setState({
        account: "",
        provider: null,
        pubKey: "",
        session: null,
      });

      useWalletStore.setState({
        messages: `Successfully Disconnected from WalletConnect`,
        networkId: null,
      });

      reset();
    }
  }, [client, session]);

  const _subscribeToEvents = useCallback(
    async (_client) => {
      if (typeof _client === "undefined") {
        throw new Error("WalletConnect is not initialized");
      }

      _client.on("session_ping", (args) => {
        console.log("EVENT", "session_ping", args);
      });

      _client.on("session_event", (args) => {
        console.log("EVENT", "session_event", args);
      });

      _client.on("session_update", ({ topic, params }) => {
        const { namespaces } = params;
        console.log("EVENT", "session_update", namespaces);
        const _session = _client.session.get(topic);
        console.log("EVENT", "session_update", _session);
        const updatedSession = { ..._session, namespaces };
        onSessionConnected(updatedSession);
      });

      _client.on("session_delete", () => {
        reset();
      });
    },
    [onSessionConnected]
  );

  const _checkPersistedState = useCallback(
    async (_client) => {
      if (typeof _client === "undefined") {
        throw new Error("WalletConnect is not initialized");
      }
      setPairings(_client.pairing.getAll({ active: true }));

      if (typeof session !== "undefined") return;
      if (_client.session.length) {
        const sessions = _client.session.getAll();
        if (sessions.length) {
          const _session = sessions[sessions.length - 1];
          await onSessionConnected(_session);
          return _session;
        }
      }
    },
    [session, onSessionConnected]
  );

  const createClient = useCallback(async () => {
    try {
      setIsInitializing(true);

      const projectId = import.meta.env.VITE_APP_projectId;
      const relayUrl =
        import.meta.env.VITE_APP_relayUrl ||
        "wss://relay.walletconnect.com";

      // Debug logging for production
      console.log(
        "WalletConnect init with projectId:",
        projectId ? "present" : "missing"
      );

      if (!projectId) {
        throw new Error(
          "WalletConnect projectId is missing. Please check environment variables."
        );
      }

      const _client = await SignClient.init({
        relayUrl,
        projectId,
        metadata: {
          name: "Kadpad",
          description: "Kadpad Platform",
          url: "https://kadpad.xyz",
          icons: ["https://kadpad.xyz/favicon.svg"],
        },
      });

      setClient(_client);
      await _subscribeToEvents(_client);
      await _checkPersistedState(_client);
    } catch (error) {
      console.error("Failed to initialize WalletConnect client:", error);
      setIsInitializing(false);
      throw error;
    } finally {
      setIsInitializing(false);
    }
  }, [_checkPersistedState, _subscribeToEvents]);

  useEffect(() => {
    if (!client) {
      createClient();
    }
  }, [client, createClient]);

  const value = useMemo(
    () => ({
      pairings,
      isInitializing,
      accounts,
      client,
      session,
      connect,
      disconnect,
    }),
    [pairings, isInitializing, accounts, client, session, connect, disconnect]
  );

  return (
    <ClientContext.Provider value={value}>{children}</ClientContext.Provider>
  );
}

export function useWalletConnectClient() {
  const context = useContext(ClientContext);
  if (context === undefined) {
    throw new Error(
      "useWalletConnectClient must be used within a ClientContextProvider"
    );
  }
  return context;
}

export default ClientContextProvider;