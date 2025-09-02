// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

// ✅ Correct import — IGatewayEVM is the unified gateway interface
import "@zetachain/protocol-contracts/contracts/evm/interfaces/IGatewayEVM.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title ConnectedContract
 * @dev Deploys on Base (Sepolia/Mainnet) to call OmniLend on ZetaChain via depositAndCall
 */
contract ConnectedContract {
    IGatewayEVM public immutable gateway;
    address public immutable omniLend;

    event DepositAndCallTriggered(address indexed sender, uint256 amount);

    constructor(address gateway_, address omniLend_) {
        gateway = IGatewayEVM(gateway_);
        omniLend = omniLend_;
    }

    /**
     * @dev Deposit ETH and call OmniLend on ZetaChain
     */
    function depositEthAndCall() external payable {
        require(msg.value > 0, "No ETH sent");

        // Encode: (sender, sourceChainId)
        bytes memory message = abi.encode(msg.sender, block.chainid);

        gateway.depositAndCall{value: msg.value}(
            omniLend,
            message,
            RevertOptions({
                revertAddress: payable(address(this)),
                callOnRevert: false,
                abortAddress: payable(address(0)),
                revertMessage: "",
                onRevertGasLimit: 0
            })
        );

        emit DepositAndCallTriggered(msg.sender, msg.value);
    }

    /**
     * @dev Deposit ERC-20 and call OmniLend
     */
    function depositErc20AndCall(
        address token,
        uint256 amount
    ) external {
        require(amount > 0, "No tokens sent");

        IERC20(token).transferFrom(msg.sender, address(this), amount);
        IERC20(token).approve(address(gateway), amount);

        bytes memory message = abi.encode(msg.sender, block.chainid);

        gateway.depositAndCall(
            omniLend,
            amount,
            token,
            message,
            RevertOptions({
                revertAddress: payable(address(this)),
                callOnRevert: false,
                abortAddress: payable(address(0)),
                revertMessage: "",
                onRevertGasLimit: 0
            })
        );

        emit DepositAndCallTriggered(msg.sender, amount);
    }

    // Allow receiving ETH
    receive() external payable {}
}