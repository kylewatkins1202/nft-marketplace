// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFT is ERC721URIStorage {
    // Keep track of increment
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    
    // Address of marketplace to interact with.
    address contractAddress;

    constructor(address marketplaceAddress) ERC721("Metaverse Token", "METT") {
        contractAddress = marketplaceAddress;
    }

    function createToken(string memory tokenURI) public returns(uint) {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();

        // Mint Token
        _mint(msg.sender, newItemId);

        // Set Token URI
        _setTokenURI(newItemId, tokenURI);

        // Set approval for all
        setApprovalForAll(contractAddress, true);
        
        // Return so we can set it for sale
        return newItemId;
    }
}