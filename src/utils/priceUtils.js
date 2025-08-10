/**
 * Fetches current KDA price from DIA API
 * @returns {Promise<number>} Current KDA price in USD
 */
export const fetchKDAPrice = async () => {
  try {
    const response = await fetch('https://api.diadata.org/v1/assetQuotation/Kadena/0x0000000000000000000000000000000000000000');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.Price;
  } catch (error) {
    console.error('Error fetching KDA price:', error);
    // Return a fallback price or throw error based on your needs
    throw new Error('Failed to fetch KDA price');
  }
};

/**
 * Converts USD amount to KDA amount
 * @param {number} usdAmount - Amount in USD
 * @param {number} kdaPrice - Current KDA price in USD
 * @returns {number} Amount in KDA
 */
export const convertUSDToKDA = (usdAmount, kdaPrice) => {
  if (!kdaPrice || kdaPrice <= 0) {
    throw new Error('Invalid KDA price');
  }
  return usdAmount / kdaPrice;
};

/**
 * Formats KDA amount for display
 * @param {number} kdaAmount - Amount in KDA
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted KDA amount
 */
export const formatKDAAmount = (kdaAmount, decimals = 4) => {
  return kdaAmount.toFixed(decimals);
};
