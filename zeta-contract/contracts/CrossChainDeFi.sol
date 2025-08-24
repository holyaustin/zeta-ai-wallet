// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./interfaces/IZetaReceiver.sol";
import "./interfaces/IZetaHub.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract CrossChainDeFi is IZetaReceiver {
    IZetaHub public zetaHub;
    address public owner;

    // Arbitrum Sepolia: Aave V3 LendingPool
    address constant AAVE_POOL = 0x5C8D3139E58B8E58B973A52f5c18aB2242885824;
    // USDC on Arbitrum Sepolia
    address constant USDC = 0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d;

    // ZRC20 USDC on ZetaChain
    IERC20 public constant zrc20USDC = IERC20(0x57B1eF088334374773128D2879b53911f348b99b);

    constructor(address _zetaHub) {
        zetaHub = IZetaHub(_zetaHub);
        owner = msg.sender;
    }

    function onZetaReceived(
        ZetaInterfaces.ZetaMessage calldata message
    ) external override {}

    function approveUSDC(uint256 amount) external {
        zrc20USDC.approve(address(zetaHub), amount);
    }

function depositToAaveOnArbitrumSepolia(uint256 amount) external {
    // ✅ Correct signature: no spaces
    bytes memory callData = abi.encodeWithSignature(
        "deposit(address,uint256,address,uint16)",
        USDC,
        amount,
        msg.sender,
        uint16(0) // referralCode
    );

    zetaHub.send(
        421614,           // Arbitrum Sepolia
        payable(AAVE_POOL),
        0,                // destinationGasLimit
        amount,           // zetaValue (bridged USDC amount)
        0,                // zetaGasLimit (optional, can be 0)
        callData
    );
}

    receive() external payable {}
}