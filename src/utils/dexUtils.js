/**
 * DEX Configuration Utilities
 * Provides DEX configuration based on supply chain and network
 */

export function getDexConfiguration(supplyChain, network = 'testnet04') {
  let dexNs = '';
  let dexMod = '';
  let shortName = '';

  supplyChain = String(supplyChain);

  if (network === 'testnet04') {
    switch (supplyChain) {
      case "0":
        dexNs = 'kdlaunch';
        dexMod = 'kdswap-exchange';
        shortName = 'KDS';
        break;
      case "1":
        dexNs = 'n_3b878bdca18974c33dec88e791dd974107edc861';
        dexMod = 'exchange';
        shortName = 'Mercatus';
        break;
      default:
        dexNs = 'defaultTestnetNs';
        dexMod = 'defaultTestnetMod';
        shortName = 'Unknown';
    }
  } else if (network === 'mainnet01') {
    switch (supplyChain) {
      case "1":
        dexNs = 'kdlaunch';
        dexMod = 'kdswap-exchange';
        shortName = 'KDS';
        break;
      case "2":
        dexNs = 'kaddex';
        dexMod = 'exchange';
        shortName = 'Mercatus';
        break;
      default:
        dexNs = 'defaultMainnetNs';
        dexMod = 'defaultMainnetMod';
        shortName = 'Unknown';
    }
  } else {
    dexNs = 'defaultNs';
    dexMod = 'defaultMod';
    shortName = 'Unknown';
  }

  return { dexNs, dexMod, shortName };
}
