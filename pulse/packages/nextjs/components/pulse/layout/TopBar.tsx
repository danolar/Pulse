"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { hardhat } from "viem/chains";
import { useAccount } from "wagmi";
import { Bug, Cable, LayoutDashboard, Lock, Menu, Search, Settings } from "lucide-react";
import { PulseLogo } from "~~/components/pulse/brand/PulseLogo";
import { AddressSearchBar } from "~~/components/pulse/explorer/AddressSearchBar";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { SHOW_SCAFFOLD_DEV_UI } from "~~/constants/pulseAppConfig";
import { useOutsideClick } from "~~/hooks/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";

type NavLink = {
  label: string;
  href: string;
  icon?: React.ReactNode;
  matchPrefix?: boolean;
};

const Wordmark = () => (
  <Link href="/" className="flex min-w-0 items-center py-1">
    <PulseLogo height={48} />
  </Link>
);

const WalletConnectButton = () => (
  <div className="flex min-w-0 items-center justify-end">
    <RainbowKitCustomConnectButton />
  </div>
);

const ConnectionKitButton = ({ onOpen }: { onOpen: () => void }) => (
  <button
    type="button"
    className="btn btn-ghost btn-sm btn-square rounded-xl"
    aria-label="Open connection kit"
    onClick={onOpen}
  >
    <Cable className="h-4 w-4" />
  </button>
);

type TopBarProps = {
  onOpenConnectionKit: () => void;
};

export const TopBar = ({ onOpenConnectionKit }: TopBarProps) => {
  const pathname = usePathname();
  const { address } = useAccount();
  const { targetNetwork } = useTargetNetwork();
  const isLocalNetwork = targetNetwork.id === hardhat.id;

  const appNavLinks: NavLink[] = useMemo(() => {
    const locked = !address;
    return [
      { label: "Explorer", href: "/explorer", matchPrefix: true },
      {
        label: "Setup",
        href: "/setup",
        icon: locked ? <Lock className="h-3.5 w-3.5 shrink-0 opacity-60" /> : <Settings className="h-4 w-4 shrink-0" />,
      },
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: locked ? (
          <Lock className="h-3.5 w-3.5 shrink-0 opacity-60" />
        ) : (
          <LayoutDashboard className="h-4 w-4 shrink-0" />
        ),
        matchPrefix: true,
      },
    ];
  }, [address]);

  const devNavLinks: NavLink[] = useMemo(() => {
    const links: NavLink[] = [];
    if (SHOW_SCAFFOLD_DEV_UI) {
      links.push({ label: "Debug Contracts", href: "/debug", icon: <Bug className="h-4 w-4 shrink-0" /> });
      if (isLocalNetwork) {
        links.push({ label: "Block Explorer", href: "/blockexplorer", icon: <Search className="h-4 w-4 shrink-0" /> });
      }
    }
    return links;
  }, [isLocalNetwork]);

  const mobileNavLinks = useMemo(() => [...appNavLinks, ...devNavLinks], [appNavLinks, devNavLinks]);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);
  useOutsideClick(mobileMenuRef, closeMobileMenu);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const isNavActive = (href: string, matchPrefix?: boolean) => {
    if (matchPrefix) return pathname === href || pathname.startsWith(`${href}/`);
    return pathname === href;
  };

  const navLinkClassName = (href: string, matchPrefix?: boolean) =>
    `flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
      isNavActive(href, matchPrefix)
        ? "bg-primary/10 text-primary"
        : "text-base-content/75 hover:bg-base-300/60 hover:text-base-content"
    }`;

  return (
    <header className="sticky top-0 z-20 shrink-0 border-b border-base-content/5 pulse-glass pt-[env(safe-area-inset-top)]">
      <div className="pulse-page-x mx-auto flex min-h-16 max-w-7xl flex-wrap items-center justify-between gap-3 py-2">
        <div className="flex min-w-0 items-center gap-1">
          <div className="relative shrink-0 lg:hidden" ref={mobileMenuRef}>
            <button
              type="button"
              className="btn btn-ghost btn-circle hover:bg-transparent"
              aria-label="Open navigation menu"
              aria-expanded={mobileMenuOpen}
              onClick={event => {
                event.stopPropagation();
                setMobileMenuOpen(open => !open);
              }}
            >
              <Menu className="h-5 w-5" />
            </button>

            {mobileMenuOpen ? (
              <ul className="menu absolute left-0 top-full z-50 mt-2 w-56 rounded-2xl border border-base-content/5 bg-base-100 p-2 shadow-pulse-md">
                {mobileNavLinks.map(({ label, href, icon, matchPrefix }) => (
                  <li key={href}>
                    <Link href={href} className={navLinkClassName(href, matchPrefix)} onClick={closeMobileMenu}>
                      {icon}
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <Wordmark />
        </div>

        <div className="hidden min-w-0 flex-1 justify-center px-2 md:flex">
          <AddressSearchBar className="w-full max-w-md" />
        </div>

        <div className="flex shrink-0 flex-nowrap items-center gap-1 sm:gap-2">
          <nav className="hidden items-center gap-0.5 lg:flex" aria-label="App navigation">
            {appNavLinks.map(({ label, href, icon, matchPrefix }) => (
              <Link key={href} href={href} className={navLinkClassName(href, matchPrefix)}>
                {icon}
                {label}
              </Link>
            ))}
          </nav>

          <ConnectionKitButton onOpen={onOpenConnectionKit} />
          <WalletConnectButton />
        </div>
      </div>

      <div className="pulse-page-x mx-auto flex pb-2 md:hidden">
        <AddressSearchBar className="w-full" />
      </div>
    </header>
  );
};
