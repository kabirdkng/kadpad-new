import config from '../config'

export const KOALA = 'KOALA';
const networkId = config.networkId;
const koala = {
  name: 'Koala',
  connect: async function() {
    let accountResult = await window.koala.request({
      method: "kda_connect",
      networkId: networkId,
    });
    console.log("accountResult", accountResult);
    return accountResult;
  },
  disconnect: async function() {
    return await window.koala.request({
      method: "kda_disconnect",
      networkId: networkId,
    });
  },
  sign: async function(signingCommand) {
    // console.log("signingCommand did we?", );
    let networkId = config.networkId;
    let req = {
      method: "kda_requestSign",
      networkId: networkId,
      data: {
          networkId: networkId,
          signingCmd: JSON.stringify(signingCommand)
      }
    }
    // console.log("req", req)
    var cmd = await window.koala.request(req);
    // console.log("cmd inside try-catch:", cmd);

    return cmd.signedCmd;
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
  
    // console.log("Final request being sent:", req);
    try {
      const cmd = await window.kadena.request(req);
      // console.log("cmd response", cmd);
      return cmd;
    } catch (error) { 
      console.error("Error in quickSign function:", error);
    }
  }
}
export default koala;