// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

// ✅ Only one ZetaChain import
import "@zetachain/protocol-contracts/contracts/zevm/GatewayZEVM.sol";

// ✅ Import IERC20 for token transfers
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title OmniLend
 * @dev Cross-chain lending protocol on ZetaChain.
 * Supports native & ERC-20 deposits, borrow via withdrawAndCall.
 */
contract OmniLend is UniversalContract {
    // ✅ Correct checksummed Gateway address
    GatewayZEVM public immutable gateway =
        GatewayZEVM(payable(0x6c533f7fE93fAE114d0954697069Df33C9B74fD7));

    address public owner;

    // 50% LTV
    uint256 public constant LTV_BPS = 5000;

    struct Position {
        address asset;           // ZRC-20 token
        uint256 depositAmount;
        uint256 debt;
        uint256 depositChainId;  // must be passed in message
        bool exists;
    }

    mapping(address => Position) public positions;

    // Events
    event Deposited(address indexed user, uint256 amount, address indexed asset, uint256 indexed chainId);
    event Borrowed(address indexed user, uint256 amount, address indexed zrc20, uint256 indexed destChainId);
    event Repaid(address indexed user);
    event Liquidated(address indexed user);
    event RevertEvent(string message, RevertContext revertContext);

    // Errors
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
     * @param context.sender = sender on source chain
     * @param context.chainID = destination chain ID (always 7000 on ZetaChain)
     * @param message = (sender, asset, sourceChainId) — we decode source chain here
     */
    function onCall(
        MessageContext calldata context,
        address zrc20,
        uint256 amount,
        bytes calldata message
    ) external override onlyGateway {
        // ✅ Decode: user, asset, and sourceChainId from message
        (address sender, address asset, uint256 sourceChainId) = abi.decode(
            message,
            (address, address, uint256)
        );

        if (zrc20 == address(0)) revert InvalidAsset();

        Position storage pos = positions[sender];

        if (!pos.exists) {
            pos.asset = zrc20;
            pos.depositAmount = amount;
            pos.debt = 0;
            pos.depositChainId = sourceChainId; // ✅ Store source chain ID from message
            pos.exists = true;
        } else {
            pos.depositAmount += amount;
        }

        // ✅ Emit with sourceChainId (from message), not context.chainID
        emit Deposited(sender, amount, zrc20, sourceChainId);
    }

    /**
     * @dev Borrow: send ZRC-20 as native/ERC-20 to user on any chain
     */
    function borrow(
        uint256 amount,
        address zrc20Asset,
        uint256 destChainId,
        bytes memory receiver,
        CallOptions calldata callOptions,
        RevertOptions calldata revertOptions
    ) external {
        Position storage pos = positions[msg.sender];
        require(pos.exists, "OmniLend: no deposit");

        uint256 maxBorrow = (pos.depositAmount * LTV_BPS) / 10000;
        if (pos.debt + amount > maxBorrow) revert OverLTV();

        pos.debt += amount;

        // Approve Gateway to spend ZRC-20
        IZRC20(zrc20Asset).approve(address(gateway), amount);

        // Withdraw native asset on destination chain
        gateway.withdrawAndCall(
            receiver,
            amount,
            zrc20Asset,
            "", // no calldata
            callOptions,
            revertOptions
        );

        emit Borrowed(msg.sender, amount, zrc20Asset, destChainId);
    }

    /**
     * @dev Repay debt
     */
    function repay() external {
        require(positions[msg.sender].exists, "OmniLend: no position");
        positions[msg.sender].debt = 0;
        emit Repaid(msg.sender);
    }

    /**
     * @dev Liquidate undercollateralized loan
     */
    function liquidate(address borrower) external onlyOwner {
        Position storage pos = positions[borrower];
        require(pos.exists, "OmniLend: no position");

        uint256 maxBorrow = (pos.depositAmount * LTV_BPS) / 10000;
        require(pos.debt > maxBorrow, "OmniLend: healthy");

        delete positions[borrower];
        emit Liquidated(borrower);
    }

    /**
     * @dev Handle failed outgoing call
     */
    function onRevert(RevertContext calldata revertContext) external onlyGateway {
        emit RevertEvent("OmniLend: Revert received", revertContext);
    }

    /**
     * @dev Emergency: withdraw stuck tokens
     */
    function withdrawToken(address token, address to, uint256 amount) external onlyOwner {
        IERC20(token).transfer(to, amount);
    }

    /**
     * @dev Allow receiving ZETA
     */
    receive() external payable {}
}