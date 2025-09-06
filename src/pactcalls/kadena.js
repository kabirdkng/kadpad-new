import { Pact, createClient } from '@kadena/client';
import config from '../wallet/config';
import useWalletStore from "../wallet/walletStore";
import providers from "../wallet/providers/providers";
import { toast } from "react-toastify";

const network = config.networkId;
const api = config.apiUrl;

export const pactCallsSig = async(code, chain) => {
  try  {
    const { account, pubKey } = useWalletStore.getState()
    const pactClient = createClient(`${api}/chainweb/0.0/${network}/chain/${chain}/pact`)
    const providerName = useWalletStore.getState().provider;
    const provider = providers[providerName]
    
    if (providerName === null) {
      throw new Error("Provider not found");
    }

    let txBuilder = Pact.builder
      .execution(code)
      .addSigner(pubKey, (signFor) => [
        signFor(`coin.GAS`)
      ])
      .setMeta({
        chainId: String(chain),
        gasLimit: 80000,
        gasPrice: 0.0000001,
        sender: account
      })
      .setNetworkId(network);

    if (providerName === 'magic') {
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
    } else {
      txBuilder = txBuilder.addKeyset('ks', 'keys-all', pubKey);
    }

    const tx = txBuilder.createTransaction()

    let signedTx;
    let cmd, sigs, outcomeHash;
    console.log(provider.config)
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
      console.error(error);
    }

    const bodyPayload = {
      cmd,
      sigs,
      hash: outcomeHash,
    };

    const preflightResult = await pactClient.dirtyRead(bodyPayload);
    console.log(preflightResult)
    if (preflightResult.result.status === 'failure') {
      console.error(preflightResult.result.error.message);
      toast.error(preflightResult.result.error.message)
      return preflightResult;
    } else {
      const transactionDescriptor = await pactClient.submit(bodyPayload);
      console.log('TX Key: ', transactionDescriptor.requestKey);
      return { pactClient, transactionDescriptor, preflightResult };
    }
  } catch (error) {
    console.error(error);
  }
}

export const pactCallsSales = async(code, chain, namespace, moduleName) => {
  try  {
    const { account, pubKey } = useWalletStore.getState()
    const pactClient = createClient(`${api}/chainweb/0.0/${network}/chain/${chain}/pact`)
    const providerName = useWalletStore.getState().provider;
    const provider = providers[providerName]
    
    if (providerName === null) {
      throw new Error("Provider not found");
    }

    let txBuilder = Pact.builder
      .execution(code)
      .addSigner(pubKey, (signFor) => [
        signFor(`${namespace}.${moduleName}-sales.SALES-OPERATOR`),
        signFor(`coin.GAS`)
      ])
      .setMeta({
        chainId: String(chain),
        gasLimit: 80000,
        gasPrice: 0.0000001,
        sender: account
      })
      .setNetworkId(network);

    if (providerName === 'magic') {
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
    } else {
      txBuilder = txBuilder.addKeyset('ks', 'keys-all', pubKey);
    }

    const tx = txBuilder.createTransaction()

    let signedTx;
    let cmd, sigs, outcomeHash;
    console.log(provider.config)
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
      console.error(error);
    }

    const bodyPayload = {
      cmd,
      sigs,
      hash: outcomeHash,
    };

    const preflightResult = await pactClient.dirtyRead(bodyPayload);
    console.log(preflightResult)
    if (preflightResult.result.status === 'failure') {
      console.error(preflightResult.result.error.message);
      toast.error(preflightResult.result.error.message)
      return preflightResult;
    } else {
      const transactionDescriptor = await pactClient.submit(bodyPayload);
      console.log('TX Key: ', transactionDescriptor.requestKey);
      return { pactClient, transactionDescriptor, preflightResult };
    }
  } catch (error) {
    console.error(error);
  }
}

