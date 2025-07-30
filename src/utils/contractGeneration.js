/**
 * Contract generation utilities for sales and treasury contracts
 */

import { generateSalesContract } from './salesContractTemplate.js';
import { generateTreasuryContract } from './treasuryContractTemplate.js';

export const generateNamespaceAndKeyset = (namespace) => {
  const ns = `(define-namespace (ns.create-principal-namespace (read-keyset "ks")) (read-keyset "ks") (read-keyset "ks"))`;
  const n = `(namespace '${namespace})`;
  const keys = `(define-keyset "${namespace}.gov" (read-keyset "ks"))`;
  
  return { ns, n, keys };
};

// Re-export the contract generation functions
export { generateSalesContract, generateTreasuryContract };

export const generateCompleteContracts = (tokenDetails, salesDetails) => {
  const { contractAddress } = tokenDetails;
  const [namespace, moduleName] = contractAddress.split('.');
  
  const salesContract = generateSalesContract(moduleName, namespace, salesDetails);
  const treasuryContract = generateTreasuryContract(moduleName, namespace);
  
  return {
    salesContract,
    treasuryContract,
    moduleName,
    namespace: namespace
  };
};
