const { ethers } = require("hardhat");
const swapAbi = require("../artifacts/src/backend/contracts/swap.sol/TokenSwap.json");
const { Form } = require("react-router-dom");
const toWei = (num) => ethers.utils.parseEther(num.toString());
require("dotenv").config();

let lastProcessedNonce = 0;

const sepoliaProvider = new ethers.providers.JsonRpcProvider(
  process.env.sepolia_network
);

const polygonProvider = new ethers.providers.JsonRpcProvider(
  process.env.polygon_network
);

const polygonAdminWallet = new ethers.Wallet(
  process.env.admin_private_key,
  polygonProvider
);
const sepoliaAdminWallet = new ethers.Wallet(
  process.env.admin_private_key,
  sepoliaProvider
);

const sepolia_swap = new ethers.Contract(
  process.env.sep_swap,
  swapAbi.abi,
  sepoliaProvider
);

const polygon_swap = new ethers.Contract(
  process.env.pol_swap,
  swapAbi.abi,
  polygonProvider
);

sepolia_swap.on(
  "Swap",
  (_from, _to, _amount, _nonce, _timestamp, _chainId, _sig, _state) => {
    sepolia_swap.on("LogPriceUpdated", async (_price) => {
      if (parseInt(_chainId) === 11155111) {
        console.log(_state);
        console.log(_nonce);
        if (_nonce > lastProcessedNonce) {
          lastProcessedNonce = _nonce;
          if (_state === 0) {
            console.log("minting BTC");
            await mintBtcOnPolygon(_from, _to, _amount, _price, _nonce, _sig);
            return;
          } else if (_state === 1) {
            console.log("minting ETH");
            await mintEthOnPolygon(_from, _to, _amount, _price, _nonce, _sig);
            return;
          }
        }
      }
    });
  }
);

const mintBtcOnPolygon = async (_from, _to, _amount, _price, _nonce, _sig) => {
  const result = await polygon_swap
    .connect(polygonAdminWallet)
    .mintBtc(_from, _to, _amount, toWei(_price), _nonce, _sig);
  console.log("Minted on hash: " + result.hash);
};

const mintEthOnPolygon = async (_from, _to, _amount, _price, _nonce, _sig) => {
  const result = await polygon_swap
    .connect(polygonAdminWallet)
    .mintEth(_from, _to, _amount, toWei(_price), _nonce, _sig);
  console.log("Minted on Polygon\nHash: " + result.hash);
};

polygon_swap.on(
  "SwapMint",
  (_from, _to, _amount, _nonce, _timestamp, _state) => {
    console.log(`from: ${_from}`);
    console.log(`to: ${_to}`);
    console.log(`_amount: ${_amount}`);
    console.log(`state: ${_state}`);
  }
);
