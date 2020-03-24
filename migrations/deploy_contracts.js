const splitter = artifacts.require("splitter");
const safemath = artifacts.require("safemath");
	
module.exports = function(deployer){

  deployer.deploy(splitter);
  deployer.deploy(safemath);
  console.log("test");
};