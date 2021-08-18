var RCToken = artifacts.require("./RCToken.sol");

module.exports = function(deployer) {
  deployer.deploy(RCToken);
};
