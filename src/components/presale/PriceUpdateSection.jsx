import { useState } from 'react';
import PropTypes from 'prop-types';
import { Settings } from 'lucide-react';
import { usePriceUpdates } from '../../hooks/usePriceUpdates';
import { safeRender } from '../../utils/valueUtils';

const PriceUpdateSection = ({
  namespace,
  salesModuleName,
  supplyChain,
  client,
  session,
  moduleName,
  p0Price,
  p1Price,
  fetchP0Price,
  fetchP1Price,
  pubKey
}) => {
  const [showPriceChange, setShowPriceChange] = useState(false);
  const [newP0Price, setNewP0Price] = useState(safeRender(p0Price));
  const [newP1Price, setNewP1Price] = useState(safeRender(p1Price));
  const [priceResult, setPriceResult] = useState(null);

  const { isUpdatingPrices, updatePrices } = usePriceUpdates(
    namespace,
    salesModuleName,
    supplyChain,
    client,
    session,
    moduleName,
    fetchP0Price,
    fetchP1Price,
    pubKey
  );

  const handlePrices = () => {
    setPriceResult(null);
    setShowPriceChange(true);
  };

  const handleUpdatePrices = async () => {
    await updatePrices(newP0Price, newP1Price, () => {
      setPriceResult('Prices updated successfully!');
      setShowPriceChange(false);
    });
  };

  return (
    <div className="space-y-4">
      {!showPriceChange && (
        <button 
          className="btn btn-primary flex items-center gap-2"
          onClick={handlePrices}
        >
          <Settings className="w-4 h-4" />
          Update Prices
        </button>
      )}
      
      {priceResult && (
        <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
          <p className="text-green-400">{priceResult}</p>
        </div>
      )}
      
      {showPriceChange && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                New Whitelist Price (Per Batch)
              </label>
              <input
                type="number"
                step="0.000001"
                value={newP0Price}
                onChange={(e) => setNewP0Price(e.target.value)}
                className="w-full px-3 py-2 bg-secondary-bg border border-border-color rounded-lg text-primary-text focus:outline-none focus:border-accent-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                New Public Sale Price (Per Batch)
              </label>
              <input
                type="number"
                step="0.000001"
                value={newP1Price}
                onChange={(e) => setNewP1Price(e.target.value)}
                className="w-full px-3 py-2 bg-secondary-bg border border-border-color rounded-lg text-primary-text focus:outline-none focus:border-accent-primary"
              />
            </div>
          </div>
          <button 
            className="btn btn-primary"
            onClick={handleUpdatePrices}
            disabled={isUpdatingPrices}
          >
            {isUpdatingPrices ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Updating...
              </>
            ) : (
              'Update Prices'
            )}
          </button>
        </div>
      )}
    </div>
  );
};

PriceUpdateSection.propTypes = {
  namespace: PropTypes.string.isRequired,
  salesModuleName: PropTypes.string.isRequired,
  supplyChain: PropTypes.string.isRequired,
  client: PropTypes.object,
  session: PropTypes.object,
  moduleName: PropTypes.string.isRequired,
  p0Price: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
  p1Price: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
  fetchP0Price: PropTypes.func.isRequired,
  fetchP1Price: PropTypes.func.isRequired,
  pubKey: PropTypes.string
};

export default PriceUpdateSection;
