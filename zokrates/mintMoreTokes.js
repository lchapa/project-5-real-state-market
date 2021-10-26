const fs = require('fs');
const { initialize } = require('zokrates-js/node');

var SolnSquareVerifier = require('../build/contracts/SolnSquareVerifier.json');
var Contract = require('web3-eth-contract');


var Web3 = require('Web3');
var TruffleContract = require('@truffle/contract');
const HDWalletProvider = require('@truffle/hdwallet-provider');

const activeNetwork = 'RinkeBy';
const network = {
	"RinkeBy": {
		"url": "https://rinkeby.infura.io/v3/8d9ba0d42a024ca88c6f29723ff61446",
		"solutionsAddress": "0x0726d5C1fe7F57900C9a7D2fbF05621b67FFf65d"
	},
	"localhost": {
		"url": "http://localhost:8545",
		"solutionsAddress": "0xE8bba2140e33DE7f7ccb3a8a971A30ACf3e9EC52"
	}
}
const mnemonic = fs.readFileSync(__dirname + "/../.secret").toString().trim();
const source = fs.readFileSync(__dirname + '/code/square.code');
const provingKey = Uint8Array.from(fs.readFileSync(__dirname + '/proving.key'));

module.exports = function() {
	this.solutions = '';
	this.owner = '';
	this.proofs = [];
	
	this.initSolutions = async() => {	
		let wallet = new HDWalletProvider(mnemonic, network[activeNetwork]['url']);
		let web3 = new Web3(wallet);
		Contract.setProvider(web3);
		//Contract.setProvider(network[activeNetwork]['url']);		
		this.solutions = new Contract(SolnSquareVerifier.abi, network[activeNetwork]['solutionsAddress']);
		try {
			this.owner = await this.solutions.methods.owner().call({from: '0xfDe1716deBE4ef4712304E38572c56e74149c7CC', value: '0x00'});
		} catch(e) {
			console.log("Error getting owner: " + e.message);
		}
		return "Solutions contract initialized";
	};
	
	this.generateProof = async(input1, input2) => {
		// Generate more proofs for the tokes to add.
		initialize().then(async(zokratesProvider) => {
			const artifacts = zokratesProvider.compile(source.toString());
		    const w = zokratesProvider.computeWitness(artifacts, [input1, input2]);
		    const proof = zokratesProvider.generateProof(artifacts.program, w.witness, provingKey);
		    this.proofs.push(proof);
		});	
		return 'Proof generated';
	};	
	
	this.mintProofsIfAllowed = async() => {
		let rejected = 0;
		let minted = 0;
		for(let p of this.proofs) {
			try {
				await this.solutions.methods.addSolution(p.proof, p.inputs).send({from: this.owner, gas: "5000000"});
				await this.solutions.methods.mintNFT(p.inputs).send({from: this.owner, gas: "5000000"});
				
				minted = minted + 1;
			} catch(e) {
				console.log(e.message);
				rejected = rejected +1;
			}
		}
		this.proofs = [];
		return 'Proofs verified and minted:[' + minted+ '] rejected:[' + rejected + ']';
	};
	
	this.getStatus = async() => {
		let result = await this.solutions.methods.totalSupply().call({from: this.owner});
		return 'Total supply: [' + result + ']';
	};
} 

var addMoreTokens = require("./mintMoreTokes.js");

(async() => {
	let adding = new addMoreTokens();
	let r1 = await adding.initSolutions();
	console.log(`${r1} with owner ${adding.owner}`);

	let status = await adding.getStatus();
	console.log(`Current status ${status}`);
	
	let input1 = '13';
	let input2 = '14';
	let r2 = await adding.generateProof(input1, input2);
	console.log(`${r2} for inputs ${input1}:${input2}`);
		
	let input3 = '15';
	let input4 = '16';
	let r3 = await adding.generateProof(input3, input4);
	console.log(`${r3} for inputs ${input3}:${input4}`);
	
	let r4 = await adding.mintProofsIfAllowed();
	console.log(`${r4}`);
	
	let status2 = await adding.getStatus();
	console.log(`Status after minted more tokens ${status2}`);

})();

