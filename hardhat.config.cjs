require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "https://rpc.sepolia.org",
      accounts: process.env.TESTNET_PRIVATE_KEY ? [process.env.TESTNET_PRIVATE_KEY] : [],
      chainId: 11155111,
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test/contracts",
    cache: "./cache_hardhat",
    artifacts: "./artifacts",
  },
};
