import { useEffect } from 'react';
import { useKadenaWallet } from '@kadena/wallet-adapter-react';
import { setWalletClient } from './providers/wc.js';

export const WalletClientInitializer = ({ children }) => {
  const { client } = useKadenaWallet();

  useEffect(() => {
    if (client) {
      setWalletClient(client);
    }
  }, [client]);

  return children;
};
