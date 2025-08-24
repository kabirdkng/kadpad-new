import React from 'react'
import ReactDOM from 'react-dom/client'
import { KadenaWalletProvider } from '@kadena/wallet-adapter-react'
import { adapters } from './wallet/adapters/walletAdapterSetup.js'
import { WalletClientInitializer } from './wallet/WalletClientInitializer.jsx'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <KadenaWalletProvider adapters={adapters}>
      <WalletClientInitializer>
        <App />
      </WalletClientInitializer>
    </KadenaWalletProvider>
  </React.StrictMode>,
)