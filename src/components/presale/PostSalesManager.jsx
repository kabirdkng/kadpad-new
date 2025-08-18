import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Package, Zap, DollarSign, RotateCcw } from 'lucide-react';
import { usePostSalesOperations } from '../../hooks/usePostSalesOperations';
import { pactCalls } from '../../pactcalls/kadena';

const PostSalesManager = ({
  namespace,
  salesModuleName,
  supplyChain,
  client,
  session,
  moduleName,
  onBack = null
}) => {
  const [distributionRoundsNeeded, setDistributionRoundsNeeded] = useState(0);
  const [currentStep, setCurrentStep] = useState('distribution');
  const [isLoading, setIsLoading] = useState(true);

  const {
    isDistributing,
    isEndingSales,
    isInitializingLiquidity,
    distributionComplete,
    salesEnded,
    liquidityInitialized,
    distributeTokens,
    endSales,
    initLiquidity,
    checkDistributionStatus,
    checkSalesStatus
  } = usePostSalesOperations(
    namespace,
    salesModuleName,
    supplyChain,
    client,
    session,
    moduleName
  );

  const fetchDistributionRoundsNeeded = async () => {
    try {
      const code = `(${namespace}.${salesModuleName}.get-distribution-rounds-needed)`;
      const response = await pactCalls(code, supplyChain);
      if (response?.result?.data !== undefined && response?.result?.data !== null) {
        // Handle different response formats
        let rounds;
        if (typeof response.result.data === 'object' && response.result.data.int !== undefined) {
          rounds = response.result.data.int;
        } else if (typeof response.result.data === 'number') {
          rounds = response.result.data;
        } else {
          rounds = parseInt(response.result.data) || 0;
        }
        setDistributionRoundsNeeded(Number(rounds));
      } else {
        setDistributionRoundsNeeded(0);
      }
    } catch (error) {
      console.error('Error fetching distribution rounds needed:', error);
      setDistributionRoundsNeeded(0);
    }
  };

  const handleDistribute = async () => {
    const success = await distributeTokens();
    if (success) {
      setTimeout(async () => {
        await fetchDistributionRoundsNeeded();
        await checkDistributionStatus();
      }, 2000);
    }
  };

  const handleEndSales = async () => {
    const success = await endSales();
    if (success) {
      setCurrentStep('liquidity');
    }
  };

  const handleInitLiquidity = async () => {
    await initLiquidity();
  };

  const refreshStatus = async () => {
    if (!supplyChain) return;
    
    setIsLoading(true);
    try {
      await fetchDistributionRoundsNeeded();
      await checkDistributionStatus();
      await checkSalesStatus();
    } catch (error) {
      console.error('Error refreshing status:', error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    const initializeData = async () => {
      if (!supplyChain) return;
      
      setIsLoading(true);
      try {
        // Fetch initial data
        await fetchDistributionRoundsNeeded();
        await checkDistributionStatus();
        await checkSalesStatus();
      } catch (error) {
        console.error('Error initializing post-sales data:', error);
      }
      setIsLoading(false);
    };
    
    initializeData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supplyChain]); // Only depend on supplyChain to prevent re-renders

  // Determine current step based on status
  useEffect(() => {
    if (!distributionComplete) {
      setCurrentStep('distribution');
    } else if (!salesEnded) {
      setCurrentStep('endSales');
    } else if (!liquidityInitialized) {
      setCurrentStep('liquidity');
    } else {
      setCurrentStep('complete');
    }
  }, [distributionComplete, salesEnded, liquidityInitialized]);

  const getStepStatus = (step) => {
    switch (step) {
      case 'distribution':
        return distributionComplete ? 'complete' : 'active';
      case 'endSales':
        return salesEnded ? 'complete' : distributionComplete ? 'active' : 'pending';
      case 'liquidity':
        return liquidityInitialized ? 'complete' : salesEnded ? 'active' : 'pending';
      default:
        return 'pending';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {onBack && (
          <button
            onClick={onBack}
            className="text-accent-primary hover:text-accent-primary/80 transition-colors"
          >
            ← Back to options
          </button>
        )}
        <div className="flex items-center justify-center p-8">
          <div className="w-6 h-6 border-2 border-accent-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-2 text-secondary">Loading post-sales status...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {onBack && (
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="text-accent-primary hover:text-accent-primary/80 transition-colors"
          >
            ← Back to options
          </button>
          <button
            onClick={refreshStatus}
            className="p-2 hover:bg-hover-bg rounded-lg transition-colors"
            disabled={isLoading}
          >
            <RotateCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      )}

      {!onBack && (
        <div className="flex justify-end">
          <button
            onClick={refreshStatus}
            className="p-2 hover:bg-hover-bg rounded-lg transition-colors"
            disabled={isLoading}
          >
            <RotateCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      )}

      <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
        <h3 className="text-lg font-semibold text-orange-400 mb-2">Post-Sales Management</h3>
        <p className="text-orange-400 mb-3">Sales have ended. Complete the following steps in order:</p>
        <ol className="text-sm text-secondary space-y-2">
          <li className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${getStepStatus('distribution') === 'complete' ? 'bg-green-400' : getStepStatus('distribution') === 'active' ? 'bg-blue-400' : 'bg-gray-500'}`}></div>
            1. Distribute tokens to buyers
          </li>
          <li className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${getStepStatus('endSales') === 'complete' ? 'bg-green-400' : getStepStatus('endSales') === 'active' ? 'bg-blue-400' : 'bg-gray-500'}`}></div>
            2. End sales contract
          </li>
          <li className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${getStepStatus('liquidity') === 'complete' ? 'bg-green-400' : getStepStatus('liquidity') === 'active' ? 'bg-blue-400' : 'bg-gray-500'}`}></div>
            3. Initialize DEX liquidity
          </li>
        </ol>
      </div>

      {/* Step 1: Token Distribution */}
      <div className={`p-6 border rounded-lg transition-all ${
        currentStep === 'distribution' 
          ? 'border-blue-400 bg-blue-500/5' 
          : distributionComplete 
            ? 'border-green-400 bg-green-500/5' 
            : 'border-border-color bg-secondary-bg'
      }`}>
        <div className="flex items-center gap-3 mb-4">
          <Package className={`w-6 h-6 ${
            distributionComplete ? 'text-green-400' : currentStep === 'distribution' ? 'text-blue-400' : 'text-gray-500'
          }`} />
          <h4 className="text-lg font-semibold text-primary-text">Step 1: Token Distribution</h4>
          {distributionComplete && (
            <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">Complete</span>
          )}
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-secondary">Distribution rounds needed:</span>
            <span className="text-primary-text font-medium">{distributionRoundsNeeded}</span>
          </div>
          
          {distributionRoundsNeeded > 0 && (
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded text-sm text-yellow-400">
              This operation may need to be called {distributionRoundsNeeded} times due to gas limits.
            </div>
          )}
          
          <button
            onClick={handleDistribute}
            disabled={isDistributing || distributionComplete || distributionRoundsNeeded === 0}
            className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDistributing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Distributing Tokens...
              </>
            ) : distributionComplete ? (
              'Distribution Complete'
            ) : distributionRoundsNeeded === 0 ? (
              'No Distribution Needed'
            ) : (
              'Distribute Tokens'
            )}
          </button>
        </div>
      </div>

      {/* Step 2: End Sales */}
      <div className={`p-6 border rounded-lg transition-all ${
        currentStep === 'endSales' 
          ? 'border-red-400 bg-red-500/5' 
          : salesEnded 
            ? 'border-green-400 bg-green-500/5' 
            : 'border-border-color bg-secondary-bg opacity-50'
      }`}>
        <div className="flex items-center gap-3 mb-4">
          <Zap className={`w-6 h-6 ${
            salesEnded ? 'text-green-400' : currentStep === 'endSales' ? 'text-red-400' : 'text-gray-500'
          }`} />
          <h4 className="text-lg font-semibold text-primary-text">Step 2: End Sales Contract</h4>
          {salesEnded && (
            <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">Complete</span>
          )}
        </div>
        
        <div className="space-y-3">
          <p className="text-sm text-secondary">
            Finalize the sales contract and transfer funds to treasury for liquidity.
          </p>
          
          <button
            onClick={handleEndSales}
            disabled={isEndingSales || !distributionComplete || salesEnded}
            className="btn btn-danger w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isEndingSales ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Ending Sales...
              </>
            ) : salesEnded ? (
              'Sales Contract Ended'
            ) : !distributionComplete ? (
              'Complete Distribution First'
            ) : (
              'End Sales Contract'
            )}
          </button>
        </div>
      </div>

      {/* Step 3: Initialize Liquidity */}
      <div className={`p-6 border rounded-lg transition-all ${
        currentStep === 'liquidity' 
          ? 'border-green-400 bg-green-500/5' 
          : liquidityInitialized 
            ? 'border-green-400 bg-green-500/5' 
            : 'border-border-color bg-secondary-bg opacity-50'
      }`}>
        <div className="flex items-center gap-3 mb-4">
          <DollarSign className={`w-6 h-6 ${
            liquidityInitialized ? 'text-green-400' : currentStep === 'liquidity' ? 'text-green-400' : 'text-gray-500'
          }`} />
          <h4 className="text-lg font-semibold text-primary-text">Step 3: Initialize DEX Liquidity</h4>
          {liquidityInitialized && (
            <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">Complete</span>
          )}
        </div>
        
        <div className="space-y-3">
          <p className="text-sm text-secondary">
            Create the initial liquidity pool on the DEX using treasury funds.
          </p>
          
          <button
            onClick={handleInitLiquidity}
            disabled={isInitializingLiquidity || !salesEnded || liquidityInitialized}
            className="btn btn-success w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isInitializingLiquidity ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Initializing Liquidity...
              </>
            ) : liquidityInitialized ? (
              'Liquidity Pool Created'
            ) : !salesEnded ? (
              'End Sales Contract First'
            ) : (
              'Initialize Liquidity Pool'
            )}
          </button>
        </div>
      </div>

      {/* Completion Status */}
      {currentStep === 'complete' && (
        <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-lg text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-green-400" />
          </div>
          <h3 className="text-xl font-semibold text-green-400 mb-2">Post-Sales Complete!</h3>
          <p className="text-secondary">
            All post-sales operations have been completed successfully. 
            Your token is now live on the DEX with initial liquidity.
          </p>
        </div>
      )}
    </div>
  );
};

PostSalesManager.propTypes = {
  namespace: PropTypes.string.isRequired,
  salesModuleName: PropTypes.string.isRequired,
  supplyChain: PropTypes.string.isRequired,
  client: PropTypes.object,
  session: PropTypes.object,
  moduleName: PropTypes.string.isRequired,
  onBack: PropTypes.func
};

export default PostSalesManager;
