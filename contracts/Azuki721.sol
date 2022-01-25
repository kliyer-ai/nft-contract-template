// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "./ERC721A.sol";

contract Azuki721 is ERC721A, Pausable, Ownable {
    constructor() ERC721A("MyToken", "MTK", 5) {}

    function safeMint(address to, uint256 quantity) public {
        _safeMint(to, quantity);
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function _beforeTokenTransfers(
        address from,
        address to,
        uint256 startTokenId,
        uint256 quantity
    ) internal override(ERC721A) whenNotPaused {
        super._beforeTokenTransfers(from, to, startTokenId, quantity);
    }
}
