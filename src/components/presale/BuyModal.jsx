import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ShoppingCart, X, Info } from 'lucide-react';
import usePresaleStore from '../../store/usePresaleStore';
import { addComma } from '../../utils/numberUtils';

const BuyModal = ({ tokenSymbol, batchCount, amountPerBatch, kdaInput, handleBuy, setShowBuyModal, availableBatches }) => {
  const { setBatchCount } = usePresaleStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setBatchCount(1);
    return () => setIsMounted(false);
  }, [setBatchCount]);

  useEffect(() => {
    if (isMounted) {
      const handleOutsideClick = (event) => {
        if (!event.target.closest('.modal-content')) {
          setShowBuyModal(false);
        }
      };
      
      document.addEventListener('click', handleOutsideClick);
      return () => document.removeEventListener('click', handleOutsideClick);
    }
  }, [isMounted, setShowBuyModal]);

  const totalTokens = amountPerBatch * batchCount;
  const isValidPurchase = batchCount > 0 && batchCount <= availableBatches;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="modal-content card max-w-md w-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent-primary/20 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-accent-primary" />
            </div>
            <h3 className="text-xl font-semibold text-primary-text">Buy {tokenSymbol}</h3>
          </div>
          <button
            onClick={() => setShowBuyModal(false)}
            className="p-2 hover:bg-hover-bg rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-secondary" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Purchase Info */}
          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-blue-400 mb-1">Public Sale Purchase</h4>
                <p className="text-sm text-secondary">
                  You can purchase as many batches as available. Each batch contains {addComma(amountPerBatch)} {tokenSymbol} tokens.
                </p>
              </div>
            </div>
          </div>

          {/* Purchase Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Number of Batches
              </label>
              <input
                value={batchCount}
                type="number"
                min={1}
                step={1}
                max={availableBatches}
                onChange={(e) => setBatchCount(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 bg-secondary-bg border border-border-color rounded-lg text-primary-text focus:outline-none focus:border-accent-primary"
              />
              <p className="text-xs text-secondary mt-1">
                Maximum available: {availableBatches} batches
              </p>
            </div>

            {/* Purchase Summary */}
            <div className="p-4 bg-secondary-bg/50 rounded-lg border border-border-color">
              <h4 className="font-medium text-primary-text mb-3">Purchase Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-secondary">Batches:</span>
                  <span className="text-primary-text font-medium">{batchCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-secondary">Tokens per batch:</span>
                  <span className="text-primary-text">{addComma(amountPerBatch)} {tokenSymbol}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-secondary">Total tokens:</span>
                  <span className="text-accent-primary font-semibold">{addComma(totalTokens)} {tokenSymbol}</span>
                </div>
                <div className="border-t border-border-color pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="text-secondary">Total cost:</span>
                    <span className="text-lg font-bold text-primary-text">{kdaInput} KDA</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowBuyModal(false)}
                className="flex-1 btn btn-ghost"
              >
                Cancel
              </button>
              <button
                onClick={handleBuy}
                disabled={!isValidPurchase}
                className="flex-1 btn btn-primary flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                Buy Now
              </button>
            </div>

            {!isValidPurchase && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm">
                  {batchCount <= 0 ? 'Please enter a valid number of batches' : 
                   batchCount > availableBatches ? 'Not enough batches available' : 
                   'Invalid purchase amount'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

BuyModal.propTypes = {
  tokenSymbol: PropTypes.string.isRequired,
  batchCount: PropTypes.number.isRequired,
  amountPerBatch: PropTypes.number.isRequired,
  kdaInput: PropTypes.number.isRequired,
  handleBuy: PropTypes.func.isRequired,
  setShowBuyModal: PropTypes.func.isRequired,
  availableBatches: PropTypes.number.isRequired,
};

export default BuyModal;
