// import
//main
// call main

// function deployFunc() {
//   console.log("Hi There !");
// }

// module.exports.default = deployFunc;
const {
  networkConfig,
  developmentChains,
} = require("../helper-hardhat-config");
const { network } = require("hardhat");
const { verify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;
  // const {getNamedAccounts, deployments} = hre
  // hre.getNamedAccounts
  //hre.deployments

  // well what happens when we want to change chains ?
  // when going for localhost or hardhat network we want to use a mock
  //const address = "0x8A753747A1Fa494EC906cE90E9f37563A8AF630e";
  // if chainId is X use address Y
  // if chainId is Z use address A

  let ethUsdPriceFeedAddress;
  if (developmentChains.includes(network.name)) {
    const ethUsdAggregator = await deployments.get("MockV3Aggregator");
    ethUsdPriceFeedAddress = ethUsdAggregator.address;
  } else {
    ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
    //console.log(chainId + "+++++++++++++");
    //ethUsdPriceFeed
  }
  const args = [ethUsdPriceFeedAddress];
  const fundMe = await deploy("FundMe", {
    from: deployer,
    args: args, // put price feed address
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });
  log(`FundMe deployed at ${fundMe.address}`);

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(fundMe.address, args);
  }

  log("---------------------------------------------------------------");
};

module.exports.tags = ["all", "fundme"];
