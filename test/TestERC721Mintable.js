var CustomERC721Token = artifacts.require('CustomERC721Token');

contract('TestERC721Mintable', accounts => {

    const account_one = accounts[0];
    const account_two = accounts[1];
    let contract
    describe('match erc721 spec', function () {
        beforeEach(async function () { 
            this.contract = await CustomERC721Token.new("Real State NFT", "REA", {from: account_one});
            // TODO: mint multiple tokens
            
            for(let i = 1; i <= 10; i++) {
                let result = await this.contract.mint(account_two, i, i + "", {from: account_one});
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
        	let result = await this.contract.totalSupply();
        	assert.isTrue(web3.utils.toBN(result).eq(web3.utils.toBN(10)), "Total supply is not correct");           
        })

        it('should get token balance', async function () { 
        	let result = await this.contract.balanceOf(account_two);
        	assert.isTrue(web3.utils.toBN(result).eq(web3.utils.toBN(10)), "Balance of owner account 2");           
        })

        // token uri should be complete i.e: https://s3-us-west-2.amazonaws.com/udacity-blockchain/capstone/1
        it('should return token uri', async function () { 
        	for(let i = 1; i <= 10; i++) {
            	let result = await this.contract.tokenURI(i);
            	assert.equal(result, 'https://s3-us-west-2.amazonaws.com/udacity-blockchain/capstone/' + i, "Incorrect TokenURI");	
        	}        	
        })

        it('should transfer token from one owner to another', async function () { 
        	let balance1Before = await this.contract.balanceOf(account_two); 
        	assert.isTrue(balance1Before == 10, "Spender posses 10 tokens");
        	let balance2Before = await this.contract.balanceOf(account_one); 
        	assert.isTrue(balance2Before == 0, "To posses 0 tokens");
        	
        	let result = await this.contract.safeTransferFrom(account_two, account_one, 1, {from: account_two});         	
        	result.logs.forEach(l => {
            	if(l.event === 'Transfer') {
            		assert.isTrue(web3.utils.toBN(l.args.from).eq(web3.utils.toBN(account_two)), "From account is not the same");
            		assert.isTrue(web3.utils.toBN(l.args.to).eq(web3.utils.toBN(account_one)), "To account is not the same");
                	assert.equal(l.args.tokenId, 1, "Incorrect TokenId expected");
                	console.log("Tranfer: " + l.args.tokenId);
            	}
            });
        	
        	let balance1After = await this.contract.balanceOf(account_two); 
        	assert.isTrue(balance1After == 9, "Spender posses 10 tokens");
        	let balance2After = await this.contract.balanceOf(account_one); 
        	assert.isTrue(balance2After == 1, "To posses 0 tokens");
        })
    });

    describe('have ownership properties', function () {
        beforeEach(async function () { 
            this.contract = await CustomERC721Token.new("Real State NFT", "REA", {from: account_one});
        })

        it('should fail when minting when address is not contract owner', async function () { 
        	try {
        		let result = await this.contract.mint(account_two, 11, 11 + "", {from: account_two});
        		assert.isNotOk("It must launch error because not owner is trying to mint a token");
        	} catch(e) {
        		console.log(e.message);
        		assert.include(e.message, 'Caller is NOT the contract owner', 'Unexpected error: [' + e.message + ']');
        	}
        })

        it('should return contract owner', async function () { 
        	let result = await this.contract.owner();
        	assert.isTrue(web3.utils.toBN(result).eq(web3.utils.toBN(account_one)), "Contract owner is not correct");       
        })
    });
})