import React, { useState } from 'react';

const Stake = () => {
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [activeTab, setActiveTab] = useState('stake');

  // Placeholder data (replace with actual data in a real implementation)
  const userKPADBalance = 50000;
  const userStakedKPAD = 69420;
  const totalKPADStaked = 30000000;
  const totalKDARewards = 1234;
  const userAccumulatedRewards = 42;

  const handleClaimRewards = () => {
    // Implement reward claiming logic here
    console.log('Claiming rewards');
  };

  const handleMaxStake = () => {
    setStakeAmount(userKPADBalance.toString());
  };

  const handleMaxUnstake = () => {
    setUnstakeAmount(userStakedKPAD.toString());
  };

  return (
    <div className="container mx-auto px-4 py-8 text-white">
      <h1 className='text-center py-6 text-4xl'>Staking</h1>

      <h1 className='h-[50vh] text-8xl text-center my-52'> Coming Soon </h1>
      {/* <div className="flex flex-row gap-6 mb-6">
        <div className="bg-gray-800 bg-opacity-80 rounded-lg p-6 shadow-lg flex-1">
          <p className="text-sm text-gray-400">Total Staked</p>
          <p className="text-2xl font-semibold">{totalKPADStaked.toLocaleString()} $KPAD</p>
        </div>
        <div className="bg-gray-800 bg-opacity-80 rounded-lg p-6 shadow-lg flex-1">
          <p className="text-sm text-gray-400">Total Rewards</p>
          <p className="text-2xl font-semibold">{totalKDARewards.toLocaleString()} $KDA</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="bg-gray-800 bg-opacity-80 rounded-lg p-6 shadow-lg">
            <p className="text-gray-400 mb-4">
              Stake any amount to earn $KDA rewards. Stake 200k $KPAD to earn a Whitelist spot on all KadPad launches.
            </p>
            <div className="flex space-x-2 mb-4">
              <button
                className={`px-4 py-2 rounded-md font-medium ${
                  activeTab === 'stake' ? 'bg-lime-500 text-white' : 'bg-gray-700 text-gray-300'
                }`}
                onClick={() => setActiveTab('stake')}
              >
                Stake
              </button>
              <button
                className={`px-4 py-2 rounded-md font-medium ${
                  activeTab === 'unstake' ? 'bg-red-500 text-white' : 'bg-gray-700 text-gray-300'
                }`}
                onClick={() => setActiveTab('unstake')}
              >
                Unstake
              </button>
            </div>
            {activeTab === 'stake' ? (
              <div className="space-y-4">
                <div className="rounded p-2 mb-2">
                  <p className="text-sm text-gray-300">Your $KPAD Balance: {userKPADBalance.toLocaleString()} $KPAD</p>
                </div>
                <div>
                  <label htmlFor="stake" className="block text-sm font-medium text-gray-400 mb-1">
                    Amount to Stake
                  </label>
                  <div className="relative">
                    <input
                      id="stake"
                      type="number"
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      className="w-full bg-gray-700 bg-opacity-50 rounded border border-gray-600 focus:border-lime-500 focus:bg-gray-800 focus:ring-2 focus:ring-lime-900 text-base outline-none text-gray-100 py-1 px-3 pr-0 leading-8 transition-colors duration-200 ease-in-out"
                      placeholder="Enter amount"
                      min="0"
                      step="1"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center">
                      <span className="px-2 text-gray-400 text-sm">$KPAD</span>
                      <button
                        onClick={handleMaxStake}
                        className="px-2 mr-5 text-sm font-medium text-gray-300 hover:text-white"
                      >
                        Max
                      </button>
                    </div>
                  </div>
                </div>
                <button className="w-full bg-lime-500 hover:bg-lime-600 text-white font-bold py-2 px-4 rounded">
                  Stake $KPAD →
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded p-2 mb-2">
                  <p className="text-sm text-gray-300">Your Staked $KPAD: {userStakedKPAD.toLocaleString()} $KPAD</p>
                </div>
                <div>
                  <label htmlFor="unstake" className="block text-sm font-medium text-gray-400 mb-1">
                    Amount to Unstake
                  </label>
                  <div className="relative">
                    <input
                      id="unstake"
                      type="number"
                      value={unstakeAmount}
                      onChange={(e) => setUnstakeAmount(e.target.value)}
                      className="w-full bg-gray-700 bg-opacity-50 rounded border border-gray-600 focus:border-red-500 focus:bg-gray-800 focus:ring-2 focus:ring-red-900 text-base outline-none text-gray-100 py-1 px-3 pr-0 leading-8 transition-colors duration-200 ease-in-out"
                      placeholder="Enter amount"
                      min="0"
                      step="1"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center">
                      <span className="px-2 text-gray-400 text-sm">$KPAD</span>
                      <button
                        onClick={handleMaxUnstake}
                        className="px-2 mr-5 text-sm font-medium text-gray-300 hover:text-white"
                      >
                        Max
                      </button>
                    </div>
                  </div>
                </div>
                <button className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">
                  ← Unstake $KPAD
                </button>
              </div>
            )}
            <div className="mt-6 bg-gray-700 bg-opacity-80 rounded-md p-4">
              <h4 className="font-semibold mb-2">Important Note</h4>
              <p className="text-sm text-gray-300">
                When unstaking, there is a 7 day waiting period. During this period, you do not earn rewards or Whitelist spots.
              </p>
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="bg-gray-800 bg-opacity-80 rounded-lg p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Your Rewards</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Accumulated Rewards:</span>
                <span className="font-medium">{userAccumulatedRewards.toLocaleString()} $KDA</span>
              </div>
              <button 
                onClick={handleClaimRewards}
                className="w-full bg-lime-500 hover:bg-lime-600 text-white font-bold py-2 px-4 rounded"
              >
                Claim Rewards
              </button>
            </div>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default Stake;
