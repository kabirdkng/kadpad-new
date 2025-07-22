import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Settings, ArrowRight, X } from 'lucide-react';
import useWalletStore from '../wallet/walletStore';
import { checkProjectStatus } from '../api';

const SalesConfigBanner = ({ namespace, moduleName, onDismiss }) => {
  const { account } = useWalletStore();
  const [needsConfig, setNeedsConfig] = useState(false);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (account && namespace && moduleName) {
      checkConfiguration();
    }
  }, [account, namespace, moduleName]);

  const checkConfiguration = async () => {
    try {
      const result = await checkProjectStatus(namespace, moduleName);
      setNeedsConfig(result.needsConfiguration);
      setProject(result.project);
      
      // Only show if the connected account is the deployer
      if (result.project && result.project.deployer && result.project.deployer !== account) {
        setNeedsConfig(false);
      }
    } catch (error) {
      console.error('Error checking project status:', error);
      setNeedsConfig(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    if (onDismiss) {
      onDismiss();
    }
  };

  if (loading || !needsConfig || !project || dismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-fade-in">
      <div className="card bg-gradient-card border-accent-primary/30 shadow-lg">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-accent-primary/20 border border-accent-primary/30 flex items-center justify-center">
              <Settings className="w-5 h-5 text-accent-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-primary-text text-sm">Configure Sales</h4>
              <p className="text-xs text-secondary">{project.tokendetails.SYMBOL}</p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-secondary hover:text-primary-text transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        
        <p className="text-sm text-secondary mb-4">
          Your project is launched! Configure sales details to enable trading.
        </p>
        
        <Link
          to={`/configure-sales/${namespace}/${moduleName}`}
          className="btn btn-primary w-full text-sm flex items-center justify-center gap-2 group"
        >
          Configure Now
          <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
};

export default SalesConfigBanner;