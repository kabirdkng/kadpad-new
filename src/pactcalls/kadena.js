import { Pact, createClient } from '@kadena/client';
import config from '../wallet/config';
import useWalletStore from "../wallet/walletStore";
import providers from "../wallet/providers/providers";
import { toast } from "react-toastify";

const network = config.networkId;
const api = config.apiUrl;

// Utility function to create transactions with common configuration
const createTx = (code, chain, options = {}) => {
  const { 
    pubKey, 
    account, 
    sender, 
    signers = [], 
    gasLimit = 80000, 
    gasPrice = 0.0000001,
    addKeyset = true 
  } = options;

  const providerName = useWalletStore.getState().provider;
  
  let txBuilder = Pact.builder
    .execution(code)
    .setMeta({
      chainId: String(chain),
      gasLimit,
      gasPrice,
      ...(sender && { sender })
    })
    .setNetworkId(network);

  // Add signers if provided
  if (signers.length > 0 && pubKey) {
    txBuilder = txBuilder.addSigner(pubKey, (signFor) => signers.map(signer => signFor(...signer)));
  }

  // Add keyset handling
  if (addKeyset) {
    if (providerName === 'magic' && account) {
      // Extract namespace and keyset name from account for magic wallet
      const accountParts = account.split(':')[1].split('.');
      const namespace = accountParts[0];
      const keysetName = accountParts[1];
      
      txBuilder = txBuilder.addKeyset('ks', {
        keysetref: {
          ns: namespace,
          ksn: keysetName
        }
      });
    } else if (pubKey) {
      txBuilder = txBuilder.addKeyset('ks', 'keys-all', pubKey);
    }
  }

  return txBuilder.createTransaction();
};

// Utility function for signing and submitting transactions
const signAndSubmitTx = async (tx, pactClient) => {
  const providerName = useWalletStore.getState().provider;
  const provider = providers[providerName];
  
  if (providerName === null) {
    throw new Error("Provider not found");
  }

  let signedTx;
  let cmd, sigs, outcomeHash;
  
  console.log(provider.config);
  
  try {
    signedTx = await provider.quickSign(tx);
    if(signedTx.status === 'fail'){
      console.log(signedTx);
      toast.error(`Error: ${signedTx.message}`, { position: 'top-center' });
      return signedTx;
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
    console.error(error);
    throw error;
  }

  const bodyPayload = {
    cmd,
    sigs,
    hash: outcomeHash,
  };

  const preflightResult = await pactClient.dirtyRead(bodyPayload);
  console.log(preflightResult);
  
  if (preflightResult.result.status === 'failure') {
    console.error(preflightResult.result.error.message);
    toast.error(preflightResult.result.error.message);
    return preflightResult;
  } else {
    const transactionDescriptor = await pactClient.submit(bodyPayload);
    console.log('TX Key: ', transactionDescriptor.requestKey);
    return { pactClient, transactionDescriptor, preflightResult };
  }
};

export const pactCallsSig = async(code, chain) => {
  try  {
    const { account, pubKey } = useWalletStore.getState();
    const pactClient = createClient(`${api}/chainweb/0.0/${network}/chain/${chain}/pact`);

    const tx = createTx(code, chain, {
      pubKey,
      account,
      sender: account,
      signers: [['coin.GAS']]
    });

    return await signAndSubmitTx(tx, pactClient);
  } catch (error) {
    console.error(error);
  }
}

export const pactCallsSales = async(code, chain, namespace, moduleName) => {
  try  {
    const { account, pubKey } = useWalletStore.getState();
    const pactClient = createClient(`${api}/chainweb/0.0/${network}/chain/${chain}/pact`);

    const tx = createTx(code, chain, {
      pubKey,
      account,
      sender: account,
      signers: [
        [`${namespace}.${moduleName}-sales.SALES-OPERATOR`],
        ['coin.GAS']
      ]
    });

    return await signAndSubmitTx(tx, pactClient);
  } catch (error) {
    console.error(error);
  }
}

export const pactCalls = async(code, chain) => {
  const pactClient = createClient(`${api}/chainweb/0.0/${network}/chain/${chain}/pact`)
  
  const tx = createTx(code, chain, {
    gasLimit: 80000,
    gasPrice: 0.0000001,
    addKeyset: false
  });

  try{
    const res = await pactClient.dirtyRead(tx)
    return res;
  } catch (error) {
    console.error('Error in pact Call:', error)
    return null;
  }
}

export const fetchBalance = async(code, chain) => {
  console.log('🔍 fetchBalance: Starting with code:', code);
  console.log('🔍 fetchBalance: Chain:', chain);
  
  const pactClient = createClient(`${api}/chainweb/0.0/${network}/chain/${chain}/pact`)
  
  const tx = createTx(code, chain, {
    gasLimit: 1000,
    gasPrice: 0.0000001,
    addKeyset: false
  });
             
  try{
    const res = await pactClient.dirtyRead(tx)
    console.log('🔍 fetchBalance: Full response from pactClient.dirtyRead:', res);
    console.log('🔍 fetchBalance: res.result:', res.result);
    console.log('🔍 fetchBalance: res.result.data:', res.result.data);
    console.log('🔍 fetchBalance: Returning:', res.result.data);
    return res.result.data;
  } catch (error) {
    console.error('❌ Error fetching account details:', error)
    return null;
  }
}

export const buyTokensSale = async(code, chain, salesAccount, amount) => {
  try {
    const { account, pubKey } = useWalletStore.getState();
    const pactClient = createClient(`${api}/chainweb/0.0/${network}/chain/${chain}/pact`);

    const receiver = salesAccount;
    console.log(receiver);
    console.log(amount);

    const tx = createTx(code, chain, {
      pubKey,
      account,
      sender: account,
      signers: [
        ['coin.TRANSFER', account, receiver, Number(amount)],
        ['coin.GAS']
      ]
    });

    console.log("transaction", tx);

    return await signAndSubmitTx(tx, pactClient);
  } catch (error) {
    console.error(error);
  }
}

export const transferCoinTreasury = async (token, code, chain, pubKey, sender) => {
  try {
    const pactClient = createClient(`${api}/chainweb/0.0/${network}/chain/${chain}/pact`);
    const { account } = useWalletStore.getState();

    const tx = createTx(code, chain, {
      pubKey,
      account,
      sender,
      gasLimit: 1000,
      signers: [
        [`${token}-treasury.OPERATE-TREASURY`],
        ['coin.GAS']
      ]
    });

    return await signAndSubmitTx(tx, pactClient);
  } catch (error) {
    console.error(error);
  }
};

export const initLiquidityTreasury = async (token, code, chain, pubKey, sender) => {
  try {
    const pactClient = createClient(`${api}/chainweb/0.0/${network}/chain/${chain}/pact`);
    const { account } = useWalletStore.getState();

    const tx = createTx(code, chain, {
      pubKey,
      account,
      sender,
      gasLimit: 10000,
      signers: [
        [`${token}-treasury.INIT`],
        ['coin.GAS']
      ]
    });

    return await signAndSubmitTx(tx, pactClient);
  } catch (error) {
    console.error(error);
  }
};

// Poll for transaction result
export const pollForTransactionResult = async (pactClient, transactionDescriptor, maxRetries = 30, retryInterval = 3000) => {
  console.log('Polling for transaction result:', transactionDescriptor.requestKey);
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log(`Poll attempt ${i + 1}/${maxRetries} for transaction:`, transactionDescriptor.requestKey);
      
      const result = await pactClient.listen({
        requestKey: transactionDescriptor.requestKey
      });
      
      console.log(`Poll attempt ${i + 1} result:`, result);
      
      if (result && result.result) {
        console.log('Transaction confirmed:', result);
        return result;
      }
      
      // Wait before next retry
      console.log(`Waiting ${retryInterval}ms before next poll attempt...`);
      await new Promise(resolve => setTimeout(resolve, retryInterval));
    } catch (error) {
      console.error(`Error polling for transaction result (attempt ${i + 1}):`, error);
      
      if (i === maxRetries - 1) {
        throw new Error(`Transaction polling failed after ${maxRetries} attempts: ${error.message}`);
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, retryInterval));
    }
  }
  
  throw new Error(`Transaction did not complete after ${maxRetries} attempts`);
};

