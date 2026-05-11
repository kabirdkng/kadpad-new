import React from 'react'
import ReactDOM from 'react-dom/client'
import { KadenaWalletProvider } from '@kadena/wallet-adapter-react'
import { adapters } from './wallet/adapters/walletAdapterSetup.js'
import App from './App'
import './index.css'
import ClientContextProvider from './wallet/providers/ClientContextProvider.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <KadenaWalletProvider adapters={adapters}>
      <ClientContextProvider>
        <App />
      </ClientContextProvider>
    </KadenaWalletProvider>
  </React.StrictMode>,
)