// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

/**
This contracts support a whitelisting approach using a Merkle Proof,
the associated logic for a whitelist and publis sale,
and the option to reserve tokens for the team.

For computing the Merkle Proof in the frontend visint the following repo:
TODO add github link
 */

contract Whitelist721 is
    ERC721,
    ERC721Enumerable,
    Pausable,
    Ownable,
    ERC721Burnable
{
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;
    Counters.Counter private _reserveCounter;

    uint256 public MAX_TOKENS = 1000;

    uint256 public TOKEN_PRICE = 0.1 ether;

    uint256 public MAX_PURCHASE = 2;

    uint256 public MAX_WHITELIST = 1;

    uint256 public RESERVED_TOKENS = 10;

    string public baseURI;

    mapping(address => uint256) public whitelistClaimed;

    bytes32 public merkleRoot;

    bool public whitelistOpen;

    bool public saleOpen;

    constructor() ERC721("MyToken", "MTK") {}

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function withdraw() external onlyOwner {
        uint256 amount = address(this).balance;
        // don't use transfer anymore because gas costs might change in the future
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed.");
    }

    function setMerkleRoot(bytes32 _merkleRoot) external onlyOwner {
        merkleRoot = _merkleRoot;
    }

    function _baseURI() internal view override(ERC721) returns (string memory) {
        return baseURI;
    }

    function setBaseURI(string calldata _URI) external onlyOwner {
        baseURI = _URI;
    }

    function toggleSale() external onlyOwner {
        saleOpen = !saleOpen;
    }

    function toggleWhitelist() external onlyOwner {
        whitelistOpen = !whitelistOpen;
    }

    function purchase(uint256 number) private {
        require(number * TOKEN_PRICE >= msg.value, "Not enough Eth sent.");
        require(
            _tokenIdCounter.current() + number < MAX_TOKENS - RESERVED_TOKENS,
            "Minting over supply."
        );

        for (uint256 i = 0; i < number; i++) {
            // effects
            uint256 tokenId = _tokenIdCounter.current() + RESERVED_TOKENS;
            _tokenIdCounter.increment();

            // interactions
            _safeMint(msg.sender, tokenId);
        }
    }

    function mintPublicSale(uint256 number) external payable {
        // checks
        require(saleOpen, "Public sale hasn't started yet");
        require(number <= MAX_PURCHASE, "Tried minting too many tokens.");

        purchase(number);
    }

    function mintWhitelist(uint256 number, bytes32[] calldata merkleProof)
        external
        payable
    {
        require(whitelistOpen, "Whitelist minting not yet openend.");
        require(
            whitelistClaimed[msg.sender] + number <= MAX_WHITELIST,
            "Can't mint that many token."
        );

        bytes32 leaf = keccak256(abi.encodePacked(msg.sender));
        require(
            MerkleProof.verify(merkleProof, merkleRoot, leaf),
            "Your address is not whitelisted."
        );

        whitelistClaimed[msg.sender] = whitelistClaimed[msg.sender] + number;
        purchase(number);
    }

    function mintReserved(address to, uint256 number) external onlyOwner {
        require(
            _reserveCounter.current() + number < RESERVED_TOKENS,
            "Can't mint more than reserved."
        );

        for (uint256 i = 0; i < number; i++) {
            // effects
            uint256 tokenId = _reserveCounter.current();
            _reserveCounter.increment();

            // interactions
            _safeMint(to, tokenId);
        }
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override(ERC721, ERC721Enumerable) whenNotPaused {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    // The following functions are overrides required by Solidity.

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
