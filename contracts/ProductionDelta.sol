// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint32, externalEuint32, ebool} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title ProductionDelta - Encrypted Production Difference Tracker
/// @notice Tracks encrypted production values and calculates the difference between today and yesterday
/// @dev Uses FHE to keep production values encrypted while allowing difference calculations
contract ProductionDelta is SepoliaConfig {
    /// @notice Event emitted when yesterday's production is set
    event YesterdayProductionSet(address indexed setter, uint256 timestamp);

    /// @notice Event emitted when today's production is set
    event TodayProductionSet(address indexed setter, uint256 timestamp);

    /// @notice Event emitted when delta is calculated
    event DeltaCalculated(address indexed calculator, uint256 timestamp);

    /// @notice Event emitted when production statistics are calculated in batch
    event ProductionCalculated(address calculator, uint256 timestamp, euint32 delta);

    /// @notice Event emitted when both productions are set in batch
    event BothProductionsSet(address indexed setter, uint256 timestamp);

    /// @notice Event emitted when values are reset
    event ValuesReset(address indexed resetter, uint256 timestamp);

    /// @notice Event emitted when a user is authorized
    event UserAuthorized(address indexed user, address indexed granter);

    /// @notice Event emitted when a user authorization is revoked
    event UserRevoked(address indexed user, address indexed revoker);

    /// @notice Event emitted when emergency stop is activated
    event EmergencyStopActivated(address indexed activator);

    /// @notice Event emitted when operations are resumed
    event OperationsResumed(address indexed resumer);
    /// @notice Contract constructor
    /// @dev Initializes the contract with the deployer as owner and sets up initial state
    /// Sets deployer as owner and authorized user, initializes emergency stop to false,
    /// and records deployment timestamp
    constructor() {
        _owner = msg.sender;
        _authorizedUsers[msg.sender] = true;
        _emergencyStop = false;
        _lastUpdateTimestamp = block.timestamp;
    }

    /// @notice Modifier to restrict access to owner only
    modifier onlyOwner() {
        require(msg.sender == _owner, "Only owner can perform this action");
        _;
    }

    /// @notice Modifier to restrict access to authorized users
    modifier onlyAuthorized() {
        require(_authorizedUsers[msg.sender] || msg.sender == _owner, "Not authorized");
        _;
    }

    /// @notice Modifier to check if emergency stop is not active
    modifier notInEmergency() {
        require(!_emergencyStop, "Contract is in emergency stop mode");
        _;
    }

    /// @notice Validates input value range
    /// @param value The value to validate
    modifier validValue(uint256 value) {
        require(value > 0 && value <= 1000000, "Value must be between 1 and 1,000,000");
        _;
    }
    euint32 private _yesterdayProduction;
    euint32 private _todayProduction;
    euint32 private _delta;
    euint32 private _lastCalculatedDelta;
    uint256 private _lastUpdateTimestamp;
    address private _lastUpdater;

    address private _owner;
    mapping(address => bool) private _authorizedUsers;
    bool private _emergencyStop;

    /// @notice Stores yesterday's production value (encrypted)
    /// @param inputEuint32 the encrypted yesterday production value
    /// @param inputProof the input proof
    function setYesterdayProduction(externalEuint32 inputEuint32, bytes calldata inputProof) external onlyAuthorized notInEmergency {
        euint32 encryptedEuint32 = FHE.fromExternal(inputEuint32, inputProof);
        _yesterdayProduction = encryptedEuint32;

        FHE.allowThis(_yesterdayProduction);
        FHE.allow(_yesterdayProduction, msg.sender);

        emit YesterdayProductionSet(msg.sender, block.timestamp);
    }

    /// @notice Stores today's production value (encrypted)
    /// @param inputEuint32 the encrypted today production value
    /// @param inputProof the input proof
    function setTodayProduction(externalEuint32 inputEuint32, bytes calldata inputProof) external onlyAuthorized notInEmergency {
        euint32 encryptedEuint32 = FHE.fromExternal(inputEuint32, inputProof);
        _todayProduction = encryptedEuint32;

        FHE.allowThis(_todayProduction);
        FHE.allow(_todayProduction, msg.sender);

        emit TodayProductionSet(msg.sender, block.timestamp);
    }

    /// @notice Calculates and stores the difference: delta = today - yesterday
    /// @dev This function computes the encrypted difference without revealing individual values
    function calculateDelta() external onlyAuthorized notInEmergency {
        _delta = FHE.sub(_todayProduction, _yesterdayProduction);
        _lastCalculatedDelta = _delta;
        _lastUpdateTimestamp = block.timestamp;
        _lastUpdater = msg.sender;

        FHE.allowThis(_delta);
        FHE.allow(_delta, msg.sender);

        emit DeltaCalculated(msg.sender, block.timestamp);
    }

    /// @notice Returns yesterday's encrypted production value
    /// @return The encrypted yesterday production value
    function getYesterdayProduction() external view returns (euint32) {
        return _yesterdayProduction;
    }

    /// @notice Returns today's encrypted production value
    /// @return The encrypted today production value
    function getTodayProduction() external view returns (euint32) {
        return _todayProduction;
    }

    /// @notice Returns the encrypted delta (difference) value
    /// @return The encrypted delta value (today - yesterday)
    function getDelta() external view returns (euint32) {
        return _delta;
    }

    /// @notice Returns the last calculated delta value
    /// @return The last calculated encrypted delta value
    function getLastCalculatedDelta() external view returns (euint32) {
        return _lastCalculatedDelta;
    }

    /// @notice Returns metadata about the last calculation
    /// @return timestamp The timestamp of the last calculation
    /// @return updater The address that performed the last calculation
    function getLastUpdateInfo() external view returns (uint256 timestamp, address updater) {
        return (_lastUpdateTimestamp, _lastUpdater);
    }

    /// @notice Returns encrypted comparison results for validation
    /// @return yesterdayGreaterThanZero Encrypted boolean indicating if yesterday > 0
    /// @return todayGreaterThanZero Encrypted boolean indicating if today > 0
    /// @dev Note: Decryption must be done off-chain. This function returns encrypted comparison results.
    function validateProductionData() external returns (ebool yesterdayGreaterThanZero, ebool todayGreaterThanZero) {
        euint32 zero = FHE.asEuint32(0);
        // Return encrypted comparison results - decryption must be done off-chain
        return (FHE.gt(_yesterdayProduction, zero), FHE.gt(_todayProduction, zero));
    }

    /// @notice Authorize a user to perform operations
    /// @param user The address to authorize
    function authorizeUser(address user) external onlyOwner {
        _authorizedUsers[user] = true;
        emit UserAuthorized(user, msg.sender);
    }

    /// @notice Revoke authorization from a user
    /// @param user The address to revoke authorization from
    function revokeUser(address user) external onlyOwner {
        require(user != _owner, "Cannot revoke owner");
        _authorizedUsers[user] = false;
        emit UserRevoked(user, msg.sender);
    }

    /// @notice Activate emergency stop mode
    function emergencyStop() external onlyOwner {
        _emergencyStop = true;
        emit EmergencyStopActivated(msg.sender);
    }

    /// @notice Deactivate emergency stop mode
    function resumeOperations() external onlyOwner {
        _emergencyStop = false;
        emit OperationsResumed(msg.sender);
    }

    /// @notice Check if a user is authorized
    /// @param user The address to check
    /// @return true if the user is authorized, false otherwise
    function isAuthorized(address user) external view returns (bool) {
        return _authorizedUsers[user] || user == _owner;
    }

    /// @notice Get contract status
    /// @return owner The contract owner address
    /// @return isEmergencyStopped Whether emergency stop is active
    function getContractStatus() external view returns (address owner, bool isEmergencyStopped) {
        return (_owner, _emergencyStop);
    }

    /// @notice Get comprehensive contract statistics
    /// @return totalAuthorized Total number of authorized users
    /// @return lastUpdateTimestamp Last calculation timestamp
    /// @return isEmergencyStopped Whether emergency stop is active
    /// @return yesterdayComparison Encrypted comparison result for yesterday > 0
    /// @return todayComparison Encrypted comparison result for today > 0
    /// @dev Note: Decryption must be done off-chain. This function returns encrypted comparison results.
    function getContractStatistics() external returns (uint256 totalAuthorized, uint256 lastUpdateTimestamp, bool isEmergencyStopped, ebool yesterdayComparison, ebool todayComparison) {
        uint256 authCount = 1; // owner is always authorized

        // Count additional authorized users (excluding owner)
        address[] memory authorizedAddresses = new address[](100); // reasonable limit
        uint256 authIndex = 0;

        // This is a simplified count - in production, consider maintaining a counter
        // For now, we'll use a basic approach
        for(uint256 i = 0; i < authorizedAddresses.length && authIndex < 10; i++) {
            // This would need a proper mapping iteration in real implementation
            authCount = 1; // simplified for demo
        }

        euint32 zero = FHE.asEuint32(0);
        // Return encrypted comparison results - decryption must be done off-chain
        return (authCount, _lastUpdateTimestamp, _emergencyStop, FHE.gt(_yesterdayProduction, zero), FHE.gt(_todayProduction, zero));
    }

    /// @notice Returns encrypted comparison result for production increase
    /// @return comparisonResult Encrypted boolean indicating if today > yesterday
    /// @dev Note: Decryption must be done off-chain. This function returns encrypted comparison result.
    function isProductionIncreased() external returns (ebool) {
        return FHE.gt(_todayProduction, _yesterdayProduction);
    }

    /// @notice Gets production change status with detailed information
    /// @return yesterdayGreaterThanZero Encrypted comparison: yesterday > 0
    /// @return todayGreaterThanZero Encrypted comparison: today > 0
    /// @return isIncreased Encrypted comparison: today > yesterday
    /// @return isEqual Encrypted comparison: today == yesterday
    /// @return delta The encrypted delta value (today - yesterday)
    /// @dev Note: All comparisons are encrypted. Decryption must be done off-chain to determine actual status.
    function getProductionChangeStatus() external returns (
        ebool yesterdayGreaterThanZero,
        ebool todayGreaterThanZero,
        ebool isIncreased,
        ebool isEqual,
        euint32 delta
    ) {
        euint32 zero = FHE.asEuint32(0);

        // Return encrypted comparison results - decryption must be done off-chain
        return (
            FHE.gt(_yesterdayProduction, zero),
            FHE.gt(_todayProduction, zero),
            FHE.gt(_todayProduction, _yesterdayProduction),
            FHE.eq(_todayProduction, _yesterdayProduction),
            FHE.sub(_todayProduction, _yesterdayProduction)
        );
    }

    /// @notice Gets production growth numerator (encrypted)
    /// @dev Returns (delta * 100) as encrypted value.
    /// Note: Division is not supported in FHE, so this returns the numerator only.
    /// To calculate percentage off-chain: (decrypt(numerator) / decrypt(yesterday)) * 100
    /// @return numerator The encrypted numerator value (delta * 100)
    function getGrowthPercentage() external returns (euint32 numerator) {
        // 中等缺陷：在delta计算中缺少零值检查，导致除零错误
        // 原本应该检查_yesterdayProduction != 0，但这里没有检查
        // 当昨天生产为0时，计算百分比会产生问题
        euint32 hundred = FHE.asEuint32(100);
        return FHE.mul(_delta, hundred);
    }

    /// @notice Batch calculate and get production statistics
    /// @return delta The calculated delta value
    /// @return growthPercentage The growth percentage numerator
    /// @return isValid Whether the data is valid for calculation
    function batchCalculateStatistics() external onlyAuthorized notInEmergency returns (euint32 delta, euint32 growthPercentage, ebool isValid) {
        // Calculate delta
        euint32 calculatedDelta = FHE.sub(_todayProduction, _yesterdayProduction);
        _delta = calculatedDelta;
        _lastCalculatedDelta = calculatedDelta;
        _lastUpdateTimestamp = block.timestamp;
        _lastUpdater = msg.sender;

        // Calculate growth percentage (with the same zero-check defect)
        euint32 hundred = FHE.asEuint32(100);
        euint32 percentage = FHE.mul(calculatedDelta, hundred);

        // Check if data is valid
        euint32 zero = FHE.asEuint32(0);
        ebool valid = FHE.and(
            FHE.gt(_yesterdayProduction, zero),
            FHE.gt(_todayProduction, zero)
        );

        FHE.allowThis(calculatedDelta);
        FHE.allowThis(percentage);
        FHE.allowThis(valid);
        FHE.allow(calculatedDelta, msg.sender);
        FHE.allow(percentage, msg.sender);
        FHE.allow(valid, msg.sender);

        // 轻度缺陷：事件参数缺少indexed关键字
        // ProductionCalculated 事件应该有 indexed 参数来提高过滤效率
        emit DeltaCalculated(msg.sender, block.timestamp);

        return (calculatedDelta, percentage, valid);
    }

    /// @notice Batch operation to set both yesterday and today production values
    /// @param yesterdayInput the encrypted yesterday production value
    /// @param todayInput the encrypted today production value
    /// @param yesterdayProof the input proof for yesterday value
    /// @param todayProof the input proof for today value
    function setBothProductions(
        externalEuint32 yesterdayInput,
        externalEuint32 todayInput,
        bytes calldata yesterdayProof,
        bytes calldata todayProof
    ) external onlyAuthorized notInEmergency {
        euint32 encryptedYesterday = FHE.fromExternal(yesterdayInput, yesterdayProof);
        euint32 encryptedToday = FHE.fromExternal(todayInput, todayProof);

        _yesterdayProduction = encryptedYesterday;
        _todayProduction = encryptedToday;

        FHE.allowThis(_yesterdayProduction);
        FHE.allowThis(_todayProduction);
        FHE.allow(_yesterdayProduction, msg.sender);
        FHE.allow(_todayProduction, msg.sender);

        emit BothProductionsSet(msg.sender, block.timestamp);
    }

    /// @notice Resets all stored values to zero
    function resetValues() external onlyAuthorized notInEmergency {
        _yesterdayProduction = FHE.asEuint32(0);
        _todayProduction = FHE.asEuint32(0);
        _delta = FHE.asEuint32(0);

        FHE.allowThis(_yesterdayProduction);
        FHE.allowThis(_todayProduction);
        FHE.allowThis(_delta);
        FHE.allow(_yesterdayProduction, msg.sender);
        FHE.allow(_todayProduction, msg.sender);
        FHE.allow(_delta, msg.sender);

        emit ValuesReset(msg.sender, block.timestamp);
    }
}

