import { Pact, createClient } from '@kadena/client';
import config from '../wallet/config';
import useWalletStore from "../wallet/walletStore";
import providers from "../wallet/providers/providers";
import { toast } from "react-toastify";

const network = config.networkId;
const api = config.apiUrl;

export const pactCallsSig = async(code, chain, client, session) => {
  try  {
    const { account, pubKey } = useWalletStore.getState()
    const pactClient = createClient(`${api}/chainweb/0.0/${network}/chain/${chain}/pact`)
    const providerName = useWalletStore.getState().provider;
    const provider = providers[providerName]
    
    if (providerName === null) {
      throw new Error("Provider not found");
    }
    const tx = Pact.builder
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
      .setNetworkId(network)
      .addKeyset('ks', 'keys-all', pubKey)
      .createTransaction()

    let signedTx;
    let cmd, sigs, outcomeHash;
    console.log(provider.config)
    try {
      signedTx = await provider.quickSign(tx, client, session);
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

export const pactCallsSales = async(code, chain, client, session, namespace, moduleName) => {
  try  {
    const { account, pubKey } = useWalletStore.getState()
    const pactClient = createClient(`${api}/chainweb/0.0/${network}/chain/${chain}/pact`)
    const providerName = useWalletStore.getState().provider;
    const provider = providers[providerName]
    
    if (providerName === null) {
      throw new Error("Provider not found");
    }
    const tx = Pact.builder
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
      .setNetworkId(network)
      .addKeyset('ks', 'keys-all', pubKey)
      .createTransaction()

    let signedTx;
    let cmd, sigs, outcomeHash;
    console.log(provider.config)
    try {
      signedTx = await provider.quickSign(tx, client, session);
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
  
  const tx = Pact.builder
    .execution(code)
    .setMeta({
      chainId: String(chain),
      gasLimit: 80000,
      gasPrice: 0.0000001,
    })
    .setNetworkId(network)
    .addKeyset('ks', 'keys-all', pubKey)
    .createTransaction()     

  try{
    const res = await pactClient.dirtyRead(tx)
    return res;
  } catch (error) {
    console.error('Error in pact Call:', error)
    return null;
  }
}

export const fetchBalance = async(code, chain) => {
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
    return res.result.data;
  } catch (error) {
    console.error('Error fetching account details:', error)
    return null;
  }
}

export const buyTokensSale = async(code, chain, salesAccount, amount, client, session) => {
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
    const tx = Pact.builder
      .execution(code)
      .addSigner(pubKey, (signFor) => [
        signFor(`coin.TRANSFER`, account, receiver, Number(amount)),
        signFor('coin.GAS'),
      ])
      .setMeta({
        chainId: String(chain),
        gasLimit: 80000,
        gasPrice: 0.0000001,
        sender: account
      })
      .addKeyset('ks', 'keys-all', pubKey)
      .setNetworkId(network)
      .createTransaction();
    
    let signedTx;
    let cmd, sigs, outcomeHash;
    console.log(provider.config)
    try {
      signedTx = await provider.quickSign(tx, client, session);
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

export const transferCoinTreasury = async (token, code, chain, pubKey, sender, client, session) => {
  try {
    const pactClient = createClient(`${api}/chainweb/0.0/${network}/chain/${chain}/pact`);
    const providerName = useWalletStore.getState().provider;
    const provider = providers[providerName]
    console.log(provider)
    
    if (providerName === null) {
      throw new Error("Provider not found");
    }
    const tx = Pact.builder
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
      .addKeyset('ks', 'keys-all', pubKey)
      .setNetworkId(network)
      .createTransaction();

    let signedTx;
    let cmd, sigs, outcomeHash;
    console.log(provider.config)
    try {
      signedTx = await provider.quickSign(tx, client, session);
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

export const initLiquidityTreasury = async (token, code, chain, pubKey, sender, client, session) => {
  try {
    const pactClient = createClient(`${api}/chainweb/0.0/${network}/chain/${chain}/pact`);
    const providerName = useWalletStore.getState().provider;
    const provider = providers[providerName]
    console.log(provider)
    
    if (providerName === null) {
      throw new Error("Provider not found");
    }
    const tx = Pact.builder
      .execution(code)
      .addSigner(pubKey, (signFor) => [
        signFor(`${token}-treasury.INIT`),
        signFor('coin.GAS'),
      ])
      .setMeta({
        chainId: String(chain),
        gasLimit: 1000,
        gasPrice: 0.0000001,
        sender: sender
      })
      .addKeyset('ks', 'keys-all', pubKey)
      .setNetworkId(network)
      .createTransaction();

    let signedTx;
    let cmd, sigs, outcomeHash;
    console.log(provider.config)
    try {
      signedTx = await provider.quickSign(tx, client, session);
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