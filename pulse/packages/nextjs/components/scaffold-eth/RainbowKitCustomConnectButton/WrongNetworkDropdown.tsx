import { NetworkOptions } from "./NetworkOptions";
import { useDisconnect } from "wagmi";
import { ArrowLeftOnRectangleIcon, ChevronDownIcon } from "@heroicons/react/24/outline";

export const WrongNetworkDropdown = () => {
  const { disconnect } = useDisconnect();

  return (
    <div className="dropdown dropdown-end">
      <label
        tabIndex={0}
        className="btn btn-sm flex h-9 min-h-9 items-center gap-1.5 rounded-2xl border border-pulse-unresponsive/25 bg-pulse-unresponsive/10 px-3 font-medium normal-case text-pulse-unresponsive shadow-none hover:bg-pulse-unresponsive/15"
      >
        <span className="text-xs">Wrong network</span>
        <ChevronDownIcon className="h-3.5 w-3.5 shrink-0" />
      </label>
      <ul tabIndex={0} className="dropdown-content menu pulse-wallet-menu mt-2 gap-0.5">
        <NetworkOptions />
        <li>
          <button
            className="pulse-wallet-menu-item pulse-wallet-menu-danger w-full border-none bg-transparent"
            type="button"
            onClick={() => disconnect()}
          >
            <ArrowLeftOnRectangleIcon className="h-4 w-4 shrink-0" />
            <span>Disconnect</span>
          </button>
        </li>
      </ul>
    </div>
  );
};
