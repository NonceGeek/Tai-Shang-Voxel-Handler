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

    mapping (uint256 => string[3]) public tokenURIs;

    constructor() public ERC721("Tai Shang Voxel", "TSV") {
        // Tai Shang Voxel
    }

    // ============ PUBLIC FUNCTIONS FOR MINTING ============

    function mint(string memory uri, string memory url, string memory commit) external returns (uint256){
        uint256 _tokenId = nextTokenId();
        _safeMint(msg.sender, _tokenId);
        tokenURIs[_tokenId][0] = uri;
        tokenURIs[_tokenId][1] = url;
        tokenURIs[_tokenId][2] = commit;
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
        return string(abi.encodePacked(tokenURIs[tokenId][0]));
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "Nonexistent token");
        string memory name = string(abi.encodePacked('Tai Shang Voxel #', tokenId.toString()));
        string memory description = string(abi.encodePacked(
            'A Tai Shang Voxel token created by ', (uint160(ownerOf(tokenId))).toHexString(20), 
            '. To verify, please use commit hash ', tokenURIs[tokenId][2],
            '. To view the artwork, visit ', tokenURIs[tokenId][1]));
        string memory image = tokenImage(tokenId);

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
                              ', "creator":"',
                              (uint160(ownerOf(tokenId))).toHexString(20),
                              '", "image": "',
                              tokenURIs[tokenId][1],
                              '", "external_url": "',
                              tokenURIs[tokenId][1],
                              '", "animation_url": "',
                              tokenURIs[tokenId][1],
                              '", "uri": "',
                              image,
                              '", "commit": "',
                              tokenURIs[tokenId][2],
                              '"}'
                          )
                        )
                    )
              )
          );
    }
}
