// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const { ethers } = require("hardhat");

async function deploy(contractName) {

  const Contract = await ethers.getContractFactory(contractName);
  const contract = await Contract.deploy();

  await contract.deployed();

  console.log(`${contractName} deployed to:`, contract.address);

  return contract
}

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  const maxTokens = 5
  const showRelativeCost = false
  const showUSDCost = true

  // assumptions
  const gasPrice = ethers.utils.parseUnits('100', 'gwei')
  const price = 3500
  const etherPrice = price / ethers.utils.parseUnits('1', 'ether')


  const standard721 = await deploy('Standard721')
  const azuki721 = await deploy('Azuki721')
  const standard1155 = await deploy('Standard1155')


  // Let's "initialize" the contract by minting some NFTs to an address
  // this is especially necessary for the ERC1155

  const initWallet = ethers.Wallet.createRandom()

  const tx721 = await standard721.safeMint(initWallet.address)
  const res721 = await tx721.wait()

  const tx721a = await azuki721.safeMint(initWallet.address, 1)
  const res721a = await tx721a.wait()

  const tx1155 = await standard1155.mint(initWallet.address, 1, 1, [])
  const res1155 = await tx1155.wait()

  console.log("Gas used for ERC721:", res721.gasUsed.toString())
  console.log("Gas used for Azuki ERC721:", res721a.gasUsed.toString())
  console.log("Gas used for ERC1155:", res1155.gasUsed.toString())

  console.log('ASSUMPTIONS:');
  console.log(`Gas price: ${ethers.utils.formatUnits(gasPrice, 'gwei')} gwei`);
  console.log(`Ethereum price: ${price} USD`);


  for (let i = 1; i <= maxTokens; i++) {
    console.log('===============================================');

    console.log(`Minting ${i} NFT(s) at once...`);

    // create new wallet as minting costs might differ if the wallet already owns some NFTs
    const wallet = ethers.Wallet.createRandom()

    // mint i NFTs with incrementing IDs (since it's a 721)
    const tx721 = await standard721.mintBatch(wallet.address, i)
    const res721 = await tx721.wait()
    console.log("Gas used for ERC721:", res721.gasUsed.toString())

    const tx721a = await azuki721.safeMint(wallet.address, i)
    const res721a = await tx721a.wait()
    console.log("Gas used for Azuki ERC721:", res721a.gasUsed.toString())

    // mint i NFTs with ID 1 and no additional token data
    const tx1155 = await standard1155.mint(wallet.address, 1, i, [])
    const res1155 = await tx1155.wait()
    console.log("Gas used for ERC1155:", res1155.gasUsed.toString())

    if (showRelativeCost) {
      console.log(`An ERC1155 is ${(1 - res1155.gasUsed / res721.gasUsed).toFixed(3) * 100}% cheaper to mint than a standard ERC721.`);
      console.log(`An ERC1155 is ${(1 - res1155.gasUsed / res721a.gasUsed).toFixed(3) * 100}% cheaper to mint than the Azuki ERC721A.`);
      console.log(`The Azuki ERC721A is ${(1 - res721a.gasUsed / res721.gasUsed).toFixed(3) * 100}% cheaper to mint than the standard ERC721.`);
    }

    if (showUSDCost) {
      console.log(`ERC721 cost in USD:`, (res721.gasUsed * gasPrice * etherPrice).toFixed(2))
      console.log(`ERC721A cost in USD:`, (res721a.gasUsed * gasPrice * etherPrice).toFixed(2))
      console.log(`ERC1155 cost in USD:`, (res1155.gasUsed * gasPrice * etherPrice).toFixed(2))
    }
  }


}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
