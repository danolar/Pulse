// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @dev Semaphore-compatible hashing aligned with Pulse frontend action/signal strings.
library PulseWorldId {
    function hashToField(bytes memory value) internal pure returns (uint256) {
        return uint256(keccak256(value)) >> 8;
    }

    /// @notice Matches `worldIdActions.checkin(normalizeAddress(owner))` in pulseProtocol.ts
    function checkinAction(address owner) internal pure returns (bytes memory) {
        return abi.encodePacked("checkin-", addressToLowerHex(owner));
    }

    function checkinExternalNullifierHash(address owner) internal pure returns (uint256) {
        return hashToField(checkinAction(owner));
    }

    /// @notice Matches IDKit `signal={profileKey}` where profileKey is normalized owner address.
    function checkinSignalHash(address owner) internal pure returns (uint256) {
        return hashToField(abi.encodePacked(addressToLowerHex(owner)));
    }

    function addressToLowerHex(address addr) internal pure returns (string memory) {
        bytes memory buffer = new bytes(42);
        buffer[0] = "0";
        buffer[1] = "x";
        for (uint256 i = 0; i < 20; ++i) {
            uint8 value = uint8(uint256(uint160(addr)) / (2 ** (8 * (19 - i))));
            buffer[2 + i * 2] = _hexChar(value >> 4);
            buffer[3 + i * 2] = _hexChar(value & 0x0f);
        }
        return string(buffer);
    }

    function _hexChar(uint8 value) private pure returns (bytes1) {
        if (value < 10) {
            return bytes1(value + 48);
        }
        return bytes1(value + 87);
    }
}
