var splitter = artifacts.require("./splitter.sol");
var safemath = artifacts.require("./safemath.sol");
var owned = artifacts.require("./owned.sol");
var paused = artifacts.require("./paused.sol");



module.exports = function (deployer, network, accounts) {
    deployer.deploy(splitter);
    deployer.deploy(safemath);
	deployer.deploy(owned);
	deployer.deploy(paused);
    console.log("test");
};