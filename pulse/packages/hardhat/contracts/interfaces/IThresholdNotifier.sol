// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

/// @notice Optional callback invoked when a profile crosses its threshold.
interface IThresholdNotifier {
    function onThresholdReached(bytes32 profileId, bytes32 auditBlobId) external;
}
