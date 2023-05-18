require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",

  defaultNetwork: "ganache",

  networks: {
    ganache: {
      url: "http://127.0.0.1:7545",
    },
    // sepolia: {
    //   url: "https://sepolia.infura.io/v3/4ec1f52fc49f48fb9f8bac27b1348a42",
    //   accounts: [process.env.admin_private_key],
    // },
  },

  paths: {
    artifacts: "./src/backend/artifacts",
    sources: "./src/backend/contracts",
    cache: "./src/backend/cache",
    tests: "./src/backend/test",
  },
};
