//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import 'base64-sol/base64.sol';

import './HexStrings.sol';

contract TaiShangVoxel is ERC721Enumerable, Ownable{

    using Strings for uint256;
    using HexStrings for uint160;
    using Counters for Counters.Counter;
    Counters.Counter private tokenCounter;

    // string private baseURI = "https://arweave.net/";
    mapping (uint256 => string) public tokenURIs;

    constructor() public ERC721("Tai Shang Voxel", "TSV") {
        // Tai Shang Voxel
    }

    // ============ PUBLIC FUNCTIONS FOR MINTING ============

    function mint(string memory uriId) external returns (uint256){
        uint256 _tokenId = nextTokenId();
        _safeMint(msg.sender, _tokenId);
        tokenURIs[_tokenId] = uriId;
        return _tokenId;
    }

    // ============ PUBLIC READ-ONLY FUNCTIONS ============

    function getLastTokenId() external view returns (uint256) {
        return tokenCounter.current();
    }

    // ============ SUPPORTING FUNCTIONS ============
    
    function nextTokenId() private returns (uint256) {
        tokenCounter.increment();
        return tokenCounter.current();
    }

    function tokenImage(uint256 tokenId) public view returns (string memory) {
        require(_exists(tokenId), "Nonexistent token");
        return string(abi.encodePacked(tokenURIs[tokenId]));
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "Nonexistent token");
        string memory name = string(abi.encodePacked('Tai Shang Voxel #', tokenId.toString()));
        string memory description = string(abi.encodePacked('A Tai Shang Voxel token created'));
        string memory image = string(abi.encodePacked(tokenURIs[tokenId]));

        return
          string(
              abi.encodePacked(
                'data:application/json;base64,',
                Base64.encode(
                    bytes(
                          abi.encodePacked(
                              '{"name":"',
                              name,
                              '", "description":"',
                              description,
                              '", "attributes": []',
                              ', "owner":"',
                              (uint160(ownerOf(tokenId))).toHexString(20),
                              '", "image": "',
                              image,
                              '"}'
                          )
                        )
                    )
              )
          );
    }
}
