import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Plus, Clipboard, Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { validateAddress, parseCsvFile, parseBulkAddresses, validateAndAddAddresses } from '../../utils/addressUtils';
import { useWhitelistOperations } from '../../hooks/useWhitelistOperations';
import { useLotteryWallets } from '../../hooks/useLotteryWallets';
import { markLotteryWalletsWhitelisted } from '../../api';

const WhitelistForm = ({
  namespace,
  salesModuleName,
  supplyChain,
  moduleName,
  reservations = [],
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
    totalLotteryWallets,
    whitelistedLotteryWallets,
    hasLotteryData, 
    lotteryDate, 
    loading: lotteryLoading,
    refetch: refetchLotteryData
  } = useLotteryWallets(namespace, moduleName);

  // Get reserved wallet addresses for filtering
  const reservedWallets = reservations.map(reservation => reservation.account);

  // Filter selected wallets to exclude already reserved ones
  const availableSelectedWallets = selectedWallets.filter(wallet => 
    !reservedWallets.includes(wallet)
  );

  // Debug logging
  console.log('Reserved wallets:', reservedWallets);
  console.log('Selected wallets:', selectedWallets);
  console.log('Available selected wallets:', availableSelectedWallets);

  // Initialize with available selected wallets when lottery data is available
  useEffect(() => {
    if (hasLotteryData && availableSelectedWallets.length > 0 && walletsToWhitelist.length === 0) {
      setWalletsToWhitelist([...availableSelectedWallets]);
      
      const excludedCount = selectedWallets.length - availableSelectedWallets.length;
      if (excludedCount > 0) {
        toast.info(
          `Added ${availableSelectedWallets.length} lottery wallets. ${excludedCount} already reserved.`
        );
      } else {
        toast.info(`Added ${availableSelectedWallets.length} lottery-selected wallets. These must be whitelisted first.`);
      }
    }
  }, [hasLotteryData, availableSelectedWallets.length, walletsToWhitelist.length]);

  // Check if all available selected wallets are in the current whitelist
  const areAllSelectedWalletsIncluded = () => {
    if (!hasLotteryData || availableSelectedWallets.length === 0) return true;
    return availableSelectedWallets.every(wallet => walletsToWhitelist.includes(wallet));
  };

  // Get remaining available selected wallets that haven't been added yet
  const getRemainingSelectedWallets = () => {
    if (!hasLotteryData) return [];
    return availableSelectedWallets.filter(wallet => !walletsToWhitelist.includes(wallet));
  };

  const handleAddToWhitelist = () => {
    if (validateAddress(newWallet)) {
      if (walletsToWhitelist.includes(newWallet)) {
        toast.error('Wallet address already in whitelist');
      } else if (reservedWallets.includes(newWallet)) {
        toast.error('Wallet address is already reserved and cannot be whitelisted');
      } else {
        // Check if we need to enforce lottery wallets first
        if (hasLotteryData && availableSelectedWallets.length > 0 && !areAllSelectedWalletsIncluded()) {
          const isLotteryWallet = availableSelectedWallets.includes(newWallet);
          if (!isLotteryWallet) {
            const remainingCount = getRemainingSelectedWallets().length;
            toast.error(`Must whitelist all ${availableSelectedWallets.length} available lottery wallets first. ${remainingCount} remaining.`);
            return;
          }
        }
        
        setWalletsToWhitelist([...walletsToWhitelist, newWallet]);
        setNewWallet('');
        toast.success('Address added to whitelist');
      }
    } else {
      toast.error('Invalid wallet address');
    }
  };

  // Helper function to filter out reserved wallets from a list
  const filterReservedWallets = (addresses) => {
    const filtered = addresses.filter(address => !reservedWallets.includes(address));
    const excludedCount = addresses.length - filtered.length;
    
    if (excludedCount > 0) {
      toast.warning(`Excluded ${excludedCount} address(es) that are already reserved`);
    }
    
    return filtered;
  };

  const handleCsvUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    setCsvFile(file);
    
    try {
      const addresses = await parseCsvFile(file);
      
      // Check lottery enforcement before adding addresses
      if (hasLotteryData && availableSelectedWallets.length > 0 && !areAllSelectedWalletsIncluded()) {
        // Check if any address being added is not a lottery wallet
        const nonLotteryAddresses = addresses.filter(addr => !availableSelectedWallets.includes(addr));
        if (nonLotteryAddresses.length > 0) {
          const remainingCount = getRemainingSelectedWallets().length;
          toast.error(`Must whitelist all ${availableSelectedWallets.length} available lottery wallets first. ${remainingCount} remaining.`);
          return;
        }
      }
      
      validateAndAddAddresses(addresses, walletsToWhitelist, setWalletsToWhitelist, toast, reservedWallets);
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
    
    // Check lottery enforcement before adding addresses
    if (hasLotteryData && availableSelectedWallets.length > 0 && !areAllSelectedWalletsIncluded()) {
      // Check if any address being added is not a lottery wallet
      const nonLotteryAddresses = addresses.filter(addr => !availableSelectedWallets.includes(addr));
      if (nonLotteryAddresses.length > 0) {
        const remainingCount = getRemainingSelectedWallets().length;
        toast.error(`Must whitelist all ${availableSelectedWallets.length} available lottery wallets first. ${remainingCount} remaining.`);
        return;
      }
    }
    
    validateAndAddAddresses(addresses, walletsToWhitelist, setWalletsToWhitelist, toast, reservedWallets);
    setBulkWallets('');
  };

  // Get non-lottery wallets for display (don't show lottery wallets in the list)
  const nonLotteryWallets = walletsToWhitelist.filter(wallet => 
    !hasLotteryData || !availableSelectedWallets.includes(wallet)
  );

  // Get lottery wallets count for display purposes
  const lotteryWalletsInBatch = walletsToWhitelist.filter(wallet => 
    hasLotteryData && availableSelectedWallets.includes(wallet)
  );

  const removeFromWhitelist = (indexToRemove) => {
    // Since we're only showing non-lottery wallets, the index refers to the non-lottery array
    const addressToRemove = nonLotteryWallets[indexToRemove];
    
    setWalletsToWhitelist(prev => prev.filter(wallet => wallet !== addressToRemove));
    toast.info('Address removed from whitelist');
  };

  const clearAllAddresses = () => {
    if (hasLotteryData && availableSelectedWallets.length > 0) {
      // Only clear non-lottery addresses, keep available lottery addresses
      setWalletsToWhitelist(prev => prev.filter(wallet => availableSelectedWallets.includes(wallet)));
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
        `You must whitelist all ${availableSelectedWallets.length} available lottery-selected wallets first. ` +
        `Missing ${remaining.length} wallet(s).`
      );
      return;
    }

    await whitelistAddresses(walletsToWhitelist, async (transactionResult) => {
      // Check if any of the whitelisted addresses are lottery wallets
      const lotteryWalletsInBatch = walletsToWhitelist.filter(wallet => availableSelectedWallets.includes(wallet));
      
      if (lotteryWalletsInBatch.length > 0) {
        try {
          // Mark lottery wallets as whitelisted
          await markLotteryWalletsWhitelisted(namespace, moduleName, {
            walletAddresses: lotteryWalletsInBatch,
            transactionHash: transactionResult?.transactionHash || 'unknown'
          });
          
          console.log(`Marked ${lotteryWalletsInBatch.length} lottery wallets as whitelisted`);
          
          // Refresh lottery data to get updated counts
          await refetchLotteryData();
        } catch (error) {
          console.error('Error marking lottery wallets as whitelisted:', error);
          // Don't fail the whole process if this fails
          toast.warning('Wallets whitelisted successfully, but failed to update lottery status');
        }
      }
      
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
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-blue-700 text-sm">Loading lottery data...</span>
          </div>
        </div>
      )}

      {hasLotteryData && availableSelectedWallets.length > 0 && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
            <div className="flex-1">
              <div className="flex items-center gap-2 text-yellow-800">
                <span className="font-medium">🎯 {availableSelectedWallets.length} lottery wallets pending</span>
                <span className="text-xs bg-yellow-200 px-2 py-0.5 rounded">Must whitelist first</span>
                {selectedWallets.length > availableSelectedWallets.length && (
                  <span className="text-xs bg-gray-200 px-2 py-0.5 rounded">
                    {selectedWallets.length - availableSelectedWallets.length} already reserved
                  </span>
                )}
              </div>
            </div>
            {!areAllSelectedWalletsIncluded() && (
              <button
                onClick={addAllSelectedWallets}
                className="px-3 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700 transition-colors"
              >
                Add All
              </button>
            )}
          </div>
        </div>
      )}

      {hasLotteryData && availableSelectedWallets.length === 0 && whitelistedLotteryWallets > 0 && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-700 text-sm">
              ✅ All {totalLotteryWallets} lottery wallets handled - ready for additional wallets
              {selectedWallets.length < totalLotteryWallets && (
                <span className="block text-xs mt-1">
                  ({totalLotteryWallets - selectedWallets.length} were already reserved)
                </span>
              )}
            </span>
          </div>
        </div>
      )}

      {!hasLotteryData && !lotteryLoading && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-700 text-sm">🎲 No lottery restrictions - whitelist any wallets</span>
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

      {(walletsToWhitelist.length > 0 || lotteryWalletsInBatch.length > 0) && (
          <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h4 className="text-lg font-semibold text-primary-text">
                📝 Addresses To Whitelist ({walletsToWhitelist.length})
              </h4>
              {lotteryWalletsInBatch.length > 0 && nonLotteryWallets.length > 0 && (
                <span className="px-2 py-1 bg-yellow-200 text-yellow-800 text-xs rounded font-medium">
                  {lotteryWalletsInBatch.length} lottery + {nonLotteryWallets.length} additional
                </span>
              )}
              {lotteryWalletsInBatch.length > 0 && nonLotteryWallets.length === 0 && (
                <span className="px-2 py-1 bg-yellow-200 text-yellow-800 text-xs rounded font-medium">
                  {lotteryWalletsInBatch.length} lottery wallets
                </span>
              )}
            </div>
            <button
              onClick={clearAllAddresses}
              className="text-red-400 hover:text-red-300 text-sm transition-colors"
            >
              {hasLotteryData && availableSelectedWallets.length > 0 ? 'Clear Additional' : 'Clear All'}
            </button>
          </div>
          
          {/* Only show non-lottery wallets in the list */}
          {nonLotteryWallets.length > 0 && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {nonLotteryWallets.map((address, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-secondary-bg rounded border border-border-color">
                  <div className="flex items-center gap-2 flex-1 mr-2">
                    <span className="text-sm break-all">
                      {index + 1}. {address}
                    </span>
                  </div>
                  <button
                    onClick={() => removeFromWhitelist(index)}
                    className="text-red-400 hover:text-red-300 text-xs px-2 py-1 hover:bg-red-400/10 rounded transition-colors"
                    title="Remove wallet"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {/* Show summary when there are only lottery wallets */}
          {nonLotteryWallets.length === 0 && lotteryWalletsInBatch.length > 0 && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
              <p className="text-yellow-800 text-sm">
                🎯 {lotteryWalletsInBatch.length} lottery wallets ready to whitelist
              </p>
            </div>
          )}
          
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
              `⚠️ Missing ${getRemainingSelectedWallets().length} Lottery Wallets`
            ) : (
              `✅ Whitelist All ${walletsToWhitelist.length} Addresses`
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
  onSuccess: PropTypes.func,
  reservations: PropTypes.arrayOf(PropTypes.shape({
    account: PropTypes.string.isRequired,
    reserved: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    bought: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  })).isRequired
};

export default WhitelistForm;
