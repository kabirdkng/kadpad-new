import { Pact, createClient } from '@kadena/client';
import config from '../wallet/config';
import useWalletStore from "../wallet/walletStore";
import { toast } from "react-toastify";

const network = config.networkId;
const api = config.apiUrl;

/**
 * Deploy sales contract with proper capabilities
 */
export const deploySalesContract = async (contractCode, namespace, moduleName) => {
  try {
    const { account, pubKey } = useWalletStore.getState();
    const pactClient = createClient(`${api}/chainweb/0.0/${network}/chain/${config.chainId}/pact`);
    const providerName = useWalletStore.getState().provider;
    
    if (providerName === null) {
      throw new Error("Provider not found");
    }

    const { default: providers } = await import("../wallet/providers/providers");
    const provider = providers[providerName];

    const tx = Pact.builder
      .execution(contractCode)
      .addSigner(pubKey, (signFor) => [
        signFor(`coin.GAS`),
        signFor(`coin.TRANSFER`, account, `${namespace}.${moduleName}-sales`, 0.0)
      ])
      .setMeta({
        chainId: String(config.chainId),
        gasLimit: 150000,
        gasPrice: 0.000001,
        sender: account
      })
      .setNetworkId(network)
      .addKeyset('ks', 'keys-all', pubKey)
      .createTransaction();

    let signedTx;
    let cmd, sigs, outcomeHash;

    try {
      signedTx = await provider.quickSign(tx);
      if(signedTx.status === 'fail'){
        console.log(signedTx)
        toast.error(`Error :${signedTx.message}`, { position: 'top-center' })
      }
      if (provider.name === "wc") {
        cmd = signedTx.cmd;
        sigs = signedTx.sigs;
        outcomeHash = signedTx.hash;
      } else {
        const commandSigData = signedTx.responses[0].commandSigData;
        cmd = commandSigData.cmd;
        sigs = commandSigData.sigs;
        outcomeHash = signedTx.responses[0].outcome.hash;
      }
    } catch (error) {
      console.error("Error signing transaction:", error);
      throw error;
    }

    const bodyPayload = {
      cmd,
      sigs,
      hash: outcomeHash,
    };

    // Preflight check
    const preflightResult = await pactClient.dirtyRead(bodyPayload);
    console.log('Sales contract preflight result:', preflightResult);
    
    if (preflightResult.result.status === 'failure') {
      console.error('Sales contract deployment failed:', preflightResult.result.error.message);
      toast.error(preflightResult.result.error.message);
      return preflightResult;
    }

    // Submit transaction
    const transactionDescriptor = await pactClient.submit(bodyPayload);
    console.log('Sales Contract Deployment TX Key:', transactionDescriptor.requestKey);
    
    return { 
      pactClient, 
      transactionDescriptor, 
      preflightResult,
      requestKey: transactionDescriptor.requestKey,
      contractAddress: `${namespace}.${moduleName}-sales`
    };

  } catch (error) {
    console.error('Error deploying sales contract:', error);
    throw error;
  }
};

/**
 * Deploy treasury contract with proper capabilities
 */
export const deployTreasuryContract = async (contractCode, namespace, moduleName, tokenSupply = 0) => {
  try {
    const { account, pubKey } = useWalletStore.getState();
    const pactClient = createClient(`${api}/chainweb/0.0/${network}/chain/${config.chainId}/pact`);
    const providerName = useWalletStore.getState().provider;
    
    if (providerName === null) {
      throw new Error("Provider not found");
    }

    const { default: providers } = await import("../wallet/providers/providers");
    const provider = providers[providerName];

    const tx = Pact.builder
      .execution(contractCode)
      .addSigner(pubKey, (signFor) => [
        signFor(`coin.GAS`),
        signFor(`${namespace}.${moduleName}.TRANSFER`, account, `${namespace}.${moduleName}-treasury`, tokenSupply)
      ])
      .setMeta({
        chainId: String(config.chainId),
        gasLimit: 150000,
        gasPrice: 0.000001,
        sender: account
      })
      .setNetworkId(network)
      .addKeyset('ks', 'keys-all', pubKey)
      .createTransaction();

    let signedTx;
    let cmd, sigs, outcomeHash;

    try {
      signedTx = await provider.quickSign(tx);
      if(signedTx.status === 'fail'){
        console.log(signedTx)
        toast.error(`Error :${signedTx.message}`, { position: 'top-center' })
      }
      if (provider.name === "wc") {
        cmd = signedTx.cmd;
        sigs = signedTx.sigs;
        outcomeHash = signedTx.hash;
      } else {
        const commandSigData = signedTx.responses[0].commandSigData;
        cmd = commandSigData.cmd;
        sigs = commandSigData.sigs;
        outcomeHash = signedTx.responses[0].outcome.hash;
      }
    } catch (error) {
      console.error("Error signing transaction:", error);
      throw error;
    }

    const bodyPayload = {
      cmd,
      sigs,
      hash: outcomeHash,
    };

    // Preflight check
    const preflightResult = await pactClient.dirtyRead(bodyPayload);
    console.log('Treasury contract preflight result:', preflightResult);
    
    if (preflightResult.result.status === 'failure') {
      console.error('Treasury contract deployment failed:', preflightResult.result.error.message);
      toast.error(preflightResult.result.error.message);
      return preflightResult;
    }

    // Submit transaction
    const transactionDescriptor = await pactClient.submit(bodyPayload);
    console.log('Treasury Contract Deployment TX Key:', transactionDescriptor.requestKey);
    
    return { 
      pactClient, 
      transactionDescriptor, 
      preflightResult,
      requestKey: transactionDescriptor.requestKey,
      contractAddress: `${namespace}.${moduleName}-treasury`
    };

  } catch (error) {
    console.error('Error deploying treasury contract:', error);
    throw error;
  }
};

