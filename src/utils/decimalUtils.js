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