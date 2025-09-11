import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Plus, Clipboard, Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { validateAddress, parseCsvFile, parseBulkAddresses, validateAndAddAddresses } from '../../utils/addressUtils';
import { useWhitelistOperations } from '../../hooks/useWhitelistOperations';
import { useLotteryWallets } from '../../hooks/useLotteryWallets';

const WhitelistForm = ({
  namespace,
  salesModuleName,
  supplyChain,
  moduleName,
  onBack,
  onSuccess
}) => {
  const [walletsToWhitelist, setWalletsToWhitelist] = useState([]);
  const [newWallet, setNewWallet] = useState('');
  const [bulkWallets, setBulkWallets] = useState('');
  const [csvFile, setCsvFile] = useState(null);
  const [whitelistMode, setWhitelistMode] = useState('single');

  const { isWhitelisting, whitelistAddresses } = useWhitelistOperations(
    namespace,
    salesModuleName,
    supplyChain,
    moduleName
  );

  // Fetch lottery selected wallets
  const { 
    selectedWallets, 
    hasLotteryData, 
    lotteryDate, 
    loading: lotteryLoading 
  } = useLotteryWallets(namespace, moduleName);

  // Initialize with selected wallets when lottery data is available
  useEffect(() => {
    if (hasLotteryData && selectedWallets.length > 0 && walletsToWhitelist.length === 0) {
      setWalletsToWhitelist([...selectedWallets]);
      toast.info(`Added ${selectedWallets.length} lottery-selected wallets. These must be whitelisted first.`);
    }
  }, [hasLotteryData, selectedWallets, walletsToWhitelist.length]);

  // Check if all selected wallets are in the current whitelist
  const areAllSelectedWalletsIncluded = () => {
    if (!hasLotteryData || selectedWallets.length === 0) return true;
    return selectedWallets.every(wallet => walletsToWhitelist.includes(wallet));
  };

  // Get remaining selected wallets that haven't been added yet
  const getRemainingSelectedWallets = () => {
    if (!hasLotteryData) return [];
    return selectedWallets.filter(wallet => !walletsToWhitelist.includes(wallet));
  };

  const handleAddToWhitelist = () => {
    if (validateAddress(newWallet)) {
      if (walletsToWhitelist.includes(newWallet)) {
        toast.error('Wallet address already in whitelist');
      } else {
        setWalletsToWhitelist([...walletsToWhitelist, newWallet]);
        setNewWallet('');
        toast.success('Address added to whitelist');
      }
    } else {
      toast.error('Invalid wallet address');
    }
  };

  const handleCsvUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    setCsvFile(file);
    
    try {
      const addresses = await parseCsvFile(file);
      validateAndAddAddresses(addresses, walletsToWhitelist, setWalletsToWhitelist, toast);
    } catch (error) {
      console.error('Error parsing CSV:', error);
      toast.error('Error parsing CSV file');
    }
    
    event.target.value = '';
  };

  const handleBulkAddresses = () => {
    if (!bulkWallets.trim()) {
      toast.error('Please enter wallet addresses');
      return;
    }
    
    const addresses = parseBulkAddresses(bulkWallets);
    validateAndAddAddresses(addresses, walletsToWhitelist, setWalletsToWhitelist, toast);
    setBulkWallets('');
  };

  const removeFromWhitelist = (indexToRemove) => {
    const addressToRemove = walletsToWhitelist[indexToRemove];
    
    // Prevent removal of lottery-selected wallets
    if (hasLotteryData && selectedWallets.includes(addressToRemove)) {
      toast.error('Cannot remove lottery-selected wallets. These must be whitelisted.');
      return;
    }
    
    setWalletsToWhitelist(prev => prev.filter((_, index) => index !== indexToRemove));
    toast.info('Address removed from whitelist');
  };

  const clearAllAddresses = () => {
    if (hasLotteryData && selectedWallets.length > 0) {
      // Only clear non-lottery addresses
      setWalletsToWhitelist(selectedWallets);
      toast.info('Cleared additional addresses. Lottery-selected wallets remain.');
    } else {
      setWalletsToWhitelist([]);
      toast.info('All addresses cleared from whitelist');
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (validateAddress(text)) {
        setNewWallet(text);
      } else {
        toast.error('Invalid address from clipboard');
      }
    } catch (error) {
      console.error('Error reading from clipboard:', error);
    }
  };

  const handleWhitelistSubmit = async () => {
    // Check if lottery wallets are properly included
    if (!areAllSelectedWalletsIncluded()) {
      const remaining = getRemainingSelectedWallets();
      toast.error(
        `You must whitelist all ${selectedWallets.length} lottery-selected wallets first. ` +
        `Missing ${remaining.length} wallet(s).`
      );
      return;
    }

    await whitelistAddresses(walletsToWhitelist, () => {
      setWalletsToWhitelist([]);
      onSuccess && onSuccess();
    });
  };

  const addAllSelectedWallets = () => {
    const remaining = getRemainingSelectedWallets();
    if (remaining.length > 0) {
      setWalletsToWhitelist(prev => [...prev, ...remaining]);
      toast.success(`Added ${remaining.length} remaining lottery-selected wallets`);
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="text-accent-primary hover:text-accent-primary/80 transition-colors"
      >
        ← Back to options
      </button>
      
      {/* Lottery Status Information */}
      {lotteryLoading && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-blue-700">Loading lottery data...</span>
          </div>
        </div>
      )}

      {hasLotteryData && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-semibold text-yellow-800">Lottery Winners Selected</h4>
              <p className="text-sm text-yellow-700 mt-1">
                {selectedWallets.length} wallet addresses were selected in the lottery on{' '}
                {lotteryDate ? new Date(lotteryDate).toLocaleDateString() : 'an earlier date'}.
                These addresses must be whitelisted before you can add other wallets.
              </p>
              
              {!areAllSelectedWalletsIncluded() && (
                <div className="mt-3">
                  <p className="text-sm text-yellow-700 mb-2">
                    Missing {getRemainingSelectedWallets().length} lottery-selected wallets:
                  </p>
                  <button
                    onClick={addAllSelectedWallets}
                    className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 transition-colors"
                  >
                    Add All Missing Lottery Wallets
                  </button>
                </div>
              )}

              {areAllSelectedWalletsIncluded() && (
                <div className="flex items-center gap-2 mt-2 text-green-700">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">All lottery-selected wallets are included</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {!hasLotteryData && !lotteryLoading && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-700">No lottery restrictions - you can whitelist any wallets</span>
          </div>
        </div>
      )}
      
      {/* Mode Selection */}
      <div className="flex flex-wrap gap-2 p-4 bg-secondary-bg rounded-lg border border-border-color">
        <button
          onClick={() => setWhitelistMode('single')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            whitelistMode === 'single' 
              ? 'bg-accent-primary text-white' 
              : 'bg-hover-bg text-secondary hover:bg-hover-bg/80'
          }`}
        >
          Single Address
        </button>
        <button
          onClick={() => setWhitelistMode('bulk')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            whitelistMode === 'bulk' 
              ? 'bg-accent-primary text-white' 
              : 'bg-hover-bg text-secondary hover:bg-hover-bg/80'
          }`}
        >
          <FileText className="w-4 h-4 inline mr-1" />
          Bulk Paste
        </button>
        <button
          onClick={() => setWhitelistMode('csv')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            whitelistMode === 'csv' 
              ? 'bg-accent-primary text-white' 
              : 'bg-hover-bg text-secondary hover:bg-hover-bg/80'
          }`}
        >
          <Upload className="w-4 h-4 inline mr-1" />
          CSV Upload
        </button>
      </div>

      {/* Single Address Mode */}
      {whitelistMode === 'single' && (
        <div>
          <label className="block text-sm font-medium text-secondary mb-2">
            Enter Wallet Address
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter Address"
              value={newWallet}
              onChange={(e) => setNewWallet(e.target.value)}
              className="flex-1 px-3 py-2 bg-secondary-bg border border-border-color rounded-lg text-primary-text focus:outline-none focus:border-accent-primary"
            />
            <button
              onClick={handlePasteFromClipboard}
              className="px-3 py-2 bg-secondary-bg border border-border-color rounded-lg hover:bg-hover-bg transition-colors"
              title="Paste from clipboard"
            >
              <Clipboard className="w-4 h-4" />
            </button>
          </div>
          <button 
            className="btn btn-primary flex items-center gap-2 mt-3"
            onClick={handleAddToWhitelist}
          >
            <Plus className="w-4 h-4" />
            Add Wallet
          </button>
        </div>
      )}

      {/* Bulk Paste Mode */}
      {whitelistMode === 'bulk' && (
        <div>
          <label className="block text-sm font-medium text-secondary mb-2">
            Paste Comma-Separated Wallet Addresses
          </label>
          <p className="text-xs text-secondary mb-3">
            You can paste addresses separated by commas, semicolons, tabs, or new lines
          </p>
          <textarea
            placeholder="Paste wallet addresses here (comma, semicolon, tab, or newline separated)..."
            value={bulkWallets}
            onChange={(e) => setBulkWallets(e.target.value)}
            rows="6"
            className="w-full px-3 py-2 bg-secondary-bg border border-border-color rounded-lg text-primary-text focus:outline-none focus:border-accent-primary resize-vertical"
          />
          <button 
            className="btn btn-primary flex items-center gap-2 mt-3"
            onClick={handleBulkAddresses}
            disabled={!bulkWallets.trim()}
          >
            <Plus className="w-4 h-4" />
            Add All Addresses
          </button>
        </div>
      )}

      {/* CSV Upload Mode */}
      {whitelistMode === 'csv' && (
        <div>
          <label className="block text-sm font-medium text-secondary mb-2">
            Upload CSV File with Wallet Addresses
          </label>
          <p className="text-xs text-secondary mb-3">
            CSV file should contain wallet addresses in any column. Addresses can be separated by commas, semicolons, or tabs.
          </p>
          <div className="flex items-center gap-4">
            <input
              type="file"
              accept=".csv,.txt"
              onChange={handleCsvUpload}
              className="hidden"
              id="csv-upload"
            />
            <label
              htmlFor="csv-upload"
              className="btn btn-primary flex items-center gap-2 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              Choose CSV File
            </label>
            {csvFile && (
              <span className="text-sm text-secondary">
                Selected: {csvFile.name}
              </span>
            )}
          </div>
        </div>
      )}

      {walletsToWhitelist.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-primary-text">
              Addresses To Whitelist ({walletsToWhitelist.length})
            </h4>
            <button
              onClick={clearAllAddresses}
              className="text-red-400 hover:text-red-300 text-sm transition-colors"
            >
              {hasLotteryData && selectedWallets.length > 0 ? 'Clear Additional' : 'Clear All'}
            </button>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {walletsToWhitelist.map((address, index) => {
              const isLotterySelected = hasLotteryData && selectedWallets.includes(address);
              return (
                <div key={index} className={`flex items-center justify-between p-2 rounded border ${
                  isLotterySelected 
                    ? 'bg-yellow-50 border-yellow-200' 
                    : 'bg-secondary-bg border-border-color'
                }`}>
                  <div className="flex items-center gap-2 flex-1 mr-2">
                    <span className="text-sm break-all">
                      {index + 1}. {address}
                    </span>
                    {isLotterySelected && (
                      <span className="px-2 py-0.5 bg-yellow-200 text-yellow-800 text-xs rounded font-medium">
                        Lottery
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => removeFromWhitelist(index)}
                    className={`text-xs px-2 py-1 rounded transition-colors ${
                      isLotterySelected
                        ? 'text-yellow-700 hover:text-yellow-800 hover:bg-yellow-200'
                        : 'text-red-400 hover:text-red-300 hover:bg-red-400/10'
                    }`}
                    disabled={isLotterySelected && hasLotteryData}
                    title={isLotterySelected ? 'Lottery-selected wallets cannot be removed' : 'Remove wallet'}
                  >
                    {isLotterySelected ? 'Required' : 'Remove'}
                  </button>
                </div>
              );
            })}
          </div>
          <button 
            className={`btn w-full transition-colors ${
              areAllSelectedWalletsIncluded() 
                ? 'btn-primary' 
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
            onClick={handleWhitelistSubmit}
            disabled={isWhitelisting || walletsToWhitelist.length === 0}
          >
            {isWhitelisting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Whitelisting...
              </>
            ) : !areAllSelectedWalletsIncluded() ? (
              `Missing ${getRemainingSelectedWallets().length} Lottery Wallets`
            ) : (
              `Whitelist All ${walletsToWhitelist.length} Addresses`
            )}
          </button>
        </div>
      )}
    </div>
  );
};

WhitelistForm.propTypes = {
  namespace: PropTypes.string.isRequired,
  salesModuleName: PropTypes.string.isRequired,
  supplyChain: PropTypes.string.isRequired,
  moduleName: PropTypes.string.isRequired,
  onBack: PropTypes.func.isRequired,
  onSuccess: PropTypes.func
};

export default WhitelistForm;
