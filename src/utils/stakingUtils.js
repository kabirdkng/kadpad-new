/**
 * Utility functions for staking calculations and data extraction
 * These are pure functions that don't trigger any data fetching or effects
 */

// Helper function to extract numeric value from Pact data
export const extractNumericValue = (value) => {
  if (value === null || value === undefined) return 0;
  
  if (typeof value === 'object' && value !== null) {
    if ('decimal' in value) return parseFloat(value.decimal) || 0;
    if ('int' in value) return parseInt(value.int) || 0;
    return 0;
  }
  
  return parseFloat(value) || 0;
};

// Helper function to extract date value from Pact data
export const extractDateValue = (value) => {
  if (!value) return null;
  
  try {
    // Handle Pact time format
    if (typeof value === 'object' && value !== null) {
      if (value.time) {
        // Parse ISO timestamp from Pact
        const timestamp = value.time;
        return new Date(timestamp);
      }
      if (value.timep) {
        // Handle time with precision
        const timestamp = value.timep;
        return new Date(timestamp);
      }
    }
    
    // Handle string timestamps
    if (typeof value === 'string') {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
    
    // Handle numeric timestamps (seconds since epoch)
    if (typeof value === 'number') {
      return new Date(value * 1000);
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing date value:', error, value);
    return null;
  }
};

// Helper function to determine tier based on staked amount
export const getTierByAmount = (amount) => {
  const numericAmount = extractNumericValue(amount);
  
  if (numericAmount >= 100000) {
    return { tier: 3, name: 'Tier 3', minAmount: 100000 };
  } else if (numericAmount >= 50000) {
    return { tier: 2, name: 'Tier 2', minAmount: 50000 };
  } else if (numericAmount >= 10000) {
    return { tier: 1, name: 'Tier 1', minAmount: 10000 };
  } else {
    return { tier: 0, name: 'No Tier', minAmount: 0 };
  }
};

// Fallback penalty calculation (client-side) based on smart contract logic
export const calculatePenaltyFallback = (amount, lockDate) => {
  if (!amount || !lockDate) return { penaltyPercent: 0, isMature: false };

  const now = new Date();
  const lockTime = new Date(lockDate);
  const daysPassed = Math.floor((now - lockTime) / (1000 * 60 * 60 * 24));
  
  // Lock period is 365 days
  const lockPeriodDays = 365;
  const isMature = daysPassed >= lockPeriodDays;
  
  if (isMature) {
    return { penaltyPercent: 0, isMature: true };
  }
  
  // Penalty decreases linearly from 50% to 0% over 365 days
  const maxPenalty = 0.5; // 50%
  const penaltyPercent = maxPenalty * (1 - (daysPassed / lockPeriodDays));
  
  return {
    penaltyPercent: Math.max(0, Math.min(maxPenalty, penaltyPercent)),
    isMature: false
  };
};