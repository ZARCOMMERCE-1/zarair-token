// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ZarAirToken is ERC20 {
    uint256 public constant INITIAL_SUPPLY = 1_400_000 * 10 ** 18;
    address public constant TOKEN_OWNER =
        0x40a44BCd809d8cfB9449BF7d2f7D249517ddFe09;

    constructor() ERC20("Zar Air", "ZARAI") {
        _mint(TOKEN_OWNER, INITIAL_SUPPLY);
    }
}
