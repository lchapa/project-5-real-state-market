var CustomERC721Token = artifacts.require('CustomERC721Token');

contract('TestERC721Mintable', accounts => {

    const account_one = accounts[0];
    const account_two = accounts[1];
    let contract;
    describe('match erc721 spec', function () {
        before(async function () { 
            contract = await CustomERC721Token.new("Real State NFT", "REA", {from: account_one});
            // TODO: mint multiple tokens
            
            for(let i = 1; i <= 10; i++) {
                let result = await contract.mint(account_two, i, i + "", {from: account_one});
                result.logs.forEach(l => {
                	if(l.event === 'Transfer') {
                		assert.isTrue(web3.utils.toBN(l.args.from).eq(web3.utils.toBN(0x0)), "From account is not the same");
                		assert.isTrue(web3.utils.toBN(l.args.to).eq(web3.utils.toBN(account_two)), "To account is not the same");
                    	//console.log("Minted TokenId:" + l.args.tokenId);
                    	assert.equal(l.args.tokenId, i, "Incorrect TokenId expected");
                	}
                });
            }
        })

        it('should return total supply', async function () {
        	let result = await contract.totalSupply();
        	assert.isTrue(web3.utils.toBN(result).eq(web3.utils.toBN(10)), "Total supply is not correct");           
        })

        it('should get token balance', async function () { 
        	let result = await contract.balanceOf(account_two);
        	assert.isTrue(web3.utils.toBN(result).eq(web3.utils.toBN(10)), "Balance of owner account 2");           
        })

        // token uri should be complete i.e: https://s3-us-west-2.amazonaws.com/udacity-blockchain/capstone/1
        it('should return token uri', async function () { 
        	for(let i = 1; i <= 10; i++) {
            	let result = await contract.tokenURI(i);
            	assert.equal(result, 'https://s3-us-west-2.amazonaws.com/udacity-blockchain/capstone/' + i, "Incorrect TokenURI");	
        	}        	
        })

        it('should transfer token from one owner to another', async function () { 
        	let balance1Before = await contract.balanceOf(account_two); 
        	assert.isTrue(balance1Before == 10, "Spender posses 10 tokens");
        	let balance2Before = await contract.balanceOf(account_one); 
        	assert.isTrue(balance2Before == 0, "To posses 0 tokens");
        	
        	let result = await contract.safeTransferFrom(account_two, account_one, 1, {from: account_two});         	
        	result.logs.forEach(l => {
            	if(l.event === 'Transfer') {
            		assert.isTrue(web3.utils.toBN(l.args.from).eq(web3.utils.toBN(account_two)), "From account is not the same");
            		assert.isTrue(web3.utils.toBN(l.args.to).eq(web3.utils.toBN(account_one)), "To account is not the same");
                	assert.equal(l.args.tokenId, 1, "Incorrect TokenId expected");
                	console.log("Tranfer: " + l.args.tokenId);
            	}
            });
        	
        	let balance1After = await contract.balanceOf(account_two); 
        	assert.isTrue(balance1After == 9, "Spender posses 10 tokens");
        	let balance2After = await contract.balanceOf(account_one); 
        	assert.isTrue(balance2After == 1, "To posses 0 tokens");
        });
        
        it('Should have been granted approvals before transfer', async function() {
        	
        	//try to recover the token transferred in the prevuios step. But not authorized to to so.
        	try {
            	let result = await contract.safeTransferFrom(account_one, account_two, 1, {from: account_two});  
            	assert.isNotOk('Exception must be launched because the sender is not owner nor authorized to transfer the token');
        	} catch(e) {
        		console.log(e.message);
        		assert.include(e.message, 'Sender is not authorized to transfer this token', 'Unexpected error: [' + e.message + ']');
        	}
        	
        	// 1 Authorized from current owner to sender must be granted then the transfer can happen.
        	try {
        		let result = await contract.approve(account_two, 1, {from: account_one});
        		result.logs.forEach(l => {
        			if(l.event === 'Approval') {
        				assert.isTrue(web3.utils.toBN(l.args.owner).eq(web3.utils.toBN(account_one)), 'Current owner for approval is incorrect');
        				assert.isTrue(web3.utils.toBN(l.args.approved).eq(web3.utils.toBN(account_two)), 'Approve account is incorrect');
        				assert.equal(l.args.tokenId, 1, 'TokenId is incorrect');
        				console.log(`TokenId: ${l.args.tokenId} granted from ${l.args.owner} to ${l.args.approved}`);
        			}
        		});        		
        	} catch(e) {
        		console.log(e.message);
        		assert.isNotOk('Error is not expected');
        	}        	

        	//Once authorized, transfer can be done.
        	try {
            	let result = await contract.safeTransferFrom(account_one, account_two, 1, {from: account_two});
            	result.logs.forEach(l => {
                	if(l.event === 'Transfer') {
                		assert.isTrue(web3.utils.toBN(l.args.from).eq(web3.utils.toBN(account_one)), "From account is not the same");
                		assert.isTrue(web3.utils.toBN(l.args.to).eq(web3.utils.toBN(account_two)), "To account is not the same");
                    	assert.equal(l.args.tokenId, 1, "Incorrect TokenId expected");
                    	console.log("Tranfer: " + l.args.tokenId);
                	}            		
            	});
        	} catch(e) {
        		console.log(e.message);
        		assert.isNotOk('Error not expected');
        	}
        	
        	// Test balances
        	let balance1End = await contract.balanceOf(account_two); 
        	assert.isTrue(balance1End == 10, "Spender posses 10 tokens");
        	let balance2BEnd = await contract.balanceOf(account_one); 
        	assert.isTrue(balance2BEnd == 0, "To posses 0 tokens");     
        }); 
    });

    describe('have ownership properties', function () {
        it('should fail when minting when address is not contract owner', async function () { 
        	try {
        		let result = await contract.mint(account_two, 11, 11 + "", {from: account_two});
        		assert.isNotOk("It must launch error because not owner is trying to mint a token");
        	} catch(e) {
        		console.log(e.message);
        		assert.include(e.message, 'Caller is NOT the contract owner', 'Unexpected error: [' + e.message + ']');
        	}
        });

        it('should return contract owner', async function () { 
        	let result = await contract.owner();
        	assert.isTrue(web3.utils.toBN(result).eq(web3.utils.toBN(account_one)), "Contract owner is not correct");       
        });

        it('OnlyOwner can paused contract', async function() {
        	let currentOwner = await contract.owner();
        	try {
        		assert.notEqual(currentOwner, account_two, 'Try pause contract with other account other than the current owner');
        		let result = await contract.setPaused(true, {from: account_two});
        		assert.isNotOk('Exception must be lanched because only owner can pause the contract');
        	} catch(e) {
        		console.log(e.message);
        		assert.include(e.message, 'Caller is NOT the contract owner', 'Unexpected error: [' + e.message + ']');          	
        	}
        	
        	// Then the owner pause the contract.
        	try {
        		let result = await contract.setPaused(true, {from: currentOwner});
        		result.logs.forEach(l => {
        			if(l.event === 'Paused') {
                		assert.isTrue(web3.utils.toBN(l.args[0]).eq(web3.utils.toBN(currentOwner)), "Current owner did NOT paused the contract");
        			}
        		});
        	} catch(e) {
        		console.log(e.message);
        		assert.isNotOk('No error expected');
        	}
        	
        	//Then, try to mint on a paused contract
        	try {
        		let result = await contract.mint(currentOwner, 100, "100", {from: currentOwner});
        		assert.isNotOk('Must launch an expcetion because contract is paused');
        	} catch(e) {
        		console.log(e.message);
        		assert.include(e.message, 'Contract is currently paused', 'Unexpected error: [' + e.message + ']');
        	}
        	
        	// Then UNpause the contract.
        	try {
        		let result = await contract.setPaused(false, {from: currentOwner});
        		result.logs.forEach(l => {
        			if(l.event === 'Unpaused') {
                		assert.isTrue(web3.utils.toBN(l.args[0]).eq(web3.utils.toBN(currentOwner)), "Current owner did NOT UNpaused the contract");
        			}
        		});
        	} catch(e) {
        		console.log(e.message);
        		assert.isNotOk('No error expected');
        	}
        });
        
        it('Ownership tranference to other accounts', async function() {
        	
        	//Only current onwe can tranfer ownership
        	let currentOwner = await contract.owner();
        	try {
        		assert.notEqual(currentOwner, account_two, 'Try pause contract with other account other than the current owner');
        		let result = await contract.transferOwnership(account_two, {from: account_two});
        		assert.isNotOk('Exception must be lanched because only owner can transfer the contract');
        	} catch(e) {
        		console.log(e.message);
        		assert.include(e.message, 'Caller is NOT the contract owner', 'Unexpected error: [' + e.message + ']');          	
        	}

        	//Only current onwe can tranfer ownership
        	try {
        		assert.notEqual(currentOwner, account_two, 'Try pause contract with other account other than the current owner');
        		let result = await contract.transferOwnership(account_two, {from: currentOwner});
        		result.logs.forEach(l => {
        			if(l.event === 'OwnershipTransferred') {
        				assert.equal(web3.utils.toBN(previousOwner), web3.utils.toBN(currentOwner), 'Previuos Onwer is incorrect');
        				assert.equal(web3.utils.toBN(newOwner), web3.utils.toBN(account_two), 'NewOwner is incorrect');
        			}
        		});        		
        	} catch(e) {
        		console.log(e.message);
        	}
        	let newOwner = await contract.owner();
        	assert.notEqual(web3.utils.toBN(currentOwner), web3.utils.toBN(newOwner));
        });
        
    });
})