/**
 * Initialize sales contract after deployment
 */
export const initializeSalesContract = async (namespace, moduleName) => {
  try {
    const { account, pubKey } = useWalletStore.getState();
    const pactClient = createClient(`${api}/chainweb/0.0/${network}/chain/${config.chainId}/pact`);
    const providerName = useWalletStore.getState().provider;
    
    if (providerName === null) {
      throw new Error("Provider not found");
    }

    const { default: providers } = await import("../wallet/providers/providers");
    const provider = providers[providerName];

    const code = `(${namespace}.${moduleName}-sales.init)`;

    const tx = Pact.builder
      .execution(code)
      .addSigner(pubKey, (signFor) => [
        signFor(`coin.GAS`),
        signFor(`${namespace}.${moduleName}-sales.GOVERNANCE`)
      ])
      .setMeta({
        chainId: String(config.chainId),
        gasLimit: 80000,
        gasPrice: 0.000001,
        sender: account
      })
      .setNetworkId(network)
      .addKeyset('ks', 'keys-all', pubKey)
      .createTransaction();

    let signedTx;
    let cmd, sigs, outcomeHash;

    try {
      signedTx = await provider.quickSign(tx);
      if(signedTx.status === 'fail'){
        console.log(signedTx)
        toast.error(`Error :${signedTx.message}`, { position: 'top-center' })
      }
      if (provider.name === "wc") {
        cmd = signedTx.cmd;
        sigs = signedTx.sigs;
        outcomeHash = signedTx.hash;
      } else {
        const commandSigData = signedTx.responses[0].commandSigData;
        cmd = commandSigData.cmd;
        sigs = commandSigData.sigs;
        outcomeHash = signedTx.responses[0].outcome.hash;
      }
    } catch (error) {
      console.error("Error signing transaction:", error);
      throw error;
    }

    const bodyPayload = {
      cmd,
      sigs,
      hash: outcomeHash,
    };

    // Preflight check
    const preflightResult = await pactClient.dirtyRead(bodyPayload);
    console.log('Sales contract initialization preflight result:', preflightResult);
    
    if (preflightResult.result.status === 'failure') {
      console.error('Sales contract initialization failed:', preflightResult.result.error.message);
      toast.error(preflightResult.result.error.message);
      return preflightResult;
    }

    // Submit transaction
    const transactionDescriptor = await pactClient.submit(bodyPayload);
    console.log('Sales Contract Initialization TX Key:', transactionDescriptor.requestKey);
    
    return { 
      pactClient, 
      transactionDescriptor, 
      preflightResult,
      requestKey: transactionDescriptor.requestKey
    };

  } catch (error) {
    console.error('Error initializing sales contract:', error);
    throw error;
  }
};

/**
 * Initialize treasury contract after deployment
 */
