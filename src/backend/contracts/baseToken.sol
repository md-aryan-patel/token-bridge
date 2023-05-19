// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BaseToken is ERC20 {
    mapping(address => bool) isValid;
    address public admin;

    constructor(
        string memory _name,
        string memory _symbol
    ) ERC20(_name, _symbol) {
        admin = msg.sender;
        isValid[admin] = true;
    }

    modifier isAdmin() {
        require(msg.sender == admin, "Token: Not an admin");
        _;
    }

    modifier isValidator() {
        require(isValid[msg.sender] == true, "Token: Not an validator");
        _;
    }

    function addValidato(address newAdmin) external isAdmin {
        isValid[newAdmin] = true;
    }

    function mint(address to, uint amount) external isValidator {
        _mint(to, amount);
    }

    function burn(address owner, uint amount) external isValidator {
        _burn(owner, amount);
    }
}
