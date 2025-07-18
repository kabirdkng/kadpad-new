import { Pact, readKeyset, createClient } from "@kadena/client";
import useWalletStore from "./walletStore";
import providers from "./providers/providers";
import { toast } from "react-toastify";
import config from "./config";

const network = config.networkId;
const api = config.apiUrl;


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
        } catch {
            console.error('Error in pact Call:', error)
            return null;
            }
}

export const pactCallsSig = async(code, chain, client, session) => {
  try {
    const { account, pubKey } = useWalletStore.getState();
    const pactClient = createClient(`${api}/chainweb/0.0/${network}/chain/${chain}/pact`);
    const providerName = useWalletStore.getState().provider;
    const provider = providers[providerName];
    
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
      .createTransaction();

    let signedTx;
    let cmd, sigs, outcomeHash;
    console.log(provider.config);

    if (providerName === 'SPIREKEY') {
      const serializedTransaction = btoa(JSON.stringify(tx));
      const returnUrl = window.location.href;
      window.location.href = `${config.spireKeyUrl}/sign?transaction=${encodeURIComponent(serializedTransaction)}&returnUrl=${encodeURIComponent(returnUrl)}`;
      return;
    } else {
      try {
        signedTx = await provider.quickSign(tx, client, session);
        if (signedTx.status === 'fail') {
          console.log(signedTx);
          toast.error(`Error: ${signedTx.message}`, { position: 'top-center' });
          return;
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
        toast.error(`Error during signing: ${error.message}`, { position: 'top-center' });
        return;
      }
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
      toast.error(preflightResult.result.error.message, { position: 'top-center' });
      return preflightResult;
    } else {
      const transactionDescriptor = await pactClient.submit(bodyPayload);
      console.log('TX Key: ', transactionDescriptor.requestKey);
      toast.success(`Transaction submitted. TX Key: ${transactionDescriptor.requestKey}`, { position: 'top-center' });
      return { pactClient, transactionDescriptor, preflightResult };
    }
  } catch (error) {
    console.error(error);
    toast.error(`Unexpected error: ${error.message}`, { position: 'top-center' });
  }
};

export const register = async (name, amount, wallets, chain, client, session) => {
  const jsclient = createClient(
    `${config.apiUrl}/chainweb/0.0/${config.networkId}/chain/${chain}/pact`
  );
  const NETWORK_ID = `${config.networkId}`;
  const { account, pubKey } = useWalletStore.getState();
  const gpayer = "u:n_eef68e581f767dd66c4d4c39ed922be944ede505.gas-station.enforce-guard-any:dorjIaX8IGJZtfgZzYRkXV0DE9mEPxPvyuwdmML5eTk";
  const providerName = useWalletStore.getState().provider;
  let provider = providers[providerName];

  if (providerName === null) {
    throw new Error("Provider not found");
  }

  const escrow = await getEscrow(name, account, chain);
  const senderAccount = account;
  const fee = { decimal: `${amount}` };
  const signerKey = pubKey;

  let transaction;

  if (providerName === 'SPIREKEY') {
    transaction = Pact.builder
      .execution(
        Pact.modules[config.contract]["register"](
          name,
          account,
          readKeyset("ks"),
          wallets
        ),
        Pact.modules["coin"]["details"](account)
      )
      .addSigner(
        {
          pubKey: signerKey,
          scheme: 'WebAuthn',
        },
        (signFor) => [
          // signFor('coin.GAS'),
          signFor(`${config.contract}.GAS_PAYER`, account, { int: 1 }, 1),
          signFor(`${config.contract}.ENFORCE-CREATOR`),
          signFor("coin.TRANSFER", account, escrow, fee),
        ]
      )
      .addKeyset("ks", "keys-all", signerKey)
      .setMeta({
        chainId: String(chain),
        gasLimit: 4000,
        gasPrice: 1.0e-6,
        senderAccount: gpayer,
        ttl: 10 * 60, // 10 minutes
      })
      .setNetworkId(NETWORK_ID)
      .createTransaction();
  } else {
    transaction = Pact.builder
      .execution(
        Pact.modules[config.contract]["register"](
          name,
          account,
          readKeyset("ks"),
          wallets
        ),
        Pact.modules["coin"]["details"](account)
      )
      .addSigner(signerKey, (signFor) => [
        signFor("coin.GAS"),
        signFor("coin.TRANSFER", account, escrow, fee),
        signFor(`${config.contract}.ENFORCE-CREATOR`),
      ])
      .addKeyset("ks", "keys-all", signerKey)
      .setMeta({
        chainId: String(chain),
        gasLimit: 4000,
        gasPrice: 1.0e-6,
        sender: senderAccount,
        ttl: 10 * 60, // 10 minutes
      })
      .setNetworkId(NETWORK_ID)
      .createTransaction();
  }

  let signedTx;
  let cmd, sigs, outcomeHash;
  console.log("transaction", transaction);
  console.log("provider", provider);

  try {
    if (providerName === 'SPIREKEY') {
      const serializedTransaction = btoa(JSON.stringify(transaction));
      const returnUrl = window.location.href;
      window.location.href = `${config.spireKeyUrl}/sign?transaction=${encodeURIComponent(serializedTransaction)}&returnUrl=${encodeURIComponent(returnUrl)}`;
      return;
    } else {
      signedTx = await provider.quickSign(transaction, client, session);
    }

    if (provider.name === "wc") {
      cmd = signedTx.cmd;
      sigs = signedTx.sigs;
      outcomeHash = signedTx.hash;
    } else {
      let commandSigData = signedTx.responses[0].commandSigData;
      cmd = commandSigData.cmd;
      sigs = commandSigData.sigs;
      outcomeHash = signedTx.responses[0].outcome.hash;
    }

    const bodyPayload = {
      cmd,
      sigs,
      hash: outcomeHash,
    };

    const preflightResult = await jsclient.preflight(bodyPayload);
    if (preflightResult.result.status === "failure") {
      console.error(preflightResult.result.status);
      toast(preflightResult.result.status);
      toast(preflightResult.result.error.message);
      throw new Error("failure");
    } else {
      const transactionDescriptor = await jsclient.submit(bodyPayload);
      toast("TX Key: " + transactionDescriptor.requestKey);
      const result = await jsclient.listen(transactionDescriptor);
      return result;
    }
  } catch (error) {
    console.error(error);
  }
};

// export const continuation = async (fromChain, toChain, requestKey) => {
//   const jsclient = createClient(
//     `${config.apiUrl}/chainweb/0.0/${config.networkId}/chain/${toChain}/pact`
//   );
//   const NETWORK_ID = `${config.networkId}`;
//   const { account, pubKey } = useWalletStore.getState();
//   const providerName = useWalletStore.getState().provider;
//   console.log("providerName", pubKey);
//   let provider = providers[providerName];

//   if (providerName === null) {
//     throw new Error("Provider not found");
//   }

//   const gpayer = "u:n_eef68e581f767dd66c4d4c39ed922be944ede505.gas-station.enforce-guard-any:dorjIaX8IGJZtfgZzYRkXV0DE9mEPxPvyuwdmML5eTk";
//   const senderAccount = account;
//   const signerKey = pubKey;

//   // Call the spv function to get the proof
//   const proof = await spv(requestKey, fromChain, toChain);
//  console.log("proof", proof)
//   const transaction = Pact.builder
//     .continuation({
//       pactId: requestKey,
//       step: 1,
//       rollback: false,
//       data: {},
//       proof: proof,
//     })
//     .addSigner(
//       {
//         pubKey: pubKey,
//         scheme: 'WebAuthn',
//       },
//       (signFor) => [
//         signFor(`n_eef68e581f767dd66c4d4c39ed922be944ede505.gas-station.GAS_PAYER`, gpayer, { int: 1 }, 1),
//       ]
//     )
//     .addKeyset("ks", "keys-all", pubKey)
//     .setMeta({
//       chainId: String(toChain),
//       gasLimit: 2500,
//       gasPrice: 0.0000001,
//       sender: gpayer,
//       ttl: 100 * 600, // 100 minutes
//     })
//     .setNetworkId(NETWORK_ID)
//     .createTransaction();

//   let signedTx;
//   let cmd, sigs, outcomeHash;
//   console.log("transaction", transaction);

//   try {
//     if (providerName === 'SPIREKEY') {
//       const serializedTransaction = btoa(JSON.stringify(transaction));
//       const returnUrl = window.location.href;
//       window.location.href = `${config.spireKeyUrl}/sign?transaction=${encodeURIComponent(serializedTransaction)}&returnUrl=${encodeURIComponent(returnUrl)}`;
//       return;
//     } else {
//       signedTx = await provider.quickSignCont(transaction);
//       console.log('Signed transaction:', JSON.stringify(signedTx));
//     }
//   } catch (error) {
//     console.error('Error signing transaction:', error);
//     return;
//   }

//   let commandSigData = signedTx.responses[0].commandSigData;
//   cmd = commandSigData.cmd;
//   sigs = commandSigData.sigs;
//   outcomeHash = signedTx.responses[0].outcome.hash;

//   const bodyPayload = {
//     cmd,
//     sigs,
//     hash: outcomeHash,
//   };

//   const preflightResult = await jsclient.preflight(bodyPayload);
//   console.log(preflightResult);

//   if (preflightResult.result.status === "failure") {
//     console.error(preflightResult.result.status);
//     throw new Error("failure");
//   }

//   console.log("preflight successful");
// };

// async function spv(requestKey, fromChain, toChain) {
//   console.log("spv function", requestKey, fromChain, toChain)
//   const proofClient = createClient(
//     `${config.apiUrl}/chainweb/0.0/${config.networkId}/chain/${fromChain}/pact`
//   );
//   const proof = await proofClient.pollCreateSpv(
//     {
//       requestKey: requestKey,
//       networkId: 'testnet04',
//       chainId: fromChain,
//     },
//     toChain
//   );
//   console.log("proof", proof)
//   return proof;
// }

export const continuation = async (fromChain, toChain, requestKey) => {
  const jsclient = createClient(
    `${config.apiUrl}/chainweb/0.0/${config.networkId}/chain/${toChain}/pact`
  );
  const NETWORK_ID = `${config.networkId}`;
  const { account, pubKey } = useWalletStore.getState();
  const providerName = useWalletStore.getState().provider;
  console.log("providerName", pubKey);
  let provider = providers[providerName];

  if (providerName === null) {
    throw new Error("Provider not found");
  }

  const gpayer = "u:n_eef68e581f767dd66c4d4c39ed922be944ede505.gas-station.enforce-guard-any:dorjIaX8IGJZtfgZzYRkXV0DE9mEPxPvyuwdmML5eTk";
  const senderAccount = account;
  const signerKey = pubKey;

  // Call the spv function to get the proof
  const proof = await spv(requestKey, fromChain, toChain);
  console.log("proof", proof);

  // Await the continuation process
  await continuationProcess(proof, pubKey, gpayer, toChain, NETWORK_ID, jsclient, provider, providerName, requestKey);
};

async function continuationProcess(proof, pubKey, gpayer, toChain, NETWORK_ID, jsclient, provider, providerName, requestKey) {
  const transaction = Pact.builder
    .continuation({
      pactId: requestKey,
      step: 1,
      rollback: false,
      data: {},
      proof: proof,
    })
    .addSigner(
      {
        pubKey: pubKey,
        scheme: 'WebAuthn',
      },
      (signFor) => [
        signFor(`n_eef68e581f767dd66c4d4c39ed922be944ede505.gas-station.GAS_PAYER`, gpayer, { int: 1 }, 1),
      ]
    )
    .addKeyset("ks", "keys-all", pubKey)
    .setMeta({
      chainId: String(toChain),
      gasLimit: 2500,
      gasPrice: 0.0000001,
      sender: gpayer,
      ttl: 100 * 600, // 100 minutes
    })
    .setNetworkId(NETWORK_ID)
    .createTransaction();

  let signedTx;
  let cmd, sigs, outcomeHash;
  console.log("transaction", transaction);

  try {
    if (providerName === 'SPIREKEY') {
      const serializedTransaction = btoa(JSON.stringify(transaction));
      const returnUrl = window.location.href;
      window.location.href = `${config.spireKeyUrl}/sign?transaction=${encodeURIComponent(serializedTransaction)}&returnUrl=${encodeURIComponent(returnUrl)}`;
      return;
    } else {
      signedTx = await provider.quickSignCont(transaction);
      console.log('Signed transaction:', JSON.stringify(signedTx));
    }
  } catch (error) {
    console.error('Error signing transaction:', error);
    return;
  }

  let commandSigData = signedTx.responses[0].commandSigData;
  cmd = commandSigData.cmd;
  sigs = commandSigData.sigs;
  outcomeHash = signedTx.responses[0].outcome.hash;

  const bodyPayload = {
    cmd,
    sigs,
    hash: outcomeHash,
  };

  const preflightResult = await jsclient.preflight(bodyPayload);
  console.log(preflightResult);

  if (preflightResult.result.status === "failure") {
    console.error(preflightResult.result.status);
    throw new Error("failure");
  }

  console.log("preflight successful");
}

async function spv(requestKey, fromChain, toChain) {
  console.log("spv function", requestKey, fromChain, toChain);
  const proofClient = createClient(
    `${config.apiUrl}/chainweb/0.0/${config.networkId}/chain/${fromChain}/pact`
  );
  const proof = await proofClient.pollCreateSpv(
    {
      requestKey: requestKey,
      networkId: 'testnet04',
      chainId: fromChain,
    },
    toChain
  );
  console.log("proof", proof);
  return proof;
}