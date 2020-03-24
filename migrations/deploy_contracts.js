var splitter = artifacts.require("./splitter.sol");
var safemath = artifacts.require("./safemath.sol");

module.exports = function (deployer, network, accounts) {
    deployer.deploy(splitter);
    deployer.deploy(safemath);
    console.log("test");
};