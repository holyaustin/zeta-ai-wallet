// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ZetaInterfaces {
    struct ZetaMessage {
        bytes32 nonce;
        uint256 sourceChainId;
        bytes sourceAddress;
        bytes destinationAddress;
        bytes payload;
        uint256 gasLimit;
        uint256 zetaTxGasPrice;
        uint256 zetaTxGasLimit;
        uint256 zetaAmount;
        bytes messageBytes;
    }

    struct ZetaParams {
        uint256 gasLimit;
        uint256 gasPrice;
        uint256 zetaValue;
        bytes32 destinationAddress;
        uint256 destinationChainId;
    }
}

interface IZetaReceiver {
    function onZetaReceived(ZetaInterfaces.ZetaMessage calldata message) external;
}