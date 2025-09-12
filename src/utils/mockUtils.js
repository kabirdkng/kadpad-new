// Mock configuration for testing
export const MOCK_CONFIG = {
  ENABLE_WHITELIST_MOCK: true, // Set to true to enable mock mode
  MOCK_DELAY: 2000, // 2 seconds delay to simulate real transaction
};

// Mock pact call result - simulates a successful pact transaction
export const mockPactCallResult = (walletsToWhitelist, supplyChain) => {
  const mockRequestKey = `mock-tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    preflightResult: {
      result: {
        status: 'success',
        data: `Successfully reserved batches for ${walletsToWhitelist.length} wallets`
      }
    },
    transactionDescriptor: {
      requestKey: mockRequestKey,
      chainId: supplyChain
    },
    pactClient: {
      // Mock pact client object
      chainId: supplyChain
    }
  };
};

// Mock polling result - simulates successful transaction completion
export const mockPollingResult = (requestKey) => {
  return {
    result: {
      status: 'success',
      data: `Transaction ${requestKey} completed successfully`
    },
    transactionId: requestKey
  };
};
