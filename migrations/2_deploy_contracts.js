const fs = require('fs');
// migrating the appropriate contracts
var SquareVerifier = artifacts.require("Verifier");
var CustomERC721Token = artifacts.require("CustomERC721Token");
var SolnSquareVerifier = artifacts.require("SolnSquareVerifier");

module.exports = function(deployer, network, accounts) {
	
	const initialMint = async(name, symbol) =>{		
		deployer.deploy(SquareVerifier).then(verifier => {
			console.log("Veririer Address: " + verifier.address);
			return deployer.deploy(SolnSquareVerifier, name, symbol, verifier.address).then(async(solution) => {
				console.log("Solution Verifier Address: " + solution.address);
				
				// mint some tokens to display with proofs
				const proofsFor = JSON.parse(fs.readFileSync(__dirname + '/../zokrates/proofsFor.json'));
				let proofs = [];
				for(let i = 0; i < proofsFor.total; i++) {
					proofs.push(JSON.parse(fs.readFileSync(__dirname + '/../zokrates/proof' + proofsFor.inputs[i].a + proofsFor.inputs[i].b +'.json')));
				}
						
				for(var p of proofs) {
					await solution.addSolution(p.proof, p.inputs, {from: accounts[0]});
					let result = await solution.mintNFT(p.inputs, {from: accounts[0]});
					result.logs.forEach(l => {
	                	if(l.event === 'Transfer') {
	                    	console.log("Minted TokenId:" + l.args.tokenId);
	                	}
	                });							
				}				

			});
		});
	};
	
	if(network === 'rinkeby') { //Rinkeby, test network
		let name = 'Real State NFT';
		let symbol = 'REA';
		initialMint(name, symbol);
	} else if(network === 'ganache') { // GANACHE local one
		let name = 'Real State NFT GANACHE';
		let symbol = 'REAG';
		initialMint(name, symbol);		
		deployer.deploy(CustomERC721Token, name, symbol);				
	} else { // DEVELOPMENT also local
		let name = 'Real State NFT DEVELOPMENT';
		let symbol = 'READ';
		initialMint(name, symbol);
		deployer.deploy(CustomERC721Token, name, symbol);		
	}
};
