const RCToken = artifacts.require("./RCToken.sol");
const RCTokenSale = artifacts.require("../contracts/RCTokenSale.sol");

module.exports = function(deployer) {
  deployer.deploy(RCToken, 1000000).then(() => {
    let tokenPrice = 10000000;
    return deployer.deploy(RCTokenSale, RCToken.address, tokenPrice)
  });
};
