import Decimal from "decimal.js";

const MAX_DECIMALS = 12; // common for Pact tokens (like KDA)

export const formatAmountForPact = (amount) => {
  if (amount === null || amount === undefined) return "0.0";

  const dec = new Decimal(amount);

  // Limit to 12 decimals max
  const fixed = dec.toDecimalPlaces(MAX_DECIMALS, Decimal.ROUND_DOWN);

  if (fixed.isInteger()) {
    return fixed.toFixed(1); // ensure .0 for integers
  }

  // Strip trailing zeros but keep decimals
  return fixed.toString();
};

export const formatDecimal = (value) => {
  if (value === null || value === undefined) return "0.0";

  const dec = new Decimal(value);
  const fixed = dec.toDecimalPlaces(MAX_DECIMALS, Decimal.ROUND_DOWN);

  return fixed.isInteger()
    ? fixed.toFixed(1)
    : fixed.toString();
};

// Additional utility functions for precise calculations
export const preciseAdd = (a, b) => {
  const decA = new Decimal(a || 0);
  const decB = new Decimal(b || 0);
  return decA.plus(decB).toString();
};

export const preciseSubtract = (a, b) => {
  const decA = new Decimal(a || 0);
  const decB = new Decimal(b || 0);
  return decA.minus(decB).toString();
};

export const preciseMultiply = (a, b) => {
  const decA = new Decimal(a || 0);
  const decB = new Decimal(b || 0);
  return decA.times(decB).toString();
};

export const preciseDivide = (a, b) => {
  const decA = new Decimal(a || 0);
  const decB = new Decimal(b || 1);
  return decA.dividedBy(decB).toString();
};

// Calculate treasury amount with precision
export const calculateTreasuryAmount = (totalSupply, salesAmount, liquidityAmount) => {
  const total = new Decimal(totalSupply || 0);
  const sales = new Decimal(salesAmount || 0);
  const liquidity = new Decimal(liquidityAmount || 0);
  
  const treasury = total.minus(sales).minus(liquidity);
  return treasury.toString();
};
