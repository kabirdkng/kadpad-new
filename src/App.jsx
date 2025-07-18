import React, { useState, useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
import LandingPage from './pages/LandingPage';
import LaunchPage from './pages/LaunchPage';
import Buy from './pages/Buy';
import Stake from './pages/Stake';
import Presale from './pages/Presale';
import Dashboard from './pages/Dashboard';
import Header from './components/Header';
import Footer from './components/Footer';
import Loader from './components/Loader';
import BackgroundEffect from './components/BackgroundEffect';

// Wallet Components
import ClientContextProvider from './wallet/providers/ClientContextProvider';
import ConnectWalletModal from './wallet/providers/ConnectWalletModal';
import walletConnectStore from './wallet/providers/connectWalletModalSlice';

// Utils
import { preloadImages } from './utils/imagePreloader';

// Assets
import logo from '/favicon.svg';
import kadpadGreen from './assets/KADPAD_Green-01.svg';
import wcLogo from './assets/WC.svg';
import tLogo from './assets/tlogo.svg';

const App = () => {
  const { showModal } = walletConnectStore();
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    const imagesToPreload = [
      logo,
      kadpadGreen,
      wcLogo,
      tLogo,
    ];

    // Simulate loading progress
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 20;
      });
    }, 100);

    preloadImages(imagesToPreload)
      .then(() => {
        setLoadingProgress(100);
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      })
      .catch(error => {
        console.error('Failed to load images:', error);
        setLoadingProgress(100);
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      });

    return () => clearInterval(progressInterval);
  }, []);

  if (isLoading) {
    return <Loader progress={loadingProgress} />;
  }

  return (
    <div className="App min-h-screen">
      <BackgroundEffect />
      
      <ClientContextProvider>
        <BrowserRouter>
          <div className="relative z-10 flex flex-col min-h-screen bg-primary-bg/95 backdrop-blur-sm">
            <Header />
            
            <main className="flex-1">
              <Routes>
                <Route path='/' element={<LandingPage />} />
                <Route path='/launch' element={<LaunchPage />} />
                <Route path='/sales' element={<Buy />} />
                <Route path='/staking' element={<Stake />} />
                <Route path='/presale/:namespace/:moduleName' element={<Presale />} />
                <Route path='/dashboard/:namespace/:moduleName' element={<Dashboard />} />
              </Routes>
            </main>
            
            <Footer />
          </div>
          
          {showModal && <ConnectWalletModal />}
        </BrowserRouter>
        
        <ToastContainer
          position="bottom-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
          toastClassName="!bg-card !border !border-border-color !text-primary-text"
        />
      </ClientContextProvider>
    </div>
  );
};

export default App;