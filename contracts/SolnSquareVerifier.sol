// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../node_modules/@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./ERC721Mintable.sol";
import "./verifier.sol";

// TODO define a contract call to the zokrates generated solidity contract <Verifier> or <renamedVerifier>
interface IVerifier  {
    function verifyTx(Verifier.Proof memory proof, uint[2] memory input) external view returns (bool r); 
}

// TODO define another contract named SolnSquareVerifier that inherits from your ERC721Mintable class
contract SolnSquareVerifier is CustomERC721Token {
    using Pairing for *;
    using SafeMath for uint256;
    
    IVerifier private verifier;
    
    constructor(string memory name, string memory symbol, address _verifier) 
    	CustomERC721Token(name, symbol)
    {
        verifier = IVerifier(_verifier);
    }
    
	// TODO define a solutions struct that can hold an index & an address
	struct Solution {
	    uint256 index;
	    address owner;
	}
	
	// TODO define an array of the above struct
	mapping(bytes32 => Solution) private solutions;	
	uint256 solutionsCount;

	// TODO define a mapping to store unique solutions submitted
	mapping(uint256 => bool) solutionsMinted;

	// TODO Create an event to emit when a solution is added
	event SolutionAdded(uint256 solutionIndex, address solutionAddress);    
	
	// TODO Create a function to add the solutions to the array and emit the event
	function addSolution(Verifier.Proof memory proof, uint256[2] memory input) external {
	    bytes32 solHash = keccak256(abi.encodePacked(input[0], input[1]));	    
	    require(solutions[solHash].owner == address(0), "Solution already added");
	    
		bool verified = verifier.verifyTx(proof, input);
		require(verified, "Solution could not be verified, then is not added");
				
		solutionsCount = solutionsCount.add(1);
		Solution storage solution = solutions[solHash];
		solution.index = solutionsCount;
		solution.owner = msg.sender;
		
		emit SolutionAdded(solutionsCount, msg.sender);
	}
		
	// TODO Create a function to mint new NFT only after the solution has been verified
	//  - make sure the solution is unique (has not been used before)
	//  - make sure you handle metadata as well as tokenSuplly
	function mintNFT(uint256[2] memory input) external {
	    bytes32 solHash = keccak256(abi.encodePacked(input[0], input[1]));	
	    require(solutions[solHash].owner != address(0), "Solution does not exist yet");
	    uint256 solutionIndex = solutions[solHash].index;
	    require(solutionsMinted[solutionIndex] == false, "Solution was already minted");
	    
	    super.mint(msg.sender, solutionIndex, "testTokenURI");
	    
	    solutionsMinted[solutionIndex] = true;
	}
}





  


























