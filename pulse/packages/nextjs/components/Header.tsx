"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { hardhat } from "viem/chains";
import { Bug, Menu, Search, Settings } from "lucide-react";
import { PulseLogo } from "~~/components/pulse/brand/PulseLogo";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { SHOW_SCAFFOLD_DEV_UI } from "~~/constants/pulseAppConfig";
import { useOutsideClick } from "~~/hooks/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { usePulseStore } from "~~/services/store/pulseStore";
import type { ActingRole } from "~~/types/pulse";

type NavLink = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

const ActingAsSelect = ({
  actingAs,
  onChange,
  className = "",
  selectClassName = "",
}: {
  actingAs: ActingRole;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  className?: string;
  selectClassName?: string;
}) => (
  <label className={`flex min-w-0 items-center gap-2 ${className}`}>
    <span className="shrink-0 whitespace-nowrap pulse-label normal-case tracking-normal text-pulse-muted">
      Acting as
    </span>
    <select
      className={`select select-bordered select-sm h-9 min-h-9 rounded-2xl ${selectClassName}`}
      value={actingAs}
      onChange={onChange}
      aria-label="Acting as"
    >
      <option value="owner">Owner</option>
      <option value="requestor">Requestor</option>
    </select>
  </label>
);

export const Header = () => {
  const pathname = usePathname();
  const { actingAs, setActingAs } = usePulseStore();
  const { targetNetwork } = useTargetNetwork();
  const isLocalNetwork = targetNetwork.id === hardhat.id;

  const navLinks: NavLink[] = useMemo(() => {
    const links: NavLink[] = [
      { label: "Console", href: "/" },
      { label: "Setup", href: "/setup", icon: <Settings className="h-4 w-4 shrink-0" /> },
    ];

    if (SHOW_SCAFFOLD_DEV_UI) {
      links.push({ label: "Debug Contracts", href: "/debug", icon: <Bug className="h-4 w-4 shrink-0" /> });
      if (isLocalNetwork) {
        links.push({ label: "Block Explorer", href: "/blockexplorer", icon: <Search className="h-4 w-4 shrink-0" /> });
      }
    }

    return links;
  }, [isLocalNetwork]);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);
  useOutsideClick(mobileMenuRef, closeMobileMenu);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleActingChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setActingAs(event.target.value as ActingRole);
  };

  const navLinkClassName = (href: string) =>
    `flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
      pathname === href
        ? "bg-primary/10 text-primary"
        : "text-base-content/75 hover:bg-base-300/60 hover:text-base-content"
    }`;

  return (
    <header className="sticky top-0 z-20 shrink-0 border-b border-base-content/5 pulse-glass pt-[env(safe-area-inset-top)]">
      <div className="pulse-page-x mx-auto flex h-14 max-w-7xl flex-nowrap items-center justify-between gap-2">
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
                {SHOW_SCAFFOLD_DEV_UI ? (
                  <li className="px-1 py-1 md:hidden">
                    <ActingAsSelect
                      actingAs={actingAs}
                      onChange={handleActingChange}
                      className="w-full"
                      selectClassName="min-w-0 flex-1"
                    />
                  </li>
                ) : null}
                {navLinks.map(({ label, href, icon }) => (
                  <li key={href}>
                    <Link href={href} className={navLinkClassName(href)} onClick={closeMobileMenu}>
                      {icon}
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <Link href="/" passHref className="flex min-w-0 items-center">
            <PulseLogo />
          </Link>

          <nav className="ml-2 hidden items-center gap-0.5 lg:flex" aria-label="Main navigation">
            {navLinks.map(({ label, href, icon }) => (
              <Link key={href} href={href} className={navLinkClassName(href)}>
                {icon}
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex h-9 shrink-0 flex-nowrap items-center gap-1 sm:gap-2">
          {SHOW_SCAFFOLD_DEV_UI ? (
            <ActingAsSelect
              actingAs={actingAs}
              onChange={handleActingChange}
              className="hidden min-w-[11rem] md:flex"
              selectClassName="w-auto min-w-[6.75rem] border-none bg-base-200/80 shadow-none"
            />
          ) : null}

          <div className="flex h-8 min-w-[5.5rem] items-center justify-end sm:min-w-[7.25rem] md:min-w-[12rem]">
            <RainbowKitCustomConnectButton />
          </div>
        </div>
      </div>
    </header>
  );
};
