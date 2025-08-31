// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

// ✅ Only one import — brings in UniversalContract, GatewayZEVM, IZRC20, RevertContext, etc.
import "@zetachain/protocol-contracts/contracts/zevm/GatewayZEVM.sol";

// ✅ For emergency token withdrawal
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title OmniLend
 * @dev Cross-chain lending protocol on ZetaChain.
 * Users deposit on any chain → borrow on any chain.
 * Uses ZetaChain's Universal Contract pattern with Gateway.
 */
contract OmniLend is UniversalContract {
    // 🚀 ZetaChain Testnet (Athens) Gateway
    GatewayZEVM public immutable gateway =
        GatewayZEVM(payable(0x6c533f7fE93fAE114d0954697069Df33C9B74fD7)); 

    // Protocol owner (for emergency functions)
    address public owner;

    // 50% Loan-to-Value (LTV) in basis points
    uint256 public constant LTV_BPS = 5000;

    // User loan position
    struct Position {
        address asset;           // ZRC-20 token (bridged asset)
        uint256 depositAmount;
        uint256 debt;
        uint256 depositChainId;  // source chain ID (e.g., 5 = Goerli)
        bool exists;
    }

    // Mapping: user → loan position
    mapping(address => Position) public positions;

    // Events
    event Deposited(address indexed user, uint256 amount, address indexed asset, uint256 indexed chainId);
    event Borrowed(address indexed user, uint256 amount, address indexed zrc20, uint256 indexed destChainId);
    event Repaid(address indexed user);
    event Liquidated(address indexed user);
    event RevertEvent(string message, RevertContext revertContext);

    // Custom Errors
    error Unauthorized();
    error InvalidAsset();
    error OverLTV();

    // Modifiers
    modifier onlyGateway() {
        if (msg.sender != address(gateway)) revert Unauthorized();
        _;
    }

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @dev Entry point: called when user deposits + calls from connected chain
     * Triggered by Gateway when a cross-chain message arrives
     */
    function onCall(
        MessageContext calldata context,
        address zrc20,
        uint256 amount,
        bytes calldata message
    ) external override onlyGateway {
        // Decode sender and source chain ID from message
        (address sender, uint256 sourceChainId) = abi.decode(message, (address, uint256));

        // Validate zrc20 (ZetaChain's representation of bridged asset)
        if (zrc20 == address(0)) revert InvalidAsset();

        // Create or update position
        if (!positions[sender].exists) {
            positions[sender] = Position({
                asset: zrc20,
                depositAmount: amount,
                debt: 0,
                depositChainId: sourceChainId,
                exists: true
            });
        } else {
            positions[sender].depositAmount += amount;
        }

        emit Deposited(sender, amount, zrc20, sourceChainId);
    }

    /**
     * @dev Borrow asset on any chain
     * @param amount Amount to borrow
     * @param zrc20Asset ZRC-20 token to receive (e.g., USDC.z)
     * @param destChainId Destination chain (e.g., 84532 = Base Sepolia)
     * @param receiver Receiver address on destination chain (bytes32 padded)
     * @param gasLimit Gas limit for execution on destination
     * @param isArbitraryCall Whether to call an arbitrary function
     */
    function borrow(
        uint256 amount,
        address zrc20Asset,
        uint256 destChainId,
        bytes memory receiver,
        uint256 gasLimit,
        bool isArbitraryCall
    ) external {
        Position storage pos = positions[msg.sender];
        require(pos.exists, "OmniLend: no deposit");

        uint256 maxBorrow = (pos.depositAmount * LTV_BPS) / 10000;
        if (pos.debt + amount > maxBorrow) revert OverLTV();

        pos.debt += amount;

        // Approve Gateway to spend ZRC-20
        IZRC20(zrc20Asset).approve(address(gateway), amount);

        // Send via Gateway
        gateway.call(
            receiver,
            zrc20Asset,
            "", // no calldata
            CallOptions(gasLimit, isArbitraryCall),
            RevertOptions(
                payable(msg.sender),
                true,
                payable(address(this)),
                "",
                100_000
            )
        );

        emit Borrowed(msg.sender, amount, zrc20Asset, destChainId);
    }

    /**
     * @dev Repay loan
     */
    function repay() external {
        require(positions[msg.sender].exists, "OmniLend: no position");
        positions[msg.sender].debt = 0;
        emit Repaid(msg.sender);
    }

    /**
     * @dev Liquidate undercollateralized position (owner-only)
     */
    function liquidate(address borrower) external onlyOwner {
        Position storage pos = positions[borrower];
        require(pos.exists, "OmniLend: no position");

        uint256 maxBorrow = (pos.depositAmount * LTV_BPS) / 10000;
        require(pos.debt > maxBorrow, "OmniLend: healthy position");

        delete positions[borrower];
        emit Liquidated(borrower);
    }

    /**
     * @dev Handle revert from failed outgoing call
     */
    function onRevert(RevertContext calldata revertContext) external onlyGateway {
        emit RevertEvent("OmniLend: Revert received", revertContext);
        // In practice: refund, alert, retry
    }

    /**
     * @dev Emergency: withdraw stuck ERC-20 tokens
     */
    function withdrawToken(address token, address to, uint256 amount) external onlyOwner {
        IERC20(token).transfer(to, amount);
    }

    /**
     * @dev Allow receiving native ZETA
     */
    receive() external payable {}
}