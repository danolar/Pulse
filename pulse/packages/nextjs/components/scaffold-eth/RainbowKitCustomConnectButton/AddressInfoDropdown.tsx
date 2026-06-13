import { useRef, useState } from "react";
import { NetworkOptions } from "./NetworkOptions";
import { getAddress } from "viem";
import { Address } from "viem";
import { useAccount, useDisconnect } from "wagmi";
import {
  ArrowLeftOnRectangleIcon,
  ArrowTopRightOnSquareIcon,
  ArrowsRightLeftIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  DocumentDuplicateIcon,
  EyeIcon,
  QrCodeIcon,
} from "@heroicons/react/24/outline";
import { BlockieAvatar } from "~~/components/scaffold-eth";
import { useCopyToClipboard, useOutsideClick } from "~~/hooks/scaffold-eth";
import { getTargetNetworks } from "~~/utils/scaffold-eth";
import { isENS } from "~~/utils/scaffold-eth/common";

const BURNER_WALLET_ID = "burnerWallet";

const allowedNetworks = getTargetNetworks();

type AddressInfoDropdownProps = {
  address: Address;
  blockExplorerAddressLink: string | undefined;
  displayName: string;
  ensAvatar?: string;
};

export const AddressInfoDropdown = ({
  address,
  ensAvatar,
  displayName,
  blockExplorerAddressLink,
}: AddressInfoDropdownProps) => {
  const { disconnect } = useDisconnect();
  const { connector } = useAccount();
  const checkSumAddress = getAddress(address);

  const { copyToClipboard: copyAddressToClipboard, isCopiedToClipboard: isAddressCopiedToClipboard } =
    useCopyToClipboard();
  const [selectingNetwork, setSelectingNetwork] = useState(false);
  const dropdownRef = useRef<HTMLDetailsElement>(null);

  const closeDropdown = () => {
    setSelectingNetwork(false);
    dropdownRef.current?.removeAttribute("open");
  };

  useOutsideClick(dropdownRef, closeDropdown);

  const menuItemClass = "pulse-wallet-menu-item w-full cursor-pointer border-none bg-transparent";

  return (
    <details ref={dropdownRef} className="dropdown dropdown-end leading-3">
      <summary className="pulse-wallet-address dropdown-toggle list-none [&::-webkit-details-marker]:hidden">
        <BlockieAvatar address={checkSumAddress} size={28} ensImage={ensAvatar} />
        <span className="max-w-[5.5rem] truncate text-xs font-medium sm:max-w-[6.5rem]">
          {isENS(displayName) ? displayName : `${checkSumAddress.slice(0, 6)}…${checkSumAddress.slice(-4)}`}
        </span>
        <ChevronDownIcon className="h-3.5 w-3.5 shrink-0 text-pulse-muted" />
      </summary>
      <ul className="dropdown-content menu pulse-wallet-menu gap-0.5">
        <NetworkOptions hidden={!selectingNetwork} />
        <li className={selectingNetwork ? "hidden" : ""}>
          <button
            className={menuItemClass}
            type="button"
            onClick={() => copyAddressToClipboard(checkSumAddress)}
          >
            {isAddressCopiedToClipboard ? (
              <>
                <CheckCircleIcon className="h-4 w-4 shrink-0 text-success" aria-hidden="true" />
                <span className="whitespace-nowrap">Copied</span>
              </>
            ) : (
              <>
                <DocumentDuplicateIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="whitespace-nowrap">Copy address</span>
              </>
            )}
          </button>
        </li>
        <li className={selectingNetwork ? "hidden" : ""}>
          <label htmlFor="qrcode-modal" className={`${menuItemClass} cursor-pointer`}>
            <QrCodeIcon className="h-4 w-4 shrink-0" />
            <span className="whitespace-nowrap">View QR code</span>
          </label>
        </li>
        <li className={selectingNetwork ? "hidden" : ""}>
          <a
            target="_blank"
            href={blockExplorerAddressLink}
            rel="noopener noreferrer"
            className={menuItemClass}
          >
            <ArrowTopRightOnSquareIcon className="h-4 w-4 shrink-0" />
            <span className="whitespace-nowrap">Block explorer</span>
          </a>
        </li>
        {allowedNetworks.length > 1 ? (
          <li className={selectingNetwork ? "hidden" : ""}>
            <button
              className={menuItemClass}
              type="button"
              onClick={() => {
                setSelectingNetwork(true);
              }}
            >
              <ArrowsRightLeftIcon className="h-4 w-4 shrink-0" />
              <span>Switch network</span>
            </button>
          </li>
        ) : null}
        {connector?.id === BURNER_WALLET_ID ? (
          <li>
            <label
              htmlFor="reveal-burner-pk-modal"
              className={`${menuItemClass} pulse-wallet-menu-danger cursor-pointer`}
            >
              <EyeIcon className="h-4 w-4 shrink-0" />
              <span>Reveal private key</span>
            </label>
          </li>
        ) : null}
        <li className={selectingNetwork ? "hidden" : ""}>
          <button
            className={`${menuItemClass} pulse-wallet-menu-danger`}
            type="button"
            onClick={() => disconnect()}
          >
            <ArrowLeftOnRectangleIcon className="h-4 w-4 shrink-0" />
            <span>Disconnect</span>
          </button>
        </li>
      </ul>
    </details>
  );
};
