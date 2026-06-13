"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";

const ConsoleRedirectPage = () => {
  const router = useRouter();
  const { address } = useAccount();

  useEffect(() => {
    if (address) {
      router.replace(`/explorer/${address}`);
    } else {
      router.replace("/explorer");
    }
  }, [address, router]);

  return null;
};

export default ConsoleRedirectPage;
