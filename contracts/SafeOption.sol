// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SafeOption is ERC20, Ownable {

    uint256 constant private LOCK_TIME = 6 * 30 days;
    uint256 immutable private _deploymentTimestamp;

    mapping(address => bool) public whitelist;

    constructor(address firstHolder, address[] memory _whitelist) ERC20("SafeOption", "SAFE") {
        _deploymentTimestamp = block.timestamp;

        _mint(firstHolder, 10_000_000 * 10 ** decimals());

        for (uint256 i; i < _whitelist.length;) {
            whitelist[_whitelist[i]] = true;
            unchecked {
                i++;
            }
        }
    }

    function mint(uint256 amount) external onlyOwner {
        _mint(msg.sender, amount);
    }

    function whitelistAccount(address account) external onlyOwner {
        whitelist[account] = true;
    }

    function removeWhitelist(address account) external onlyOwner {
        whitelist[account] = false;
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount)
    internal
    override
    {
        if ((_deploymentTimestamp + LOCK_TIME) > block.timestamp) {
            require(whitelist[from] || from == owner() || from == address(0), "transfer is not allowed");
        }

        super._beforeTokenTransfer(from, to, amount);
    }
}
