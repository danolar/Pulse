"use client";

// @refresh reset
import { AddressInfoDropdown } from "./AddressInfoDropdown";
import { AddressQRCodeModal } from "./AddressQRCodeModal";
import { RevealBurnerPKModal } from "./RevealBurnerPKModal";
import { WrongNetworkDropdown } from "./WrongNetworkDropdown";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Balance } from "@scaffold-ui/components";
import { getBlockExplorerAddressLink } from "@scaffold-ui/hooks";
import { Address } from "viem";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";

/**
 * Custom Wagmi Connect Button (watch balance + custom design)
 */
export const RainbowKitCustomConnectButton = () => {
  const { targetNetwork } = useTargetNetwork();

  return (
    <ConnectButton.Custom>
      {({ account, chain, openConnectModal, mounted }) => {
        const connected = mounted && account && chain;
        const blockExplorerAddressLink = account
          ? getBlockExplorerAddressLink(targetNetwork, account.address)
          : undefined;

        return (
          <>
            {(() => {
              if (!mounted) {
                return (
                  <div className="pulse-wallet-connect w-[7.5rem] shrink-0 opacity-0" aria-hidden>
                    Connect
                  </div>
                );
              }

              if (!connected) {
                return (
                  <button className="pulse-wallet-connect whitespace-nowrap" onClick={openConnectModal} type="button">
                    Connect wallet
                  </button>
                );
              }

              if (chain.unsupported || chain.id !== targetNetwork.id) {
                return <WrongNetworkDropdown />;
              }

              return (
                <div className="pulse-wallet-cluster gap-0.5 sm:gap-1">
                  <div className="pulse-wallet-balance">
                    <Balance
                      address={account.address as Address}
                      style={{
                        minHeight: "0",
                        height: "auto",
                        fontSize: "0.75rem",
                        lineHeight: "1.25",
                        fontWeight: 500,
                      }}
                    />
                  </div>
                  <span className="pulse-wallet-network" title={chain.name}>
                    {chain.name}
                  </span>
                  <AddressInfoDropdown
                    address={account.address as Address}
                    displayName={account.displayName}
                    ensAvatar={account.ensAvatar}
                    blockExplorerAddressLink={blockExplorerAddressLink}
                  />
                  <AddressQRCodeModal address={account.address as Address} modalId="qrcode-modal" />
                  <RevealBurnerPKModal />
                </div>
              );
            })()}
          </>
        );
      }}
    </ConnectButton.Custom>
  );
};
