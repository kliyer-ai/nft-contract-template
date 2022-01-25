require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require('dotenv').config()


function getURL(networkName) {
  if (process.env.API_PROVIDER === 'infura') {
    return `https://${networkName}.infura.io/v3/${process.env.API_PROVIDER_KEY}`
  }

  if (process.env.API_PROVIDER === 'alchemy') {
    return `https://eth-${networkName}.alchemyapi.io/v2/${process.env.API_PROVIDER_KEY}`
  }
}


// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.4",
  defaultNetwork: "local",
  networks: {
    local: {
      // start local node with npx hardhat node
      url: "http://127.0.0.1:8545/",
      // this is the private key of the first funded account on your local node
      accounts: ["0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"] // for account 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
    },
    rinkeby: {
      url: getURL("rinkeby"),
      accounts: {
        mnemonic: process.env.MNEMONIC
      }
    }
  },
  etherscan: {
    apiKey: {
      mainnet: process.env.ETHERSCAN_API_KEY,
      ropsten: process.env.ETHERSCAN_API_KEY,
      rinkeby: process.env.ETHERSCAN_API_KEY,
      goerli: process.env.ETHERSCAN_API_KEY,
      kovan: process.env.ETHERSCAN_API_KEY,
    }
  }
};
