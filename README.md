# Udacity Blockchain Capstone

Final project in order to end the Blockchain Developer Nanodegree Udacity on-line course.

## Introduction

This projects creates an NFT (Non-Fungible-Token) that represents properties in Real State. The idea is to incorporate a way to solve the validation problem on the property titles, saving money and time when a real state property is dealt.

The way to validate titles is done by Zocrates (zkSNARKS zero-knowledge Succinct Non-interactive ARgument of Knowledge), for details please click on: [Zocrates](https://zokrates.github.io/)

So, the holder of the title to validate, invokes a smart contract to validate his / her document without actually uncover it untill the property is sold. Once the document is validated by the zkSNARK algorithms, the titles is minted into the Real State network and publish to the [NFT market OpenSea](https://docs.opensea.io/)

## Checkout, test and feedback

**Remember the required software**

1. Nodejs
2. Ganache

Once you have checked out this project to your local computer, please follow these steps:

1. `npm install` in order to download all required dependencies (package.json for details).
2. `npm run zocrates` to compile, generate proofs (at least 3) to mint and the corresponding smart contract in solidity.
3. `truffle migrate --network ganache` to migrate and deploy smart contracts to ganache.
4. `truffle test --network ganache` to execute the tests developed for this project on ganache.
5. `truffle migrate --network rinkeby` to migrate and deploy smart contract to test network.


## **OpenSea Market** (test environment)

Once your smart contracts has been deployed, please navigate to the below link in order to see the items minted and listed:

- [Tokens enumerated in the market](https://testnets.opensea.io/collection/real-state-nft) to see on the test OpenSea network the contents for this account. 

![Account on OpenSea test](img/AccountOpenSeaTest.png)

## Transactions on Opensea

- **Buyer account**: [0x77331ea4a5fE2A5897381378E6f19752fce0377e](https://rinkeby.etherscan.io/address/0x77331ea4a5fE2A5897381378E6f19752fce0377e)

- **Owner account**: [0xFEAf61c1814b9342C1533115523bB96458744fb7](https://rinkeby.etherscan.io/address/0xfeaf61c1814b9342c1533115523bb96458744fb7)

By following the above accounts you can see the transactions history:

1. Transfer some ether to be able to buy.
2. Tranfer a token FROM account1 TO account2.
3. Account2 list the previuosly tranferred item for selling.
4. Account1 bougth the token for 2 ETH (plus gas).


## Contract Addresses

### **Verifier**

This contract is the one with zkSNARK solution compiled by **Zocrates**. Once deployed the address is taken and then:

| Syntax | Description |
| ----------- | ----------- |
| Header | Title |
| Paragraph | Text |

- Address Rinkeby: [0x91e929aBC05d7993FCc823246134d47390950Ec0](https://rinkeby.etherscan.io/address/0x91e929aBC05d7993FCc823246134d47390950Ec0)
- ABI: [Verifier.json](build/contracts/Verifier.json)

### **Solution**

- Address Rinkeby: [0x0726d5C1fe7F57900C9a7D2fbF05621b67FFf65d](https://rinkeby.etherscan.io/address/0x0726d5C1fe7F57900C9a7D2fbF05621b67FFf65d)

... is deployed with a reference to **Verifier**, then ready to process and validate solutions.

In the [migrations script](migrations/2_deploy_contracts.js), rigth away the deployments, 3 tokens are:

- Validated
- Added to solutions array
- Minted for being available to transaction through **OpenSea Market Place**.



### License of the project
SPDX-License-Identifier: MIT

### Contact
Luis Chapa: luischapam@hotmail.com