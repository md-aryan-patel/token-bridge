import { ethers } from "ethers";
import { createContext, useEffect, useState } from "react";
import ethAbi from "../backend/artifacts/contracts/firstToken.sol/firstToken.json";
import btcAbi from "../backend/artifacts/contracts/secondToken.sol/secondToken.json";
import env from "../utils/constants";

export const ApplicationContext = createContext();

const { ethereum } = window;

export const ApplicationProvider = ({ children }) => {
  const [currentAccount, setCurrentAccount] = useState("");
  let ethContract, btcContract;

  useEffect(() => {
    checIfWalletIsConnected();
    (async () => {
      const currentProvider = new ethers.providers.Web3Provider(ethereum);
      await currentProvider.send("eth_requestAccounts", []);
      const signer = currentProvider.getSigner();
      ethContract = new ethers.Contract(env.sep_XETH, ethAbi.abi, signer);
      btcContract = new ethers.Contract(env.sep_XBTC, btcAbi.abi, signer);
    })();
  }, []);

  const checIfWalletIsConnected = async () => {
    try {
      if (!ethereum) return alert("Install Metamask");

      const accounts = await ethereum.request({ method: "eth_accounts" });
      if (accounts.length) {
        setCurrentAccount(accounts[0]);
      } else {
        console.log("No accounts found");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const connectWallet = async () => {
    try {
      if (!ethereum) return alert("Install Metamask");
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      setCurrentAccount(accounts[0]);
    } catch (err) {
      console.log(err);
      throw new Error("No ethereum object");
    }
  };

  const changeNetwork = async (chainId) => {
    if (!ethereum) return alert("Install Metamask");

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: ethers.utils.hexValue(chainId) }],
      });
    } catch (error) {
      if (error.code === 4902) {
        // User rejected the network switch
        console.log("User rejected network switch");
      } else {
        // Other error occurred
        console.error("Error occurred while switching network:", error);
      }
    }
  };

  const getEtherBalance = async () => {
    const result = await ethContract.balanceOf(currentAccount);
    return result;
  };

  const getCurrentChainId = () => {
    return ethereum.networkVersion;
  };

  return (
    <ApplicationContext.Provider
      value={{
        currentAccount,
        connectWallet,
        changeNetwork,
        getCurrentChainId,
        getEtherBalance,
      }}
    >
      {children}
    </ApplicationContext.Provider>
  );
};
