import config from '../config';

export const LINX = "LINX";

const linx = {
  name: "Linx Wallet",
  connect: async function () {
    if (!window.kadena || window.kadena.name !== "Linx Wallet") {
      throw new Error("Linx wallet is not available");
    }

    try {
      const account = await getAccount();
      if (!account) {
        throw new Error("No account found");
      }

      return {
        status: "success",
        account: {
          account: account,
          publicKey: account.slice(2), // Remove 'k:' prefix for public key
        }
      };
    } catch (error) {
      console.error("Error connecting to Linx wallet:", error);
      return {
        status: "error",
        message: error.message
      };
    }
  },

  disconnect: async function() {
    // Linx wallet doesn't require explicit disconnect in the app context
    return {
      status: "success",
      message: "Disconnected from Linx wallet"
    };
  },

  quickSign: async function (tx) {
    if (!window.kadena || window.kadena.name !== "Linx Wallet") {
      throw new Error("Linx wallet is not available");
    }

    try {
      const description = tx.meta?.description || "Sign Transaction";
      const signRequest = await send({
        signingRequest: tx,
        description,
        chainId: parseInt(tx.meta.chainId),
        token: "KDA",
        amount: 0.0,
        gasPrice: 0.0,
        gasToken: "coin",
        needsApproval: true
      }, description);

      if (signRequest && !signRequest.error) {
        return signRequest;
      } else {
        throw new Error(signRequest.error || "Signing failed");
      }
    } catch (error) {
      console.error("Error during Linx signing:", error);
      return {
        status: "fail",
        message: error.message
      };
    }
  },

  quickSignAll: async function (txs) {
    if (!window.kadena || window.kadena.name !== "Linx Wallet") {
      throw new Error("Linx wallet is not available");
    }

    try {
      const signedTransactions = [];
      
      // Process each transaction sequentially to maintain order
      for (const tx of txs) {
        const description = tx.meta?.description || "Sign Transaction";
        const signRequest = await send({
          signingRequest: tx,
          description,
          chainId: parseInt(tx.meta.chainId),
          token: "KDA",
          amount: 0.0,
          gasPrice: 0.0,
          gasToken: "coin",
          needsApproval: true
        }, description);

        if (signRequest && !signRequest.error) {
          signedTransactions.push(signRequest);
        } else {
          throw new Error(signRequest.error || "Signing failed");
        }
      }

      return signedTransactions;
    } catch (error) {
      console.error("Error during Linx batch signing:", error);
      throw error;
    }
  }
};

// Helper functions
async function send(sendRequest, description) {
  return await window.flutter_inappwebview.callHandler(
    "LinxWallet",
    {
      request: "Send",
      description: description,
      data: sendRequest,
      quickSign: null,
      needsApproval: true
    }
  );
}

async function getAccount() {
  const account = await window.flutter_inappwebview.callHandler(
    "LinxWallet",
    {
      request: "Account",
      description: "get address",
      data: {},
      quickSign: null,
      needsApproval: false
    }
  );
  return account;
}

export default linx;