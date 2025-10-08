import { createWalletConnectAdapter } from '@kadena/wallet-adapter-walletconnect'
import { createSnapAdapter } from '@kadena/wallet-adapter-metamask-snap'
import { createMagicAdapter } from '@kadena/wallet-adapter-magic'
import { createChainweaverAdapter } from '@kadena/wallet-adapter-chainweaver'
import { createChainweaverLegacyAdapter } from '@kadena/wallet-adapter-chainweaver-legacy'
import config from '../config'

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
  createSnapAdapter({
    silent: true, 
  }),
  createMagicAdapter({
    magicApiKey: import.meta.env.VITE_APP_MAGIC_API_KEY,
    chainId: config.chainId,
    chainwebApiUrl: config.apiUrl,
    networkId: config.networkId,
  }),
  createChainweaverAdapter({
    chainId: config.chainId,
    chainwebApiUrl: config.apiUrl,
    networkId: config.networkId,
  }),
  createChainweaverLegacyAdapter({
    chainId: config.chainId,
    chainwebApiUrl: config.apiUrl,
    networkId: config.networkId,
  }),
];

export * from '@kadena/wallet-adapter-react';
