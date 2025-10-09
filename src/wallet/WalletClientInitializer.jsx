// import { useEffect } from 'react';
// import { useKadenaWallet } from '@kadena/wallet-adapter-react';
// import { setWalletClient } from './providers/wc.js';

// export const WalletClientInitializer = ({ children }) => {
//   const walletContext = useKadenaWallet();
//   const { client } = walletContext;

//   useEffect(() => {
//     if (client) {
//       setWalletClient(client);
      
//       // Store both client and full context globally as fallbacks
//       if (typeof window !== 'undefined') {
//         window.__KADENA_WALLET_CLIENT__ = client;
//         window.__KADENA_WALLET_CONTEXT__ = walletContext;
//         window.__KADENA_WALLET_ADAPTER_CONTEXT__ = { client, ...walletContext };
//       }
//     }
//   }, [client, walletContext]);

//   return children;
// };
