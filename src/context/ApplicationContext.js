import { ethers } from "ethers";
import { createContext, useEffect, useState } from "react";
import ethAbi from "../backend/artifacts/src/backend/contracts/firstToken.sol/firstToken.json";
import btcAbi from "../backend/artifacts/src/backend/contracts/secondToken.sol/secondToken.json";
import swapAbi from "../backend/artifacts/src/backend/contracts/swap.sol/TokenSwap.json";
import env from "../utils/constants";

const toEth = (num) => ethers.utils.formatEther(num);
const toWei = (num) => ethers.utils.parseEther(num.toString());

export const ApplicationContext = createContext();

const { ethereum } = window;

export const ApplicationProvider = ({ children }) => {
  const [currentAccount, setCurrentAccount] = useState("");
  let ethContract, btcContract, swapContract, signer;

  useEffect(() => {
    checIfWalletIsConnected();
  }, []);

  (async () => {
    const currentProvider = new ethers.providers.Web3Provider(ethereum);
    await currentProvider.send("eth_requestAccounts", []);
    signer = currentProvider.getSigner();
    ethContract = new ethers.Contract(env.sep_XETH, ethAbi.abi, signer);
    btcContract = new ethers.Contract(env.sep_XBTC, btcAbi.abi, signer);
    swapContract = new ethers.Contract(env.sep_swap, swapAbi.abi, signer);
  })();

  const getSignature = async (_from, _to, _amount) => {
    const hash = await swapContract.getMessageHash(_from, _to, _amount);
    const sign = await signer.signMessage(ethers.utils.arrayify(hash));
    return sign;
  };

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
    try {
      const amount = await ethContract.balanceOf(currentAccount);
      return toEth(amount);
    } catch (err) {
      console.error(err);
    }
  };

  const getBtcBalance = async () => {
    try {
      const result = await btcContract.balanceOf(currentAccount);
      return toEth(result);
    } catch (err) {
      console.error(err);
    }
  };

  const burnEth = async (_to, _amount) => {
    const signature = await getSignature(currentAccount, _to, toWei(_amount));
    const result = await swapContract.burnEth(
      _to,
      toWei(_amount),
      signature,
      parseInt(ethereum.networkVersion)
    );
    console.log("burn hash: ", result.hash);
    return result.hash;
  };

  const burnBtc = async (_to, _amount) => {
    const signature = await getSignature(currentAccount, _to, toWei(_amount));
    const result = await swapContract.burnBtc(
      _to,
      toWei(_amount),
      signature,
      parseInt(ethereum.networkVersion)
    );
    console.log("burn hash: ", result.hash);
    return result.hash;
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
        getBtcBalance,
        burnEth,
        burnBtc,
      }}
    >
      {children}
    </ApplicationContext.Provider>
  );
};
