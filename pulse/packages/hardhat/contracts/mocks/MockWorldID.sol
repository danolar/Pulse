// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IWorldID} from "../interfaces/IWorldID.sol";

/// @dev Testnet-local stand-in for WorldIDRouter.verifyProof.
contract MockWorldID is IWorldID {
    bool public shouldRevert;

    function setShouldRevert(bool value) external {
        shouldRevert = value;
    }

    function verifyProof(
        uint256,
        uint256,
        uint256,
        uint256,
        uint256,
        uint256[8] calldata
    ) external view {
        if (shouldRevert) {
            revert("MockWorldID: invalid proof");
        }
    }
}
