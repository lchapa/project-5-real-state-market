// migrating the appropriate contracts
var SquareVerifier = artifacts.require("Verifier");
var CustomERC721Token = artifacts.require("CustomERC721Token");
var SolnSquareVerifier = artifacts.require("SolnSquareVerifier");

module.exports = function(deployer) {
  deployer.deploy(SquareVerifier).then(instance => {
	  deployer.deploy(SolnSquareVerifier, "Real State NFT", "REA", instance.address);
  });
  deployer.deploy(CustomERC721Token, "Real State NFT", "REA");
};