export const pactCalls = async(code, chain, pubKey) => {
  const pactClient = createClient(`${api}/chainweb/0.0/${network}/chain/${chain}/pact`)
  const { account } = useWalletStore.getState()
  const providerName = useWalletStore.getState().provider;
  
  let txBuilder = Pact.builder
    .execution(code)
    .setMeta({
      chainId: String(chain),
      gasLimit: 80000,
      gasPrice: 0.0000001,
    })
    .setNetworkId(network);

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
  } else {
    txBuilder = txBuilder.addKeyset('ks', 'keys-all', pubKey);
  }

  const tx = txBuilder.createTransaction()     

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
  
  const tx = Pact.builder
    .execution(code)
    .setMeta({
      chainId: String(chain),
      gasLimit: 1000,
      gasPrice: 0.0000001,
    })
    .setNetworkId(network)
    .createTransaction();
             
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
    const pactClient = createClient(`${api}/chainweb/0.0/${network}/chain/${chain}/pact`)
    const providerName = useWalletStore.getState().provider;
    const provider = providers[providerName]
    console.log(provider)
    
    if (providerName === null) {
      throw new Error("Provider not found");
    }

    const receiver = salesAccount
    console.log(receiver)
    console.log(amount)

    // let signer;
    // if (providerName === 'magic') {
    //   signer = { pubKey: pubKey, scheme: 'WebAuthn' };
    // } else {
    //   signer = pubKey;
    // }

    let txBuilder = Pact.builder
      .execution(code)
      .addSigner(pubKey, (signFor) => [
      signFor(`coin.TRANSFER`, account, receiver, Number(amount)),
      signFor('coin.GAS')
      ])
      .setMeta({
      chainId: String(chain),
      gasLimit: 80000,
      gasPrice: 0.0000001,
      sender: account
      })
      .setNetworkId(network);

    if (providerName === 'magic') {
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
    } else {
      txBuilder = txBuilder.addKeyset('ks', 'keys-all', pubKey);
    }

    // if (providerName !== 'magic') {
    //   txBuilder = txBuilder.addKeyset('ks', 'keys-all', pubKey);
    // }

    const tx = txBuilder.createTransaction();

    console.log("transaction", tx)
    
    let signedTx;  
    let cmd, sigs, outcomeHash;
    console.log(provider.config)
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
      console.error(error);
    }

    console.log("Signed Tx: ", signedTx)

    const bodyPayload = {
      cmd,
      sigs,
      hash: outcomeHash,
    };

    const preflightResult = await pactClient.dirtyRead(bodyPayload);
    console.log(preflightResult)
    if (preflightResult.result.status === 'failure') {
      console.error(preflightResult.result.error.message);
      toast.error(preflightResult.result.error.message)
      return preflightResult;
    } else {
      const transactionDescriptor = await pactClient.submit(bodyPayload);
      console.log('TX Key: ', transactionDescriptor.requestKey);
      return { pactClient, transactionDescriptor, preflightResult };
    }
  } catch (error) {
    console.error(error);
  }
}

export const transferCoinTreasury = async (token, code, chain, pubKey, sender) => {
  try {
    const pactClient = createClient(`${api}/chainweb/0.0/${network}/chain/${chain}/pact`);
    const { account } = useWalletStore.getState()
    const providerName = useWalletStore.getState().provider;
    const provider = providers[providerName]
    console.log(provider)
    
    if (providerName === null) {
      throw new Error("Provider not found");
    }

    let txBuilder = Pact.builder
      .execution(code)
      .addSigner(pubKey, (signFor) => [
        signFor(`${token}-treasury.OPERATE-TREASURY`),
        signFor('coin.GAS'),
      ])
      .setMeta({
        chainId: String(chain),
        gasLimit: 1000,
        gasPrice: 0.0000001,
        sender: sender
      })
      .setNetworkId(network);

    if (providerName === 'magic') {
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
    } else {
      txBuilder = txBuilder.addKeyset('ks', 'keys-all', pubKey);
    }

    const tx = txBuilder.createTransaction();

    let signedTx;
    let cmd, sigs, outcomeHash;
    console.log(provider.config)
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
      console.error(error);
    }

    const bodyPayload = {
      cmd,
      sigs,
      hash: outcomeHash,
    };

    const preflightResult = await pactClient.dirtyRead(bodyPayload);
    console.log(preflightResult)
    if (preflightResult.result.status === 'failure') {
      console.error(preflightResult.result.error.message);
      toast.error(preflightResult.result.error.message)
      return preflightResult;
    } else {
      const transactionDescriptor = await pactClient.submit(bodyPayload);
      console.log('TX Key: ', transactionDescriptor.requestKey);
      return { pactClient, transactionDescriptor, preflightResult };
    }
  } catch (error) {
    console.error(error);
  }
};

