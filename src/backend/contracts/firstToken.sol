// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./baseToken.sol";

contract firstToken is BaseToken {
    constructor() BaseToken("UETHER", "UETH") {}
}
