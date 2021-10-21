const fs = require('fs');
const { initialize } = require('zokrates-js/node');

const proofsFor = JSON.parse(fs.readFileSync(__dirname + '/proofsFor.json'));

let compile = () => {
	initialize().then(async(zokratesProvider) => {
		let source = fs.readFileSync(__dirname + '/code/square.code');
		
	    // compilation
	    const artifacts = zokratesProvider.compile(source.toString());

	    // run setup
	    const keypair = zokratesProvider.setup(artifacts.program);

	    // export solidity verifier
	    const verifier = zokratesProvider.exportSolidityVerifier(keypair.vk, "v1");
	    fs.writeFileSync(__dirname + '/../contracts/verifier.sol', verifier, (err) => {
	    	if (err) throw err;
	    	console.log('Verifier contract saved');	    	
	    });
	    
	    for(let i = 0; i < proofsFor.total; i++) {	    	
		    // computation
		    const w = zokratesProvider.computeWitness(artifacts, [proofsFor.inputs[i].a, proofsFor.inputs[i].b]);
		    
		    // generate proof
		    const proof = zokratesProvider.generateProof(artifacts.program, w.witness, keypair.pk);
		    fs.writeFileSync(__dirname + '/proof' + proofsFor.inputs[i].a + proofsFor.inputs[i].b + '.json', JSON.stringify(proof, null, 2), (err) => {
		    	if (err) throw err;
		    	console.log('proof' + proofsFor.inputs[i].a + proofsFor.inputs[i].b + '.json saved');	    	
		    });
	    }
	    
	});	
} 

compile();