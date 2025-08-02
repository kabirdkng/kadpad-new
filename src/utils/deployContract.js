// Re-export all deployment functionality from the new modular structure
export * from './deployment/index.js';

// Backward compatibility - keep the main function accessible
export { deploySalesAndTreasuryWithTokenDistribution } from './deployment/completeDeployment.js';
export { initiateDeployContract } from './deployment/contractDeployment.js';
