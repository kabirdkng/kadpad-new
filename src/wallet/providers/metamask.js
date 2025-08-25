import config from '../config';

export const METAMASK = 'METAMASK';

const metamask = {
  name: 'MetaMask Snap',
  connect: async function() {
    try {
      // Use the useKadenaWallet hook through dynamic import to avoid circular deps
      const { useKadenaWallet } = await import('@kadena/wallet-adapter-react');
      
      // We need to get the client instance
      // This will be handled through the wallet store which has access to the client
      
      // Return a placeholder for now - the actual connection will be handled
      // by the wallet store using the adapter system
      return {
        status: "success",
        account: {
          account: "metamask-placeholder",
          publicKey: "metamask-placeholder"
        }
      };
    } catch (error) {
      console.error("MetaMask connection error:", error);
      return {
        status: "error",
        message: error.message || "Failed to connect to MetaMask Snap"
      };
    }
  },
  
  disconnect: async function() {
    try {
      return { status: "success" };
    } catch (error) {
      console.error("MetaMask disconnect error:", error);
      return {
        status: "error",
        message: error.message
      };
    }
  },
  
  sign: async function(signingCommand) {
    try {
      const { detectSnapProvider, SnapAdapter } = await import('@kadena/wallet-adapter-metamask-snap');
      const provider = await detectSnapProvider({ silent: true });
      
      if (!provider) {
        throw new Error("MetaMask Snap not available");
      }

      const adapter = new SnapAdapter({ provider });

      // Parse the 'cmd' field to an object
      const cmdParsed = JSON.parse(signingCommand.cmd);
 
      const caps = cmdParsed.signers[0].clist.map(cap => ({
        role: "", 
        description: "", 
        cap: {
          name: cap.name,
          args: cap.args || [] 
        },
      }));

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

      // Use the adapter's sign method
      const response = await adapter.sign(signingCmd);
      return response;
    } catch (error) {
      console.error("Error in MetaMask sign function:", error);
      return null;
    }
  },
  
  quickSign: async function(signingCommand) {
    try {
      const { detectSnapProvider, SnapAdapter } = await import('@kadena/wallet-adapter-metamask-snap');
      const provider = await detectSnapProvider({ silent: true });
      
      if (!provider) {
        throw new Error("MetaMask Snap not available");
      }

      const adapter = new SnapAdapter({ provider });

      const commandObj = JSON.parse(signingCommand.cmd);
      const signers = commandObj.payload.exec.data.ks.keys.map(pubKey => {
        return {
          pubKey: pubKey,
          sig: null, // Initial signature is null
          clist: commandObj.signers[0].clist, 
        };
      });

      const commandSigData = {
        cmd: JSON.stringify(commandObj),
        sigs: signers,
      };

      // Use the adapter's quickSign method
      const cmd = await adapter.quickSign([commandSigData]);
      return cmd;
    } catch (error) { 
      console.error("Error in MetaMask quickSign function:", error);
      return null;
    }
  },
  
  quickSignAll: async function(signingCommands) {
    try {
      const { detectSnapProvider, SnapAdapter } = await import('@kadena/wallet-adapter-metamask-snap');
      const provider = await detectSnapProvider({ silent: true });
      
      if (!provider) {
        throw new Error("MetaMask Snap not available");
      }

      const adapter = new SnapAdapter({ provider });

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

      // Use the adapter's quickSign method for multiple commands
      const signedCmds = await adapter.quickSign(commandSigDatas);
      return signedCmds;
    } catch (error) {
      console.error("Error in MetaMask quickSignAll function:", error);
      throw error;
    }
  },
  
  quickSignCont: async function(signingCommand) {
    try {
      const { detectSnapProvider, SnapAdapter } = await import('@kadena/wallet-adapter-metamask-snap');
      const provider = await detectSnapProvider({ silent: true });
      
      if (!provider) {
        throw new Error("MetaMask Snap not available");
      }

      const adapter = new SnapAdapter({ provider });

      const commandObj = JSON.parse(signingCommand.cmd);
      const signers = commandObj.payload.cont.data.ks.keys.map(pubKey => {
        return {
          pubKey: pubKey,
          sig: null, // Initial signature is null
          clist: commandObj.signers[0].clist, 
        };
      });

      const commandSigData = {
        cmd: JSON.stringify(commandObj),
        sigs: signers,
      };

      // Use the adapter's quickSign method
      const cmd = await adapter.quickSign([commandSigData]);
      return cmd;
    } catch (error) { 
      console.error("Error in MetaMask quickSignCont function:", error);
      return null;
    }
  }
};

export default metamask;
