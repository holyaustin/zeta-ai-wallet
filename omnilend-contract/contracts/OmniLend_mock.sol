// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "@zetachain/protocol-contracts/contracts/zevm/GatewayZEVM.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract OmniLendMock is UniversalContract {
    GatewayZEVM public immutable gateway =
        GatewayZEVM(payable(0x6c533f7fE93fAE114d0954697069Df33C9B74fD7)); // Athens); // Athens

    address public owner;
    uint256 public constant LTV_BPS = 5000;

    struct Position {
        address asset;
        uint256 depositAmount;
        uint256 debt;
        uint256 depositChainId;
        bool exists;
    }

    mapping(address => Position) public positions;

    event Deposited(address indexed user, uint256 amount, address indexed asset, uint256 indexed chainId);
    event Borrowed(address indexed user, uint256 amount, address indexed zrc20, uint256 indexed destChainId);
    event Repaid(address indexed user);
    event Liquidated(address indexed user);
    event RevertEvent(string message, RevertContext revertContext); // ✅ No 'calldata'

    error Unauthorized();
    error InvalidAsset();
    error OverLTV();

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

    // 🔁 Real onCall — we won't call this in tests
    function onCall(
        MessageContext calldata context,
        address zrc20,
        uint256 amount,
        bytes calldata message
    ) external override onlyGateway {
        (address sender, uint256 sourceChainId) = abi.decode(message, (address, uint256));

        if (zrc20 == address(0)) revert InvalidAsset();

        Position storage pos = positions[sender];

        if (!pos.exists) {
            pos.asset = zrc20;
            pos.depositAmount = amount;
            pos.debt = 0;
            pos.depositChainId = sourceChainId;
            pos.exists = true;
        } else {
            pos.depositAmount += amount;
        }

        emit Deposited(sender, amount, zrc20, sourceChainId);
    }

    // ✅ Test-only: mock deposit (bypass onCall)
    function mockDeposit(
        address user,
        uint256 amount,
        address asset,
        uint256 sourceChainId
    ) external onlyOwner {
        Position storage pos = positions[user];

        if (!pos.exists) {
            pos.asset = asset;
            pos.depositAmount = amount;
            pos.debt = 0;
            pos.depositChainId = sourceChainId;
            pos.exists = true;
        } else {
            pos.depositAmount += amount;
        }

        emit Deposited(user, amount, asset, sourceChainId);
    }

    function borrow(
        uint256 amount,
        address zrc20Asset,
        uint256 destChainId,
        bytes memory receiver,
        uint256 gasLimit,
        bool isArbitraryCall
    ) external {
        Position storage pos = positions[msg.sender];
        require(pos.exists, "No deposit");

        uint256 maxBorrow = (pos.depositAmount * LTV_BPS) / 10000;
        if (pos.debt + amount > maxBorrow) revert OverLTV();

        pos.debt += amount;

        IZRC20(zrc20Asset).approve(address(gateway), amount);

        gateway.call(
            receiver,
            zrc20Asset,
            "",
            CallOptions(gasLimit, isArbitraryCall),
            RevertOptions(payable(msg.sender), true, payable(address(this)), "", 100000)
        );

        emit Borrowed(msg.sender, amount, zrc20Asset, destChainId);
    }

    function repay() external {
        require(positions[msg.sender].exists, "No position");
        positions[msg.sender].debt = 0;
        emit Repaid(msg.sender);
    }

    function liquidate(address borrower) external onlyOwner {
        Position storage pos = positions[borrower];
        require(pos.exists, "No position");
        uint256 maxBorrow = (pos.depositAmount * LTV_BPS) / 10000;
        require(pos.debt > maxBorrow, "Healthy");
        delete positions[borrower];
        emit Liquidated(borrower);
    }

    function onRevert(RevertContext calldata revertContext) external onlyGateway {
        emit RevertEvent("Revert", revertContext);
    }

    function withdrawToken(address token, address to, uint256 amount) external onlyOwner {
        IERC20(token).transfer(to, amount);
    }

    receive() external payable {}
}