// Check transaction status by request key
export const checkTransactionStatus = async (requestKey, chainId = '1') => {
  try {
    const pactClient = createClient(`${api}/chainweb/0.0/${network}/chain/${chainId}/pact`);
    
    console.log(`Checking status for transaction: ${requestKey} on chain ${chainId}`);
    
    const result = await pactClient.listen({
      requestKey: requestKey
    });
    
    console.log(`Status check result for ${requestKey}:`, result);
    
    if (result && result.result) {
      return {
        found: true,
        status: result.result.status,
        result: result
      };
    }
    
    return {
      found: false,
      status: 'pending',
      result: null
    };
  } catch (error) {
    console.error(`Error checking transaction status for ${requestKey}:`, error);
    // If the transaction is not found, it might still be pending
    if (error.message && error.message.includes('not found')) {
      return {
        found: false,
        status: 'pending',
        result: null
      };
    }
    
    // For other errors, we'll consider it as still pending
    return {
      found: false,
      status: 'pending',
      result: null,
      error: error.message
    };
  }
};

// Staking-specific Pact calls
export const pactCallsStakeTokens = async(code, chain, stakingNamespace, tokenModule, amount, lockerAccount) => {
  try {
    const { account, pubKey } = useWalletStore.getState();
    const pactClient = createClient(`${api}/chainweb/0.0/${network}/chain/${chain}/pact`);

    const tx = createTx(code, chain, {
      pubKey,
      account,
      sender: account,
      signers: [
        [`${stakingNamespace}.${tokenModule}.TRANSFER`, account, lockerAccount, Number(amount)],
        ['coin.GAS']
      ]
    });

    return await signAndSubmitTx(tx, pactClient);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export const pactCallsUnstakeTokens = async(code, chain, stakingNamespace, stakingModule, tokenModule, account, lockerAccount, amount) => {
  try {
    const { account: userAccount, pubKey } = useWalletStore.getState();
    const pactClient = createClient(`${api}/chainweb/0.0/${network}/chain/${chain}/pact`);

    // Determine burn account based on network
    const burnAccount = network === "mainnet01" 
      ? "user.burn.BURN-ACCOUNT" 
      : "n_e309f0fa7cf3a13f93a8da5325cdad32790d2070.burn.BURN-ACCOUNT";

    const tx = createTx(code, chain, {
      pubKey,
      account: userAccount,
      sender: userAccount,
      signers: [
        [`${stakingNamespace}.${stakingModule}.VERIFY-LOCKER`, account],
        [`${stakingNamespace}.${tokenModule}.TRANSFER`, lockerAccount, account, Number(amount)],
        [`${stakingNamespace}.${tokenModule}.TRANSFER`, lockerAccount, burnAccount, Number(amount)],
        ['coin.GAS']
      ]
    });

    return await signAndSubmitTx(tx, pactClient);
  } catch (error) {
    console.error(error);
    throw error;
  }
}