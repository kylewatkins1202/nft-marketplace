require("@nomiclabs/hardhat-waffle");
const fs = require('fs')

const privateKey = fs.readFileSync(".secret").toString()
const mumbai = fs.readFileSync(".mumbai").toString()
const mainnet = fs.readFileSync(".mainnet").toString()

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  networks: {
    hardhat: {
      chainId: 1337
    },
    mumbai: {
      url: mumbai,
      accounts: [privateKey]
    },
    mainnet: {
      url: mainnet,
      accounts: [privateKey]
    }

  },
  solidity: "0.8.4",
};
