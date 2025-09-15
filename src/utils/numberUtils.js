export const addComma = (num) => {
    if (num == null) return '';
    const [intPart, decPart] = num.toString().split('.');
    const withComma = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return decPart !== undefined ? `${withComma}.${decPart}` : withComma;
};

// Format large numbers with K, M, B suffixes
export const formatLargeNumber = (num, decimals = 1) => {
    if (num == null || isNaN(num)) return '0';
    
    const number = parseFloat(num);
    const absNumber = Math.abs(number);
    
    if (absNumber >= 1e9) {
        return (number / 1e9).toFixed(decimals).replace(/\.0$/, '') + 'B';
    }
    if (absNumber >= 1e6) {
        return (number / 1e6).toFixed(decimals).replace(/\.0$/, '') + 'M';
    }
    if (absNumber >= 1e3) {
        return (number / 1e3).toFixed(decimals).replace(/\.0$/, '') + 'K';
    }
    
    // For smaller numbers, show with comma formatting
    if (absNumber >= 100) {
        return addComma(number.toFixed(0));
    }
    
    // For very small numbers, show up to 2 decimal places
    return number.toFixed(2).replace(/\.?0+$/, '');
};

// Smart number formatter that chooses between comma and suffix format
export const formatNumber = (num, options = {}) => {
    const {
        preferSuffix = false, // If true, prefers K/M/B format over comma format
        decimals = 1,
        alwaysShowDecimals = false
    } = options;
    
    if (num == null || isNaN(num)) return '0';
    
    const number = parseFloat(num);
    const absNumber = Math.abs(number);
    
    // For very large numbers, always use suffix
    if (absNumber >= 1e6 || (preferSuffix && absNumber >= 1e3)) {
        return formatLargeNumber(number, decimals);
    }
    
    // For smaller numbers, use comma formatting
    if (alwaysShowDecimals && absNumber < 1e3) {
        return addComma(number.toFixed(decimals));
    }
    
    return addComma(number.toFixed(0));
};

// Compact format specifically for dashboard cards and stats
export const formatCompact = (num, decimals = 1) => {
    return formatLargeNumber(num, decimals);
};

// Format for balance display (shows more precision for smaller amounts)
export const formatBalance = (num) => {
    if (num == null || isNaN(num)) return '0';
    
    const number = parseFloat(num);
    const absNumber = Math.abs(number);
    
    if (absNumber >= 1e6) {
        return formatLargeNumber(number, 2);
    }
    if (absNumber >= 1e3) {
        return formatLargeNumber(number, 1);
    }
    if (absNumber >= 1) {
        return addComma(number.toFixed(2));
    }
    
    // For very small balances, show up to 6 decimal places
    return number.toFixed(6).replace(/\.?0+$/, '');
};