import { connect, sign } from '@kadena/spirekey-sdk';
import config from '../config';

export const SPIREKEY = 'SPIREKEY';

const spirekey = {
  name: 'SpireKey',
  connect: async function() {
    try {
      const account = await connect(config.networkId, config.chainId);
      return {
        status: "success",
        account: {
          account: account.accountName,
          publicKey: account.publicKey,
          chainId: config.chainId,
        },
      };
    } catch (error) {
      console.error("Error connecting to SpireKey:", error);
      return { status: "failure", message: error.message };
    }
  },
  
  quickSign: async function(signingCommand) {
    try {
      console.log("SpireKey quickSign signingCommand:", signingCommand);

      const commandObj = JSON.parse(signingCommand.cmd);
      
      // Format the transaction to match SpireKey SDK expectations
      const tx = {
        code: commandObj.payload.exec.code,
        data: commandObj.payload.exec.data,
        networkId: commandObj.networkId,
        chainId: commandObj.meta.chainId,
        gasLimit: commandObj.meta.gasLimit,
        gasPrice: commandObj.meta.gasPrice,
        sender: commandObj.meta.sender,
        ttl: commandObj.meta.ttl,
      };

      console.log("SpireKey quickSign formatted tx:", tx);

      const accountInfo = {
        accountName: commandObj.meta.sender,
        networkId: commandObj.networkId,
        chainIds: [commandObj.meta.chainId],
        requestedFungibles: [
          {
            fungible: 'coin',
            amount: commandObj.meta.gasLimit * commandObj.meta.gasPrice,
          },
        ],
      };

      console.log("SpireKey quickSign accountInfo:", accountInfo);

      const { transactions, isReady } = await sign([tx], [accountInfo]);

      console.log("SpireKey quickSign sign result:", { transactions, isReady });

      await isReady();

      console.log("SpireKey quickSign isReady completed");

      // Format the response to match our existing structure
      const response = {
        responses: [{
          commandSigData: {
            cmd: JSON.stringify(transactions[0]),
            sigs: transactions[0].sigs,
          },
          outcome: {
            hash: transactions[0].hash,
          },
        }],
      };

      console.log("SpireKey quickSign formatted response:", response);

      return response;
    } catch (error) {
      console.error("Error in SpireKey quickSign function:", error);
      throw error;
    }
  },
  quickSignAll: async function(signingCommands) {
    try {
      const txs = signingCommands.map(command => {
        const commandObj = JSON.parse(command.cmd);
        return {
          code: commandObj.payload.exec.code,
          data: commandObj.payload.exec.data,
          networkId: commandObj.networkId,
          chainId: commandObj.meta.chainId,
          gasLimit: commandObj.meta.gasLimit,
          gasPrice: commandObj.meta.gasPrice,
          sender: commandObj.meta.sender,
          ttl: commandObj.meta.ttl,
        };
      });

      const { transactions, isReady } = await sign(
        txs,
        txs.map(tx => ({
          accountName: tx.sender,
          networkId: tx.networkId,
          chainIds: [tx.chainId],
          requestedFungibles: [
            {
              fungible: 'coin',
              amount: tx.gasLimit * tx.gasPrice,
            },
          ],
        }))
      );

      await isReady();

      // Format the response to match our existing structure
      return transactions.map(tx => ({
        commandSigData: {
          cmd: JSON.stringify(tx),
          sigs: tx.sigs,
        },
        outcome: {
          hash: tx.hash,
        },
      }));
    } catch (error) {
      console.error("Error in SpireKey quickSignAll function:", error);
      throw error;
    }
  },
  quickSignCont: async function(signingCommand) {
    // This method is left for compatibility, but I'm not sure if it even works
    console.warn("SpireKey might not support continuation signing directly. This method is just a placeholder.");
    return null;
  }
};

export default spirekey;