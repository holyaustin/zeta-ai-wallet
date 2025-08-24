// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IZetaHub {
    function send(
        uint256 destinationChainId,
        address destinationAddress,
        uint256 destinationGasLimit,
        uint256 zetaValue,
        uint256 zetaGasLimit,
        bytes calldata message
    ) external;
}