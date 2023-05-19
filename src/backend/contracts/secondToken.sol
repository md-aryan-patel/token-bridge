// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./baseToken.sol";

contract secondToken is BaseToken {
    constructor() BaseToken("UBITCOIN", "UBIT") {}
}
