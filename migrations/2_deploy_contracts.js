var Splitter = artifacts.require("./Splitter.sol");
var Safemath = artifacts.require("./Safemath.sol");
var Owned = artifacts.require("./Owned.sol");
var Paused = artifacts.require("./Paused.sol");

module.exports = function (deployer, network, accounts) {
    deployer.deploy(Splitter);
    deployer.deploy(Safemath);
	deployer.deploy(Owned);
	deployer.deploy(Paused);
};