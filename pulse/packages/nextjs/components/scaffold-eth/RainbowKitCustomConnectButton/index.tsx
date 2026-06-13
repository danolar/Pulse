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
import { useNetworkColor } from "~~/hooks/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";

/**
 * Custom Wagmi Connect Button (watch balance + custom design)
 */
export const RainbowKitCustomConnectButton = () => {
  const networkColor = useNetworkColor();
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
                return <div className="btn btn-primary btn-sm h-8 min-h-8 w-[5.5rem] shrink-0 opacity-0" aria-hidden />;
              }

              if (!connected) {
                return (
                  <button className="btn btn-primary btn-sm whitespace-nowrap" onClick={openConnectModal} type="button">
                    Connect
                  </button>
                );
              }

              if (chain.unsupported || chain.id !== targetNetwork.id) {
                return <WrongNetworkDropdown />;
              }

              return (
                <div className="flex h-8 max-w-full items-center gap-1 sm:gap-2">
                  <div className="hidden min-w-[9.5rem] items-center gap-1.5 whitespace-nowrap md:flex md:gap-2">
                    <Balance
                      address={account.address as Address}
                      style={{
                        minHeight: "0",
                        height: "auto",
                        fontSize: "0.75rem",
                        lineHeight: "1",
                      }}
                    />
                    <span
                      className="badge badge-sm max-w-[5.5rem] shrink-0 truncate border-none px-2 font-medium normal-case"
                      style={{
                        color: networkColor,
                        backgroundColor: `color-mix(in srgb, ${networkColor} 18%, transparent)`,
                      }}
                      title={chain.name}
                    >
                      {chain.name}
                    </span>
                  </div>
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
