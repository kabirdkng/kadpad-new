const config = {
    testnet: {
      apiUrl: "https://api.testnet.chainweb.com",
      client: "https://api.testnet.chainweb.com/chainweb/0.0/testnet04/chain/1/pact",
      chainId: "2",
      networkId: "testnet04",
      spireKeyUrl: "https://spirekey.kadena.io",
    },
    mainnet: {
      apiUrl: "https://api.chainweb.com",
      client: "https://api.chainweb.com/chainweb/0.0/mainnet01/chain/8/pact",
      chainId: "2",
      networkId: "mainnet01",
      spireKeyUrl: "https://spirekey.kadena.io",
    }
  };
  
  // Determine the current environment
  const currentEnv = import.meta.env.VITE_APP_ENV === 'mainnet' ? 'mainnet' : 'testnet';
  console.log(currentEnv);
  export default config[currentEnv];