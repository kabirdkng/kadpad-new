import React, { useState, useEffect } from 'react'
import usePresaleStore from '../store/usePresaleStore';
import { addComma } from './Presale';

const BuyModal = ({ tokenSymbol, batchCount, amountPerBatch, kdaInput, handleBuy, setShowBuyModal, availableBatches }) => {
  const { setBatchCount } = usePresaleStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(false);
    };
  }, []);

  useEffect(() => {
    if (isMounted) {
      document.addEventListener('click', handleOutsideClick);
      return () => {
        document.removeEventListener('click', handleOutsideClick);
      };
    }
  }, [isMounted]);

  const handleOutsideClick = (event) => {
    if (!event.target.closest('.buy-modal')) {
      setShowBuyModal(false);
    }
  };

  useEffect(() => {
    setBatchCount(1);
  }, [setBatchCount]);

  const increment = () => {
    if (batchCount < availableBatches) {
      setBatchCount(batchCount + 1);
    }
  };

  const decrement = () => {
    if (batchCount > 1) {
      setBatchCount(batchCount - 1);
    }
  };

  return (
    <div className="wallet-modal-container bg-gray-900 bg-opacity-30">
      <div className="buy-modal bg-gray-950 rounded-lg text-center">
        <h2>Buy ${tokenSymbol}</h2>
        <h4>In public sale, you can buy as many tokens as you want</h4>
        <div className="buy-form">
          <label>You Give {kdaInput} KDA</label>

          {/* Custom number input with increment and decrement buttons */}
          <div className="flex items-center justify-center space-x-2 mt-2">
            {/* Decrement button */}
            <button 
              onClick={decrement} 
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-1 px-2 rounded-l">
              -
            </button>

            {/* Number input */}
            <input
              value={batchCount}
              type="number"
              min={1}
              max={availableBatches}
              className="w-16 text-center border border-gray-300 rounded-none"
              onChange={(e) => setBatchCount(Number(e.target.value))}
            />

            {/* Increment button */}
            <button 
              onClick={increment} 
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-1 px-2 rounded-r">
              +
            </button>
          </div>

          <button onClick={handleBuy} className="btn btn-secondary mt-4">
            Buy
          </button>

          <p className="mt-2">
            You shall get {addComma(amountPerBatch * batchCount)} {tokenSymbol}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BuyModal;
