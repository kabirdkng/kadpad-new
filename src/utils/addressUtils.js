export const validateAddress = (address) => {
  const slicedAddress = address.slice(2);
  return slicedAddress.length === 64;
};

export const parseCsvFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const lines = text.split('\n').filter(line => line.trim());
        const addresses = [];
        
        for (let line of lines) {
          // Split by comma, semicolon, or tab and clean each address
          const lineAddresses = line.split(/[,;\t]/).map(addr => addr.trim()).filter(addr => addr);
          addresses.push(...lineAddresses);
        }
        
        resolve(addresses);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
};

export const parseBulkAddresses = (text) => {
  // Split by comma, semicolon, newline, or tab and clean each address
  return text
    .split(/[,;\n\t]/)
    .map(addr => addr.trim())
    .filter(addr => addr);
};

export const validateAndAddAddresses = (addresses, walletsToWhitelist, setWalletsToWhitelist, toast, reservedWallets = []) => {
  const validAddresses = [];
  const invalidAddresses = [];
  const duplicateAddresses = [];
  const reservedAddresses = [];
  
  addresses.forEach(address => {
    if (!address) return;
    
    if (walletsToWhitelist.includes(address)) {
      duplicateAddresses.push(address);
    } else if (reservedWallets.includes(address)) {
      reservedAddresses.push(address);
    } else if (validateAddress(address)) {
      validAddresses.push(address);
    } else {
      invalidAddresses.push(address);
    }
  });
  
  if (validAddresses.length > 0) {
    setWalletsToWhitelist(prev => [...prev, ...validAddresses]);
    toast.success(`Added ${validAddresses.length} valid addresses to whitelist`);
  }
  
  if (invalidAddresses.length > 0) {
    toast.error(`${invalidAddresses.length} invalid addresses found`);
    console.log('Invalid addresses:', invalidAddresses);
  }
  
  if (duplicateAddresses.length > 0) {
    toast.warning(`${duplicateAddresses.length} duplicate addresses skipped`);
  }
  
  if (reservedAddresses.length > 0) {
    toast.warning(`${reservedAddresses.length} addresses skipped (already reserved)`);
  }
  
  return { validAddresses, invalidAddresses, duplicateAddresses, reservedAddresses };
};
