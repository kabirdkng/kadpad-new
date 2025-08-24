import React from 'react'
import ReactDOM from 'react-dom/client'
import { KadenaWalletProvider } from '@kadena/wallet-adapter-react'
import { createWalletConnectAdapter } from '@kadena/wallet-adapter-walletconnect'
import { WalletClientInitializer } from './wallet/WalletClientInitializer.jsx'
import App from './App'
import './index.css'

const adapters = [
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
];

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <KadenaWalletProvider adapters={adapters}>
      <WalletClientInitializer>
        <App />
      </WalletClientInitializer>
    </KadenaWalletProvider>
  </React.StrictMode>,
)