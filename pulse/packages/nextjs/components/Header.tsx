"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Menu } from "lucide-react";
import { BugAntIcon } from "@heroicons/react/24/outline";
import { SwitchTheme } from "~~/components/SwitchTheme";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useOutsideClick } from "~~/hooks/scaffold-eth";

type HeaderMenuLink = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

export const menuLinks: HeaderMenuLink[] = [
  {
    label: "Profiles",
    href: "/",
  },
  {
    label: "Debug Contracts",
    href: "/debug",
    icon: <BugAntIcon className="h-4 w-4 shrink-0" />,
  },
];

export const HeaderMenuLinks = () => {
  const pathname = usePathname();

  return (
    <>
      {menuLinks.map(({ label, href, icon }) => {
        const isActive = pathname === href;
        return (
          <li key={href} className="w-full lg:w-auto">
            <Link
              href={href}
              passHref
              className={`${
                isActive ? "bg-primary text-primary-content shadow-pulse-sm" : "hover:bg-base-300"
              } flex min-h-11 w-full items-center gap-2 rounded-2xl px-3 py-2 text-sm font-medium transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary lg:w-auto`}
            >
              {icon}
              <span>{label}</span>
            </Link>
          </li>
        );
      })}
    </>
  );
};

export const Header = () => {
  const burgerMenuRef = useRef<HTMLDetailsElement>(null);
  useOutsideClick(burgerMenuRef, () => {
    burgerMenuRef?.current?.removeAttribute("open");
  });

  return (
    <header className="sticky top-0 z-20 shrink-0 border-b border-base-content/5 pulse-glass pt-[env(safe-area-inset-top)]">
      <div className="navbar mx-auto min-h-14 max-w-7xl gap-2 px-4 py-2 lg:min-h-0">
        <div className="navbar-start min-w-0 flex-1">
          <details className="dropdown dropdown-end lg:dropdown-bottom" ref={burgerMenuRef}>
            <summary className="btn btn-ghost btn-circle -ml-1 shrink-0 lg:hidden hover:bg-transparent">
              <Menu className="h-5 w-5" />
            </summary>
            <ul
              className="menu dropdown-content z-30 mt-3 w-56 rounded-2xl border border-base-content/5 bg-base-100 p-2 shadow-pulse-md"
              onClick={() => {
                burgerMenuRef?.current?.removeAttribute("open");
              }}
            >
              <HeaderMenuLinks />
            </ul>
          </details>
          <Link href="/" passHref className="mr-3 flex min-w-0 items-center gap-2 sm:mr-4 sm:gap-3 lg:mr-6">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-content">
              <Activity className="h-5 w-5" />
            </span>
            <div className="hidden min-w-0 flex-col sm:flex">
              <span className="truncate font-bold leading-tight text-base-content">Pulse</span>
              <span className="truncate text-xs text-pulse-muted">Weighted verification</span>
            </div>
          </Link>
          <ul className="menu menu-horizontal hidden gap-2 px-1 lg:flex lg:flex-nowrap">
            <HeaderMenuLinks />
          </ul>
        </div>

        <div className="navbar-end flex shrink-0 items-center gap-1 sm:gap-2">
          <SwitchTheme />
          <RainbowKitCustomConnectButton />
        </div>
      </div>
    </header>
  );
};
