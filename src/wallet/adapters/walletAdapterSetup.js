import { createWalletConnectAdapter } from '@kadena/wallet-adapter-walletconnect'
import { createSnapAdapter } from '@kadena/wallet-adapter-metamask-snap'

export const adapters = [
  createWalletConnectAdapter({
    projectId: import.meta.env.VITE_APP_projectId,
    relayUrl: import.meta.env.VITE_APP_relayUrl || 'wss://relay.walletconnect.com',
    metadata: {
      name: "Kad-Pad",
      description: "The home of token launches on Kadena",
      url: "kadpad.xyz",
      icons: ["https://kadpad.xyz/favicon.ico"],
    },
  }),
  createSnapAdapter(),
];

export * from '@kadena/wallet-adapter-react';