export const initLiquidityTreasury = async (token, code, chain, pubKey, sender) => {
  try {
    const pactClient = createClient(`${api}/chainweb/0.0/${network}/chain/${chain}/pact`);
    const { account } = useWalletStore.getState()
    const providerName = useWalletStore.getState().provider;
    const provider = providers[providerName]
    console.log(provider)
    
    if (providerName === null) {
      throw new Error("Provider not found");
    }

    let txBuilder = Pact.builder
      .execution(code)
      .addSigner(pubKey, (signFor) => [
        signFor(`${token}-treasury.INIT`),
        signFor('coin.GAS'),
      ])
      .setMeta({
        chainId: String(chain),
        gasLimit: 10000,
        gasPrice: 0.0000001,
        sender: sender
      })
      .setNetworkId(network);

    if (providerName === 'magic') {
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
    } else {
      txBuilder = txBuilder.addKeyset('ks', 'keys-all', pubKey);
    }

    const tx = txBuilder.createTransaction();

    let signedTx;
    let cmd, sigs, outcomeHash;
    console.log(provider.config)
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
      console.error(error);
    }

    const bodyPayload = {
      cmd,
      sigs,
      hash: outcomeHash,
    };

    const preflightResult = await pactClient.dirtyRead(bodyPayload);
    console.log(preflightResult)
    if (preflightResult.result.status === 'failure') {
      console.error(preflightResult.result.error.message);
      toast.error(preflightResult.result.error.message)
      return preflightResult;
    } else {
      const transactionDescriptor = await pactClient.submit(bodyPayload);
      console.log('TX Key: ', transactionDescriptor.requestKey);
      return { pactClient, transactionDescriptor, preflightResult };
    }
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

// Staking-specific Pact calls
export const pactCallsStakeTokens = async(code, chain, stakingNamespace, tokenModule, amount, lockerAccount) => {
  try {
    const { account, pubKey } = useWalletStore.getState();
    const pactClient = createClient(`${api}/chainweb/0.0/${network}/chain/${chain}/pact`)
    const providerName = useWalletStore.getState().provider;
    const provider = providers[providerName]
    
    if (providerName === null) {
      throw new Error("Provider not found");
    }

    let txBuilder = Pact.builder
      .execution(code)
      .addSigner(pubKey, (signFor) => [
        signFor(`${stakingNamespace}.${tokenModule}.TRANSFER`, account, lockerAccount, Number(amount)),
        signFor('coin.GAS')
      ])
      .setMeta({
        chainId: String(chain),
        gasLimit: 80000,
        gasPrice: 0.0000001,
        sender: account
      })
      .setNetworkId(network);

    if (providerName === 'magic') {
      const accountParts = account.split(':')[1].split('.');
      const namespace = accountParts[0];
      const keysetName = accountParts[1];
      
      txBuilder = txBuilder.addKeyset('ks', {
        keysetref: {
          ns: namespace,
          ksn: keysetName
        }
      });
    } else {
      txBuilder = txBuilder.addKeyset('ks', 'keys-all', pubKey);
    }

    const tx = txBuilder.createTransaction()

    let signedTx;
    let cmd, sigs, outcomeHash;
    
    try {
      signedTx = await provider.quickSign(tx);
      if(signedTx.status === 'fail'){
        console.log(signedTx)
        toast.error(`Error :${signedTx.message}`, { position: 'top-center' })
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
    if (preflightResult.result.status === 'failure') {
      console.error(preflightResult.result.error.message);
      toast.error(preflightResult.result.error.message)
      return preflightResult;
    } else {
      const transactionDescriptor = await pactClient.submit(bodyPayload);
      console.log('TX Key: ', transactionDescriptor.requestKey);
      return { pactClient, transactionDescriptor, preflightResult };
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export const pactCallsUnstakeTokens = async(code, chain, stakingNamespace, stakingModule, tokenModule, account, lockerAccount, amount) => {
  try {
    const { account: userAccount, pubKey } = useWalletStore.getState();
    const pactClient = createClient(`${api}/chainweb/0.0/${network}/chain/${chain}/pact`)
    const providerName = useWalletStore.getState().provider;
    const provider = providers[providerName]
    
    if (providerName === null) {
      throw new Error("Provider not found");
    }

    // Determine burn account based on network
    const burnAccount = network === "mainnet01" 
      ? "user.burn.BURN-ACCOUNT" 
      : "n_e309f0fa7cf3a13f93a8da5325cdad32790d2070.burn.BURN-ACCOUNT";

    let txBuilder = Pact.builder
      .execution(code)
      .addSigner(pubKey, (signFor) => [
        signFor(`${stakingNamespace}.${stakingModule}.VERIFY-LOCKER`, account),
        signFor(`${stakingNamespace}.${tokenModule}.TRANSFER`, lockerAccount, account, Number(amount)),
        signFor(`${stakingNamespace}.${tokenModule}.TRANSFER`, lockerAccount, burnAccount, Number(amount)),
        signFor('coin.GAS')
      ])
      .setMeta({
        chainId: String(chain),
        gasLimit: 80000,
        gasPrice: 0.0000001,
        sender: userAccount
      })
      .setNetworkId(network);

    if (providerName === 'magic') {
      const accountParts = userAccount.split(':')[1].split('.');
      const namespace = accountParts[0];
      const keysetName = accountParts[1];
      
      txBuilder = txBuilder.addKeyset('ks', {
        keysetref: {
          ns: namespace,
          ksn: keysetName
        }
      });
    } else {
      txBuilder = txBuilder.addKeyset('ks', 'keys-all', pubKey);
    }

    const tx = txBuilder.createTransaction()

    let signedTx;
    let cmd, sigs, outcomeHash;
    
    try {
      signedTx = await provider.quickSign(tx);
      if(signedTx.status === 'fail'){
        console.log(signedTx)
        toast.error(`Error :${signedTx.message}`, { position: 'top-center' })
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
    if (preflightResult.result.status === 'failure') {
      console.error(preflightResult.result.error.message);
      toast.error(preflightResult.result.error.message)
      return preflightResult;
    } else {
      const transactionDescriptor = await pactClient.submit(bodyPayload);
      console.log('TX Key: ', transactionDescriptor.requestKey);
      return { pactClient, transactionDescriptor, preflightResult };
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
}