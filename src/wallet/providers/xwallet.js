import config from '../config';

export const formatCapability = (cap) => {
  return {
    role: "", 
    description: "", 
    cap: {
      name: cap.name,
      args: cap.args || [] 
    },
  };
};

export const X_WALLET = 'X_WALLET';
const networkId = config.networkId;
const xwallet = {
  name: 'X Wallet',
  connect: async function() {
    let accountResult = await window.kadena.request({
      method: "kda_connect",
      networkId: networkId,
    });
    return accountResult;
  },
  disconnect: async function() {
    return await window.kadena.request({
      method: "kda_disconnect",
      networkId: networkId,
    });
  },
  sign: async function(signingCommand) {

    // Parse the 'cmd' field to an object
    const cmdParsed = JSON.parse(signingCommand.cmd);
 
    const caps = cmdParsed.signers[0].clist.map(formatCapability);

    const signingCmd = {
      pactCode: cmdParsed.payload.exec.code, 
      envData: {},
      sender: cmdParsed.meta.sender,     
      chainId: cmdParsed.meta.chainId,
      gasLimit: cmdParsed.meta.gasLimit,
      gasPrice: cmdParsed.meta.gasPrice,
      signingPubKey: cmdParsed.signers[0].pubKey,
      ttl: cmdParsed.meta.ttl,
      caps: caps
  };

    let networkId = config.networkId;
    let req = {
      method: "kda_requestSign",
      networkId: networkId,
      data: {
          networkId: networkId,
          signingCmd: signingCmd
      }
    }

    try {
        var response = await window.kadena.request(req);
        return response;
    } catch (error) { 
        console.error("Error in sign function:", error);
        return null; 
    }
},
quickSign: async function(signingCommand) {

  let networkId = config.networkId;
  const commandObj = JSON.parse(signingCommand.cmd);
  const signers = commandObj.payload.exec.data.ks.keys.map(pubKey => {
    return {
      pubKey: pubKey,
      sig: null, // Initial signature is null
      clist: commandObj.signers[0].clist, 
    };
  });
  const req = {
    method: "kda_requestQuickSign",
    networkId: networkId,
    data: {
      networkId: networkId,
      commandSigDatas: [{
        cmd: JSON.stringify(commandObj),
        sigs: signers,
      }]
    }
  };

  try {
    const cmd = await window.kadena.request(req);
    return cmd;
  } catch (error) { 
    console.error("Error in quickSign function:", error);
  }
},
quickSignAll: async function(signingCommands) {
  let networkId = config.networkId;

  const commandSigDatas = signingCommands.map(command => {
    const commandObj = JSON.parse(command.cmd);
    const signers = commandObj.payload.exec.data.ks.keys.map(pubKey => {
      return {
        pubKey: pubKey,
        sig: null, 
        clist: commandObj.signers[0].clist,
      };
    });

    return {
      cmd: JSON.stringify(commandObj),
      sigs: signers,
    };
  });

  const req = {
    method: "kda_requestQuickSign",
    networkId: networkId,
    data: {
      networkId: networkId,
      commandSigDatas: commandSigDatas
    }
  };

  try {
    const signedCmds = await window.kadena.request(req);
    return signedCmds;
  } catch (error) {
    console.error("Error in quickSignAll function:", error);
    throw error;
  }
},
quickSignCont: async function(signingCommand) {
  let networkId = config.networkId;
  const commandObj = JSON.parse(signingCommand.cmd);
  const signers = commandObj.payload.cont.data.ks.keys.map(pubKey => {
    return {
      pubKey: pubKey,
      sig: null, // Initial signature is null
      clist: commandObj.signers[0].clist, 
    };
  });
  const req = {
    method: "kda_requestQuickSign",
    networkId: networkId,
    data: {
      networkId: networkId,
      commandSigDatas: [{
        cmd: JSON.stringify(commandObj),
        sigs: signers,
      }]
    }
  };

  try {
    const cmd = await window.kadena.request(req);
    return cmd;
  } catch (error) { 
    console.error("Error in quickSign function:", error);
  }
}

}
export default xwallet;
