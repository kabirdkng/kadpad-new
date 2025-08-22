import PropTypes from 'prop-types';
import usePresaleLogic from '../../hooks/usePresaleLogic';
import PresaleHeader from './PresaleHeader';
import TokenDetailsCard from './TokenDetailsCard';
import PhaseStatusCard from './PhaseStatusCard';
import TokenStatsCard from './TokenStatsCard';
import SalesProgressCard from './SalesProgressCard';
import PhasePricingCard from './PhasePricingCard';
import WhitelistStatusCard from './WhitelistStatusCard';
import PurchaseCard from './PurchaseCard';
import PurchaseHistoryCard from './PurchaseHistoryCard';
import DeployerAccessCard from './DeployerAccessCard';
import DeployerPanel from './DeployerPanel';

const PresaleView = ({ namespace, moduleName }) => {
  const {
    // Store data
    balance,
    phase0startTime,
    phase1startTime,
    salesEndTime,
    isWhitelisted,
    amountPerBatch,
    currentPrice,
    kdaInput,
    batchCount,
    tokenSymbol,
    salesAccount,
    availableBatches,
    totalSales,
    supplyChain,
    p0Price,
    p1Price,
    imageUrl,
    totalSupply,
    tokenName,
    contractNamespace,
    totalBatches,
    userPurchaseData,
    userBoughtBatches,
    userBoughtTokens,
    
    // Local state
    countdown,
    isLoading,
    isDeployer,
    isDeployerLoading,
    showDeployerPanel,
    
    // Computed values
    isPreWl,
    isPhase0,
    isPhase1,
    isSaleEnded,
    
    // Functions
    safeRender,
    getPhaseInfo,
    getCountdownLabel,
    handleBuy,
    handleDeployerAccess,
    setBatchCount,
    setShowDeployerPanel,
    
    // Store functions
    account,
    pubKey
  } = usePresaleLogic(namespace, moduleName);

  const phaseInfo = getPhaseInfo();

  return (
    <div className="min-h-screen bg-primary-bg pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header Section */}
        <PresaleHeader tokenSymbol={tokenSymbol} />

        {/* Token Details Card */}
        <TokenDetailsCard 
          imageUrl={imageUrl}
          tokenSymbol={tokenSymbol}
          tokenName={tokenName}
          moduleName={moduleName}
        />

        {/* Phase Status Card */}
        <PhaseStatusCard 
          phaseInfo={phaseInfo}
          countdown={countdown}
          isSaleEnded={isSaleEnded}
          getCountdownLabel={getCountdownLabel}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Token Info & Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Token Stats */}
            <TokenStatsCard 
              currentPrice={currentPrice}
              totalSales={totalSales}
              amountPerBatch={amountPerBatch}
              availableBatches={availableBatches}
              totalSupply={totalSupply}
              tokenSymbol={tokenSymbol}
              contractNamespace={contractNamespace}
              namespace={namespace}
              moduleName={moduleName}
              supplyChain={supplyChain}
              safeRender={safeRender}
            />

            {/* Sales Progress */}
            <SalesProgressCard 
              amountPerBatch={amountPerBatch}
              totalBatches={totalBatches}
              totalSales={totalSales}
            />

            {/* Phase Pricing */}
            <PhasePricingCard 
              p0Price={p0Price}
              p1Price={p1Price}
              safeRender={safeRender}
            />

            {/* Whitelist Status */}
            {isPhase0 && (
              <WhitelistStatusCard isWhitelisted={isWhitelisted} />
            )}
          </div>

          {/* Right Column - Purchase & Actions */}
          <div className="space-y-6">
            {/* Purchase Card */}
            <PurchaseCard 
              isPhase0={isPhase0}
              isPhase1={isPhase1}
              isSaleEnded={isSaleEnded}
              tokenSymbol={tokenSymbol}
              balance={balance}
              account={account}
              batchCount={batchCount}
              setBatchCount={setBatchCount}
              availableBatches={availableBatches}
              kdaInput={kdaInput}
              amountPerBatch={amountPerBatch}
              handleBuy={handleBuy}
              isLoading={isLoading}
              isWhitelisted={isWhitelisted}
              userBoughtBatches={userBoughtBatches}
              safeRender={safeRender}
            />

            {/* Purchase History Card */}
            <PurchaseHistoryCard 
              account={account}
              userBoughtBatches={userBoughtBatches}
              userBoughtTokens={userBoughtTokens}
              tokenSymbol={tokenSymbol}
              isPhase0={isPhase0}
              isPhase1={isPhase1}
              isSaleEnded={isSaleEnded}
              safeRender={safeRender}
            />

            {/* Deployer Dashboard Access */}
            <DeployerAccessCard 
              account={account}
              isDeployer={isDeployer}
              isDeployerLoading={isDeployerLoading}
              handleDeployerAccess={handleDeployerAccess}
            />
          </div>
        </div>
      </div>

      {/* Deployer Panel Modal */}
      {showDeployerPanel && (
        <DeployerPanel
          setDeployerPanel={setShowDeployerPanel}
          tokenSymbol={tokenSymbol}
          countdown={countdown}
          namespace={namespace}
          moduleName={moduleName}
          supplyChain={supplyChain}
        />
      )}
    </div>
  );
};

PresaleView.propTypes = {
  namespace: PropTypes.string.isRequired,
  moduleName: PropTypes.string.isRequired,
};

export default PresaleView;
