// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

interface IThresholdConsumer {
    function onThresholdReached(address profileOwner, string calldata auditBlobId) external;
}
