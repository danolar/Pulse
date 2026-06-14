// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IThresholdNotifier} from "./interfaces/IThresholdNotifier.sol";

/// @title PulseOracle v0.1 - Core accumulator
/// @notice Minimal version: profile creation, adapter authorization, signal reporting, threshold detection.
/// @dev World ID, attempts, windows, commit-reveal, block/resurrect are added in subsequent iterations.

contract PulseOracle {

    // ============ Enums ============

    enum LifecycleState {
        NONE,              // 0 - never created
        ACTIVE,            // 1 - operating
        THRESHOLD_REACHED, // 2 - weight crossed threshold
        FINAL              // 3 - outcome finalized
    }

    enum SignalDirection {
        NEGATIVE, // adds weight toward threshold
        POSITIVE  // resets accumulated weight
    }

    // ============ Constants ============

    uint8 public constant CAP_NEGATIVE = 1;
    uint8 public constant CAP_POSITIVE = 2;

    // ============ Structs ============

    struct Config {
        uint32 threshold;           // total weight that triggers event
        uint32 missedAttemptWeight; // reserved for attempts layer (v0.3)
    }

    struct Profile {
        address owner;
        address consumer;
        LifecycleState state;
        uint32 epoch;
        uint32 accumulatedWeight;
        address notificationTarget;
        Config config;
    }

    struct AdapterAuth {
        bool authorized;
        uint32 weight;
        uint8 capabilities;   // CAP_NEGATIVE | CAP_POSITIVE bitmask
        bytes32 typeLabel;
    }

    // ============ Storage ============

    mapping(bytes32 => Profile) public profiles;
    mapping(bytes32 => mapping(address => AdapterAuth)) public adapters;
    mapping(bytes32 => address[]) internal _adapterList;

    // ============ Events (public layer - no weights or direction) ============

    event ProfileCreated(
        bytes32 indexed profileId,
        address indexed owner,
        address indexed consumer,
        uint64 timestamp
    );

    event ConfigUpdated(bytes32 indexed profileId, uint32 threshold);

    event NotificationTargetSet(bytes32 indexed profileId, address target);

    event AdapterAuthorized(
        bytes32 indexed profileId,
        address indexed adapter,
        uint8 capabilities,
        bytes32 typeLabel
    );

    event AdapterRevoked(bytes32 indexed profileId, address indexed adapter);

    // SignalReported is PUBLIC: no weight, no direction, no accumulated total
    event SignalReported(
        bytes32 indexed profileId,
        address indexed reporter,
        bytes32 walrusBlobId,
        uint32 epoch,
        uint64 timestamp
    );

    event WeightReset(bytes32 indexed profileId, uint32 epoch);

    event ThresholdReached(
        bytes32 indexed profileId,
        uint32 epoch,
        bytes32 auditBlobId,
        uint64 timestamp
    );

    event Finalized(bytes32 indexed profileId, uint32 epoch);

    // ============ Errors ============

    error ProfileExists();
    error ProfileMissing();
    error NotConsumer();
    error NotOwner();
    error NotAuthorizedAdapter();
    error CapabilityNotAllowed();
    error WrongState(LifecycleState current);
    error ZeroAddress();
    error ZeroThreshold();
    error ZeroWeight();
    error WeightExceedsThreshold();
    error AdapterNotAuthorized();

    // ============ Modifiers ============

    modifier onlyConsumer(bytes32 profileId) {
        if (profiles[profileId].consumer != msg.sender) revert NotConsumer();
        _;
    }

    modifier profileExists(bytes32 profileId) {
        if (profiles[profileId].state == LifecycleState.NONE) revert ProfileMissing();
        _;
    }

    // ============ View helpers ============

    /// @notice Compute profileId from owner and consumer addresses
    function computeProfileId(address owner, address consumer) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(owner, consumer));
    }

    /// @notice Get the list of adapter addresses for a profile
    function getAdapters(bytes32 profileId) external view returns (address[] memory) {
        return _adapterList[profileId];
    }

    // ============ Profile creation ============

    /// @notice Create a profile. msg.sender is the consumer. owner is the user being monitored.
    /// @dev In later versions, owner must provide a World ID proof here.
    function createProfile(
        address owner,
        uint32 threshold
    ) external returns (bytes32 profileId) {
        if (owner == address(0)) revert ZeroAddress();
        if (threshold == 0) revert ZeroThreshold();

        profileId = computeProfileId(owner, msg.sender);
        if (profiles[profileId].state != LifecycleState.NONE) revert ProfileExists();

        profiles[profileId] = Profile({
            owner: owner,
            consumer: msg.sender,
            state: LifecycleState.ACTIVE,
            epoch: 1,
            accumulatedWeight: 0,
            notificationTarget: address(0),
            config: Config({
                threshold: threshold,
                missedAttemptWeight: 0
            })
        });

        emit ProfileCreated(profileId, owner, msg.sender, uint64(block.timestamp));
        emit ConfigUpdated(profileId, threshold);

        return profileId;
    }

    // ============ Configuration ============

    function setConfig(
        bytes32 profileId,
        uint32 threshold
    ) external onlyConsumer(profileId) profileExists(profileId) {
        if (threshold == 0) revert ZeroThreshold();

        Profile storage p = profiles[profileId];
        p.config.threshold = threshold;
        emit ConfigUpdated(profileId, threshold);

        if (p.state == LifecycleState.ACTIVE && p.accumulatedWeight >= threshold) {
            _reachThreshold(profileId, bytes32(0));
        }
    }

    function setNotificationTarget(
        bytes32 profileId,
        address target
    ) external onlyConsumer(profileId) profileExists(profileId) {
        profiles[profileId].notificationTarget = target;
        emit NotificationTargetSet(profileId, target);
    }

    // ============ Adapter management ============

    function authorizeAdapter(
        bytes32 profileId,
        address adapter,
        uint32 weight,
        uint8 capabilities,
        bytes32 typeLabel
    ) external onlyConsumer(profileId) profileExists(profileId) {
        if (adapter == address(0)) revert ZeroAddress();
        if (weight == 0) revert ZeroWeight();
        if (capabilities == 0 || capabilities > 3) revert CapabilityNotAllowed();

        uint32 threshold = profiles[profileId].config.threshold;
        if (weight > threshold) revert WeightExceedsThreshold();

        bool isNew = !adapters[profileId][adapter].authorized;

        adapters[profileId][adapter] = AdapterAuth({
            authorized: true,
            weight: weight,
            capabilities: capabilities,
            typeLabel: typeLabel
        });

        if (isNew) {
            _adapterList[profileId].push(adapter);
        }

        emit AdapterAuthorized(profileId, adapter, capabilities, typeLabel);
    }

    function revokeAdapter(
        bytes32 profileId,
        address adapter
    ) external onlyConsumer(profileId) profileExists(profileId) {
        if (!adapters[profileId][adapter].authorized) revert AdapterNotAuthorized();

        adapters[profileId][adapter].authorized = false;

        address[] storage adapterList = _adapterList[profileId];
        uint256 length = adapterList.length;
        for (uint256 i = 0; i < length; ++i) {
            if (adapterList[i] == adapter) {
                adapterList[i] = adapterList[length - 1];
                adapterList.pop();
                break;
            }
        }

        emit AdapterRevoked(profileId, adapter);
    }

    // ============ Signal reporting (the core) ============

    /// @notice Report a signal for a profile. Called by authorized adapters.
    function reportSignal(
        bytes32 profileId,
        SignalDirection direction,
        bytes32 walrusBlobId
    ) external profileExists(profileId) {
        Profile storage p = profiles[profileId];
        AdapterAuth storage auth = adapters[profileId][msg.sender];

        if (!auth.authorized) revert NotAuthorizedAdapter();

        if (direction == SignalDirection.NEGATIVE && (auth.capabilities & CAP_NEGATIVE) == 0) {
            revert CapabilityNotAllowed();
        }
        if (direction == SignalDirection.POSITIVE && (auth.capabilities & CAP_POSITIVE) == 0) {
            revert CapabilityNotAllowed();
        }

        if (p.state != LifecycleState.ACTIVE) revert WrongState(p.state);

        if (direction == SignalDirection.NEGATIVE) {
            p.accumulatedWeight += auth.weight;
        } else {
            p.accumulatedWeight = 0;
            emit WeightReset(profileId, p.epoch);
        }

        emit SignalReported(profileId, msg.sender, walrusBlobId, p.epoch, uint64(block.timestamp));

        if (p.accumulatedWeight >= p.config.threshold) {
            _reachThreshold(profileId, walrusBlobId);
        }
    }

    // ============ Manual check-in (owner resets weight) ============

    /// @notice Owner checks in, resetting accumulated weight.
    /// @dev In later versions this requires a World ID proof.
    function checkin(bytes32 profileId) external profileExists(profileId) {
        Profile storage p = profiles[profileId];
        if (msg.sender != p.owner) revert NotOwner();
        if (p.state != LifecycleState.ACTIVE) revert WrongState(p.state);

        p.accumulatedWeight = 0;
        emit WeightReset(profileId, p.epoch);
        emit SignalReported(profileId, msg.sender, bytes32(0), p.epoch, uint64(block.timestamp));
    }

    // ============ Finalization ============

    /// @notice Finalize a profile that has reached threshold (no challenge period in v0.1)
    function finalize(bytes32 profileId) external profileExists(profileId) {
        Profile storage p = profiles[profileId];
        if (p.state != LifecycleState.THRESHOLD_REACHED) revert WrongState(p.state);
        p.state = LifecycleState.FINAL;
        emit Finalized(profileId, p.epoch);
    }

    // ============ Internal ============

    function _reachThreshold(bytes32 profileId, bytes32 auditBlobId) internal {
        Profile storage p = profiles[profileId];
        p.state = LifecycleState.THRESHOLD_REACHED;

        emit ThresholdReached(profileId, p.epoch, auditBlobId, uint64(block.timestamp));

        if (p.notificationTarget != address(0)) {
            try IThresholdNotifier(p.notificationTarget).onThresholdReached(profileId, auditBlobId) {} catch {}
        }
    }
}