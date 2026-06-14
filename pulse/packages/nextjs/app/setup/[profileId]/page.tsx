"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { RouteGuard } from "~~/components/pulse/layout/RouteGuard";
import { SetupWizard } from "~~/components/pulse/setup/SetupWizard";
import { usePulseStore } from "~~/services/store/pulseStore";

const SetupPageContent = () => {
  const params = useParams<{ profileId?: string }>();
  const router = useRouter();
  const { address } = useAccount();
  const loadProfile = usePulseStore(state => state.loadProfile);
  const profiles = usePulseStore(state => state.profiles);

  useEffect(() => {
    if (!params.profileId || !address) return;
    const profile = profiles[params.profileId] ?? profiles[params.profileId.toLowerCase()];
    if (profile) {
      loadProfile(params.profileId);
    } else {
      router.replace("/setup");
    }
  }, [params.profileId, address, profiles, loadProfile, router]);

  return <SetupWizard editProfileId={params.profileId} />;
};

export default function SetupPage() {
  return (
    <RouteGuard>
      <SetupPageContent />
    </RouteGuard>
  );
}
