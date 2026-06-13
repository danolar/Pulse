// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import { IThresholdConsumer } from "./interfaces/IThresholdConsumer.sol";

/// @title PulseOracle
/// @notice MVP weighted signal accumulator for Pulse profiles (hackathon cut).
/// @dev World ID binding and full attempt engine ship in follow-up iterations.
contract PulseOracle {
    enum Lifecycle {
        Created,
        Active,
        Evaluating,
        ThresholdReached,
        Blocked
    }

    struct Profile {
        bool exists;
        Lifecycle lifecycle;
        uint64 epoch;
        uint256 accumulatedWeight;
        uint256 threshold;
        uint64 lastOnchainActivityAt;
    }

    address public admin;
    address public notificationTarget;

    mapping(address => Profile) public profiles;
    mapping(address => bool) public authorizedAdapters;

    event ProfileSeeded(address indexed profileOwner, uint256 threshold);
    event AdapterAuthorized(address indexed adapter, bool authorized);
    event NotificationTargetUpdated(address indexed target);
    event SignalReported(
        address indexed profileOwner,
        bytes32 indexed signalType,
        int256 weight,
        string walrusBlobId,
        address indexed reporter
    );
    event KeeperAction(address indexed profileOwner, bytes32 action, address indexed reporter);
    event ThresholdReached(address indexed profileOwner, uint64 epoch, string auditBlobId);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    modifier onlyAdapter() {
        require(authorizedAdapters[msg.sender], "Not adapter");
        _;
    }

    constructor(address _admin) {
        admin = _admin;
    }

    function setAdapter(address adapter, bool authorized) external onlyAdmin {
        authorizedAdapters[adapter] = authorized;
        emit AdapterAuthorized(adapter, authorized);
    }

    function setNotificationTarget(address target) external onlyAdmin {
        notificationTarget = target;
        emit NotificationTargetUpdated(target);
    }

    /// @dev Local/demo helper until createProfile is wired with World ID proofs.
    function devSeedProfile(address profileOwner, uint256 threshold) external onlyAdmin {
        profiles[profileOwner] = Profile({
            exists: true,
            lifecycle: Lifecycle.Active,
            epoch: 1,
            accumulatedWeight: 0,
            threshold: threshold,
            lastOnchainActivityAt: uint64(block.timestamp)
        });
        emit ProfileSeeded(profileOwner, threshold);
    }

    /// @notice CRE ONCHAIN_TX adapter entrypoint after offchain inactivity evaluation.
    function reportSignal(
        address profileOwner,
        bytes32 signalType,
        int256 weight,
        string calldata walrusBlobId
    ) external onlyAdapter {
        Profile storage profile = profiles[profileOwner];
        require(profile.exists, "Profile missing");
        require(profile.lifecycle == Lifecycle.Active || profile.lifecycle == Lifecycle.Evaluating, "Not active");

        if (weight < 0) {
            uint256 added = uint256(-weight);
            profile.accumulatedWeight += added;
        } else if (weight > 0) {
            // Positive proof-of-life resets current window weight (spec §4.1).
            profile.accumulatedWeight = 0;
        }

        if (bytes32("ONCHAIN_TX") == signalType && weight > 0) {
            profile.lastOnchainActivityAt = uint64(block.timestamp);
        }

        emit SignalReported(profileOwner, signalType, weight, walrusBlobId, msg.sender);

        if (profile.accumulatedWeight >= profile.threshold) {
            profile.lifecycle = Lifecycle.ThresholdReached;
            emit ThresholdReached(profileOwner, profile.epoch, walrusBlobId);

            if (notificationTarget != address(0)) {
                (bool ok, ) = notificationTarget.call(
                    abi.encodeWithSelector(
                        IThresholdConsumer.onThresholdReached.selector,
                        profileOwner,
                        walrusBlobId
                    )
                );
                ok;
            }
        }
    }

    /// @notice CRE keeper hook — logs intended attempt lifecycle actions for MVP simulation.
    function keeperTick(address[] calldata profileOwners, bytes32[] calldata actions) external onlyAdapter {
        require(profileOwners.length == actions.length, "Length mismatch");

        for (uint256 i = 0; i < profileOwners.length; i++) {
            address owner = profileOwners[i];
            require(profiles[owner].exists, "Profile missing");
            emit KeeperAction(owner, actions[i], msg.sender);
        }
    }
}
