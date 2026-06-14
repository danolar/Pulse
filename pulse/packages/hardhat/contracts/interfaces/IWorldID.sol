// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice World ID Router (Sepolia: 0x469449f251692e0779667583026b5a1e99512157)
interface IWorldID {
    function verifyProof(
        uint256 root,
        uint256 groupId,
        uint256 signalHash,
        uint256 nullifierHash,
        uint256 externalNullifierHash,
        uint256[8] calldata proof
    ) external view;
}
