// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {
    SafeERC20
} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {
    ReentrancyGuard
} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract ZarAirTokenSale is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    uint256 public constant PRICE_DENOMINATOR = 1e18;

    IERC20 public immutable zaraiToken;
    IERC20 public immutable paymentToken;
    address public treasury;
    uint256 public tokenPrice;
    bool public saleEnabled;

    event TokensPurchased(
        address indexed buyer,
        uint256 zaraiAmount,
        uint256 paymentAmount
    );
    event PriceUpdated(uint256 oldPrice, uint256 newPrice);
    event SaleStatusUpdated(bool enabled);
    event UnsoldTokensWithdrawn(address indexed to, uint256 amount);
    event AccidentalTokensWithdrawn(
        address indexed token,
        address indexed to,
        uint256 amount
    );
    event TreasuryUpdated(
        address indexed oldTreasury,
        address indexed newTreasury
    );

    constructor(
        address zaraiTokenAddress,
        address paymentTokenAddress,
        address treasuryAddress,
        uint256 initialTokenPrice
    ) Ownable(msg.sender) {
        if (zaraiTokenAddress == address(0)) {
            revert("ZARAI token address is zero");
        }
        if (paymentTokenAddress == address(0)) {
            revert("Payment token address is zero");
        }
        if (treasuryAddress == address(0)) {
            revert("Treasury address is zero");
        }
        if (initialTokenPrice == 0) {
            revert("Initial price is zero");
        }

        zaraiToken = IERC20(zaraiTokenAddress);
        paymentToken = IERC20(paymentTokenAddress);
        treasury = treasuryAddress;
        tokenPrice = initialTokenPrice;
    }

    function setTokenPrice(uint256 newTokenPrice) external onlyOwner {
        if (newTokenPrice == 0) {
            revert("Price is zero");
        }

        uint256 oldPrice = tokenPrice;
        tokenPrice = newTokenPrice;

        emit PriceUpdated(oldPrice, newTokenPrice);
    }

    function setSaleEnabled(bool enabled) external onlyOwner {
        saleEnabled = enabled;

        emit SaleStatusUpdated(enabled);
    }

    function setTreasury(address newTreasury) external onlyOwner {
        if (newTreasury == address(0)) {
            revert("Treasury address is zero");
        }

        address oldTreasury = treasury;
        treasury = newTreasury;

        emit TreasuryUpdated(oldTreasury, newTreasury);
    }

    function buyTokens(uint256 zaraiAmount) external nonReentrant {
        if (!saleEnabled) {
            revert("Sale is disabled");
        }
        if (zaraiAmount == 0) {
            revert("Amount is zero");
        }
        if (zaraiToken.balanceOf(address(this)) < zaraiAmount) {
            revert("Insufficient ZARAI in sale contract");
        }

        uint256 paymentAmount = (zaraiAmount * tokenPrice) / PRICE_DENOMINATOR;

        paymentToken.safeTransferFrom(msg.sender, treasury, paymentAmount);
        zaraiToken.safeTransfer(msg.sender, zaraiAmount);

        emit TokensPurchased(msg.sender, zaraiAmount, paymentAmount);
    }

    function withdrawUnsoldTokens(
        address to,
        uint256 amount
    ) external onlyOwner nonReentrant {
        if (to == address(0)) {
            revert("Recipient address is zero");
        }

        zaraiToken.safeTransfer(to, amount);

        emit UnsoldTokensWithdrawn(to, amount);
    }

    function withdrawAccidentalERC20(
        address tokenAddress,
        address to,
        uint256 amount
    ) external onlyOwner nonReentrant {
        if (tokenAddress == address(0)) {
            revert("Token address is zero");
        }
        if (tokenAddress == address(zaraiToken)) {
            revert("Use withdrawUnsoldTokens");
        }
        if (to == address(0)) {
            revert("Recipient address is zero");
        }

        IERC20(tokenAddress).safeTransfer(to, amount);

        emit AccidentalTokensWithdrawn(tokenAddress, to, amount);
    }
}
