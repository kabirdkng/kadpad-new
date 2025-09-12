import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Users, DollarSign } from 'lucide-react';
import usePresaleStore from '../../store/usePresaleStore';
import useWalletStore from '../../wallet/walletStore';
import { usePresaleData } from '../../hooks/usePresaleData';
import { safeRender } from '../../utils/valueUtils';
import PriceUpdateSection from './PriceUpdateSection';
import WhitelistForm from './WhitelistForm';
import ReservationsList from './ReservationsList';
import StatsDisplay from './StatsDisplay';
import PhaseIndicator from './PhaseIndicator';
import PostSalesManager from './PostSalesManager';

const ManageSales = ({ 
  tokenSymbol, 
  namespace, 
  moduleName, 
  supplyChain
}) => {
  const SALES_MODULE_NAME = `${moduleName}-sales`;
  const { pubKey } = useWalletStore();
  const { 
    salesEndTime, 
    phase0startTime, 
    phase1startTime, 
    p0Price, 
    p1Price,
    fetchP0Price,
    fetchP1Price
  } = usePresaleStore();

  const [whitelistForm, setWhitelistForm] = useState(false);
  const [reservationList, setReservationList] = useState(false);

  // Use custom hook for presale data
  const {
    totalBatches,
    counters,
    reservations,
    availableToWhitelist,
    getTotalBatches,
    getCounters,
    getReservations
  } = usePresaleData(namespace, SALES_MODULE_NAME, supplyChain, pubKey);

  const now = new Date();
  const isPreWl = now < phase0startTime;
  const isPhase0 = now >= phase0startTime && now < phase1startTime;
  const isPhase1 = now >= phase1startTime && now < salesEndTime;
  const isPostSales = now > salesEndTime;

  const showWhiteListForm = () => {
    setWhitelistForm(true);
    setReservationList(false);
  };

  const showReservationList = () => {
    setReservationList(true);
    setWhitelistForm(false);
  };

  const handleWhitelistSuccess = async () => {
    await getCounters();
  };

  const handleBackToOptions = () => {
    setWhitelistForm(false);
    setReservationList(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchP0Price(namespace, SALES_MODULE_NAME, supplyChain, pubKey);
        await fetchP1Price(namespace, SALES_MODULE_NAME, supplyChain, pubKey);
        await getTotalBatches();
        
        setTimeout(async () => {
          await getCounters();
          await getReservations();
        }, 100);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    
    if (supplyChain && pubKey) {
      fetchData();
    }
  }, [supplyChain, pubKey, namespace, SALES_MODULE_NAME, fetchP0Price, fetchP1Price, getTotalBatches, getCounters, getReservations]);

  return (
    <div className="space-y-6">
      <div className="card">
        <h4 className="text-lg font-semibold text-primary-text mb-4">Token: ${tokenSymbol}</h4>
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-secondary">Whitelist Price:</span>
            <span className="text-blue-400 font-semibold">{safeRender(p0Price)} KDA</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-secondary">Public Sale Price:</span>
            <span className="text-green-400 font-semibold">{safeRender(p1Price)} KDA</span>
          </div>
        </div>

        {isPreWl && (
          <div className="space-y-4">
            <PhaseIndicator title="Pre-Whitelist" className="text-yellow-400" />
            <PriceUpdateSection
              tokenSymbol={tokenSymbol}
              namespace={namespace}
              salesModuleName={SALES_MODULE_NAME}
              supplyChain={supplyChain}
              moduleName={moduleName}
              p0Price={p0Price}
              p1Price={p1Price}
              fetchP0Price={fetchP0Price}
              fetchP1Price={fetchP1Price}
              pubKey={pubKey}
            />
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-yellow-400">You can whitelist users after Phase 0 starts</p>
            </div>
          </div>
        )}

        {isPhase0 && (
          <div className="space-y-6">
            <PhaseIndicator title="Phase 0 (Whitelist)" className="text-blue-400" />
            <p className="text-secondary">Phase 0 is live, you can whitelist users now</p>
            
            <StatsDisplay
              totalBatches={totalBatches}
              availableToWhitelist={availableToWhitelist}
              counters={counters}
            />

            {!whitelistForm && !reservationList && (
              <div className="flex gap-4">
                <button 
                  className="btn btn-primary flex items-center gap-2"
                  onClick={showWhiteListForm}
                >
                  <Users className="w-4 h-4" />
                  Whitelist Wallets
                </button>
                <button 
                  className="btn btn-secondary flex items-center gap-2"
                  onClick={showReservationList}
                >
                  <DollarSign className="w-4 h-4" />
                  Current Sales
                </button>
              </div>
            )}

            {whitelistForm && (
              <WhitelistForm
                namespace={namespace}
                salesModuleName={SALES_MODULE_NAME}
                supplyChain={supplyChain}
                moduleName={moduleName}
                reservations={reservations}
                onBack={handleBackToOptions}
                onSuccess={handleWhitelistSuccess}
              />
            )}

            {reservationList && (
              <ReservationsList
                reservations={reservations}
                onBack={handleBackToOptions}
                onRefresh={getReservations}
              />
            )}
          </div>
        )}

        {isPhase1 && (
          <PhaseIndicator title="Phase 1 (Public Sale)" className="text-green-400" />
        )}
        
        {isPostSales && (
          <div className="space-y-6">
            <PhaseIndicator title="Sales Ended - Post-Sales Management" className="text-orange-400" />
            
            <PostSalesManager
              namespace={namespace}
              salesModuleName={SALES_MODULE_NAME}
              supplyChain={supplyChain}
              moduleName={moduleName}
            />
          </div>
        )}
      </div>
    </div>
  );
};

ManageSales.propTypes = {
  tokenSymbol: PropTypes.string.isRequired,
  namespace: PropTypes.string.isRequired,
  moduleName: PropTypes.string.isRequired,
  supplyChain: PropTypes.string.isRequired,
};

export default ManageSales;