export const initializeTreasuryContract = async (namespace, moduleName) => {
  try {
    const { account, pubKey } = useWalletStore.getState();
    const pactClient = createClient(`${api}/chainweb/0.0/${network}/chain/${config.chainId}/pact`);
    const providerName = useWalletStore.getState().provider;
    
    if (providerName === null) {
      throw new Error("Provider not found");
    }

    const { default: providers } = await import("../wallet/providers/providers");
    const provider = providers[providerName];

    const code = `(${namespace}.${moduleName}-treasury.init)`;

    const tx = Pact.builder
      .execution(code)
      .addSigner(pubKey, (signFor) => [
        signFor(`coin.GAS`),
        signFor(`${namespace}.${moduleName}-treasury.GOVERNANCE`)
      ])
      .setMeta({
        chainId: String(config.chainId),
        gasLimit: 80000,
        gasPrice: 0.000001,
        sender: account
      })
      .setNetworkId(network)
      .addKeyset('ks', 'keys-all', pubKey)
      .createTransaction();

    let signedTx;
    let cmd, sigs, outcomeHash;

    try {
      signedTx = await provider.quickSign(tx);
      if(signedTx.status === 'fail'){
        console.log(signedTx)
        toast.error(`Error :${signedTx.message}`, { position: 'top-center' })
      }
      if (provider.name === "wc") {
        cmd = signedTx.cmd;
        sigs = signedTx.sigs;
        outcomeHash = signedTx.hash;
      } else {
        const commandSigData = signedTx.responses[0].commandSigData;
        cmd = commandSigData.cmd;
        sigs = commandSigData.sigs;
        outcomeHash = signedTx.responses[0].outcome.hash;
      }
    } catch (error) {
      console.error("Error signing transaction:", error);
      throw error;
    }

    const bodyPayload = {
      cmd,
      sigs,
      hash: outcomeHash,
    };

    // Preflight check
    const preflightResult = await pactClient.dirtyRead(bodyPayload);
    console.log('Treasury contract initialization preflight result:', preflightResult);
    
    if (preflightResult.result.status === 'failure') {
      console.error('Treasury contract initialization failed:', preflightResult.result.error.message);
      toast.error(preflightResult.result.error.message);
      return preflightResult;
    }

    // Submit transaction
    const transactionDescriptor = await pactClient.submit(bodyPayload);
    console.log('Treasury Contract Initialization TX Key:', transactionDescriptor.requestKey);
    
    return { 
      pactClient, 
      transactionDescriptor, 
      preflightResult,
      requestKey: transactionDescriptor.requestKey
    };

  } catch (error) {
    console.error('Error initializing treasury contract:', error);
    throw error;
  }
};

/**
 * Transfer tokens from main contract to sales contract
 */
export const transferTokensToSales = async (namespace, moduleName, amount) => {
  try {
    const { account, pubKey } = useWalletStore.getState();
    const pactClient = createClient(`${api}/chainweb/0.0/${network}/chain/${config.chainId}/pact`);
    const providerName = useWalletStore.getState().provider;
    
    if (providerName === null) {
      throw new Error("Provider not found");
    }

    const { default: providers } = await import("../wallet/providers/providers");
    const provider = providers[providerName];

    const code = `(${namespace}.${moduleName}.transfer "${account}" "${namespace}.${moduleName}-sales" ${amount})`;

    const tx = Pact.builder
      .execution(code)
      .addSigner(pubKey, (signFor) => [
        signFor(`coin.GAS`),
        signFor(`${namespace}.${moduleName}.TRANSFER`, account, `${namespace}.${moduleName}-sales`, amount)
      ])
      .setMeta({
        chainId: String(config.chainId),
        gasLimit: 80000,
        gasPrice: 0.000001,
        sender: account
      })
      .setNetworkId(network)
      .addKeyset('ks', 'keys-all', pubKey)
      .createTransaction();

    let signedTx;
    let cmd, sigs, outcomeHash;

    try {
      signedTx = await provider.quickSign(tx);
      if(signedTx.status === 'fail'){
        console.log(signedTx)
        toast.error(`Error :${signedTx.message}`, { position: 'top-center' })
      }
      if (provider.name === "wc") {
        cmd = signedTx.cmd;
        sigs = signedTx.sigs;
        outcomeHash = signedTx.hash;
      } else {
        const commandSigData = signedTx.responses[0].commandSigData;
        cmd = commandSigData.cmd;
        sigs = commandSigData.sigs;
        outcomeHash = signedTx.responses[0].outcome.hash;
      }
    } catch (error) {
      console.error("Error signing transaction:", error);
      throw error;
    }

    const bodyPayload = {
      cmd,
      sigs,
      hash: outcomeHash,
    };

    // Preflight check
    const preflightResult = await pactClient.dirtyRead(bodyPayload);
    console.log('Token transfer preflight result:', preflightResult);
    
    if (preflightResult.result.status === 'failure') {
      console.error('Token transfer failed:', preflightResult.result.error.message);
      toast.error(preflightResult.result.error.message);
      return preflightResult;
    }

    // Submit transaction
    const transactionDescriptor = await pactClient.submit(bodyPayload);
    console.log('Token Transfer TX Key:', transactionDescriptor.requestKey);
    
    return { 
      pactClient, 
      transactionDescriptor, 
      preflightResult,
      requestKey: transactionDescriptor.requestKey
    };

  } catch (error) {
    console.error('Error transferring tokens to sales contract:', error);
    throw error;
  }
};
