export const formatDateTime = (dateString) => {
  if (!dateString) return 'Not set';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

export const formatPrice = (price) => {
  if (!price && price !== 0) return 'Not set';
  
  try {
    const numPrice = parseFloat(price);
    if (isNaN(numPrice)) {
      return 'Invalid price';
    }
    
    return `${numPrice.toFixed(3)} KDA`;
  } catch (error) {
    console.error('Error formatting price:', error);
    return 'Invalid price';
  }
};
