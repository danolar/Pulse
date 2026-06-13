"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { CheckCircle2 } from "lucide-react";
import { PageShell, PulseButton, SectionHeader } from "~~/components/pulse";
import { PulseWorldIdButton } from "~~/components/pulse/world-id/PulseWorldIdButton";
import { CONFIG_FIELD_HINTS, worldIdActions } from "~~/constants/pulseProtocol";
import { usePulseStore } from "~~/services/store/pulseStore";
import type { ProfileConfig } from "~~/types/pulse";
import { notification } from "~~/utils/scaffold-eth/notification";
import type { PulseWorldIdVerification } from "~~/utils/worldIdProof";

const runVerifiedAction = (action: (verification: PulseWorldIdVerification) => void) => {
  return (verification: PulseWorldIdVerification) => {
    try {
      action(verification);
    } catch (error) {
      notification.error(error instanceof Error ? error.message : "Action rejected.");
    }
  };
};

const CONFIG_FIELDS: Array<{ field: keyof ProfileConfig; label: string; unit: string }> = [
  { field: "windowDuration", label: "Window duration", unit: "days" },
  { field: "attemptsPerWindow", label: "Attempts per window", unit: "count" },
  { field: "responseWindow", label: "Response window", unit: "hours" },
  { field: "missedAttemptWeight", label: "Missed attempt weight", unit: "points" },
  { field: "threshold", label: "Threshold", unit: "points" },
];

const SetupWizard = () => {
  const router = useRouter();
  const { address } = useAccount();
  const {
    profileId,
    deviceVerified,
    orbBound,
    configSaved,
    accessListsSaved,
    config,
    adapters,
    requestors,
    mockCreateProfile,
    mockBindOrb,
    mockSaveConfig,
    mockAddAdapter,
    mockAddRequestor,
    mockCompleteSetup,
  } = usePulseStore();

  const [draftConfig, setDraftConfig] = useState<ProfileConfig>(config);
  const [adapterForm, setAdapterForm] = useState({ address: "", weight: "10", label: "CRE ONCHAIN_TX" });
  const [requestorAddress, setRequestorAddress] = useState("");
  const [fallbackProfileKey, setFallbackProfileKey] = useState<string | null>(null);

  useEffect(() => {
    if (profileId || address) return;
    setFallbackProfileKey(`profile-${crypto.randomUUID().slice(0, 8)}`);
  }, [profileId, address]);

  const profileKey = profileId ?? address ?? fallbackProfileKey;
  const profileKeyLabel = profileKey ?? "Assigning profile key…";

  const updateConfigField = (field: keyof ProfileConfig, value: string) => {
    setDraftConfig(current => ({ ...current, [field]: Number(value) || 0 }));
  };

  return (
    <PageShell>
      <SectionHeader
        title="Profile setup"
        subtitle="Consent-first registration: Device World ID creates the profile; Orb World ID unlocks emergency controls."
      />

      <div className="space-y-6">
        <section className="pulse-card p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold">Step 1 · createProfile (Device)</h2>
            {deviceVerified ? (
              <span className="badge badge-sm border-none bg-success/15 text-success">Device bound</span>
            ) : null}
          </div>
          <p className="mb-2 text-sm text-pulse-muted">
            Stores the owner&apos;s Device nullifier hash. Enables check-in and request extension. Profile key:{" "}
            <span className="font-mono text-xs" suppressHydrationWarning>
              {profileKeyLabel}
            </span>
          </p>
          {address ? (
            <p className="mb-4 text-xs text-pulse-muted">Connected wallet will become the onchain profile owner.</p>
          ) : (
            <p className="mb-4 text-xs text-warning">Connect a wallet to align profileId with owner address (spec §8).</p>
          )}
          <PulseWorldIdButton
            level="device"
            action={worldIdActions.createProfile(profileKey ?? "pending")}
            signal={profileKey ?? "pending"}
            label="Verify & create profile"
            disabled={deviceVerified || !profileKey}
            onVerified={runVerifiedAction(v => {
              if (!profileKey) return;
              mockCreateProfile(profileKey, v);
            })}
          />
        </section>

        <section className={`pulse-card p-5 sm:p-6 ${deviceVerified ? "" : "opacity-60"}`}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold">Step 2 · bindOrbIdentity (Orb)</h2>
            {orbBound ? <span className="badge badge-sm border-none bg-accent/15 text-accent">Orb bound</span> : null}
          </div>
          <p className="mb-4 text-sm text-pulse-muted">
            Separate Orb nullifier (unlinkable from Device by design). Required for block and resurrect.
          </p>
          <PulseWorldIdButton
            level="orb"
            action={worldIdActions.bindOrb(profileKey ?? "pending")}
            signal={profileKey ?? "pending"}
            label="Bind Orb identity"
            disabled={!deviceVerified || orbBound || !profileKey}
            onVerified={runVerifiedAction(v => {
              if (!profileKey) return;
              mockBindOrb(v);
            })}
          />
        </section>

        <section className={`pulse-card p-5 sm:p-6 ${deviceVerified ? "" : "opacity-60"}`}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold">Step 3 · Profile configuration</h2>
            {configSaved ? <span className="badge badge-sm border-none bg-success/15 text-success">Saved</span> : null}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {CONFIG_FIELDS.map(({ field, label, unit }) => (
              <label key={field} className="form-control">
                <span className="label-text mb-1 text-sm text-pulse-muted">
                  {label} ({unit})
                </span>
                <input
                  type="number"
                  min={1}
                  className="input input-bordered rounded-2xl"
                  value={draftConfig[field]}
                  disabled={!deviceVerified}
                  onChange={event => updateConfigField(field, event.target.value)}
                />
                <span className="mt-1 text-xs text-pulse-muted">{CONFIG_FIELD_HINTS[field]}</span>
              </label>
            ))}
          </div>
          <PulseButton
            className="mt-4"
            disabled={!deviceVerified}
            onClick={() => mockSaveConfig(draftConfig)}
          >
            Save configuration
          </PulseButton>
        </section>

        <section className={`pulse-card p-5 sm:p-6 ${configSaved ? "" : "opacity-60"}`}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold">Step 4 · Access lists</h2>
            {accessListsSaved ? (
              <span className="badge badge-sm border-none bg-success/15 text-success">
                <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                Ready
              </span>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <div>
              <h3 className="mb-1 text-sm font-semibold">Signal adapters (ISignalAdapter)</h3>
              <p className="mb-3 text-xs text-pulse-muted">Authorized signers — e.g. Chainlink CRE ONCHAIN_TX keeper.</p>
              <div className="mb-3 overflow-x-auto rounded-2xl border border-base-content/10">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Address</th>
                      <th>Weight</th>
                      <th>Label</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adapters.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="text-pulse-muted">
                          No adapters yet
                        </td>
                      </tr>
                    ) : (
                      adapters.map(adapter => (
                        <tr key={adapter.id}>
                          <td className="font-mono text-xs">{adapter.address}</td>
                          <td>{adapter.weight}</td>
                          <td>{adapter.label}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <input
                  className="input input-bordered rounded-2xl sm:col-span-1"
                  placeholder="Signer address"
                  value={adapterForm.address}
                  disabled={!configSaved}
                  onChange={event => setAdapterForm(current => ({ ...current, address: event.target.value }))}
                />
                <input
                  className="input input-bordered rounded-2xl"
                  placeholder="Weight"
                  value={adapterForm.weight}
                  disabled={!configSaved}
                  onChange={event => setAdapterForm(current => ({ ...current, weight: event.target.value }))}
                />
                <input
                  className="input input-bordered rounded-2xl"
                  placeholder="Label"
                  value={adapterForm.label}
                  disabled={!configSaved}
                  onChange={event => setAdapterForm(current => ({ ...current, label: event.target.value }))}
                />
              </div>
              <PulseButton
                variant="secondary"
                className="mt-3"
                disabled={!configSaved || !adapterForm.address || !adapterForm.label}
                onClick={() => {
                  mockAddAdapter({
                    address: adapterForm.address,
                    weight: Number(adapterForm.weight) || 0,
                    label: adapterForm.label,
                  });
                  setAdapterForm({ address: "", weight: "10", label: "CRE ONCHAIN_TX" });
                }}
              >
                Authorize adapter
              </PulseButton>
            </div>

            <div>
              <h3 className="mb-1 text-sm font-semibold">Requestor slots</h3>
              <p className="mb-3 text-xs text-pulse-muted">
                Owner authorizes address → requestor claims with Device World ID → can request evaluation.
              </p>
              <div className="mb-3 overflow-x-auto rounded-2xl border border-base-content/10">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Address</th>
                      <th>Authorized</th>
                      <th>Claimed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requestors.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="text-pulse-muted">
                          No requestors yet
                        </td>
                      </tr>
                    ) : (
                      requestors.map(requestor => (
                        <tr key={requestor.id}>
                          <td className="font-mono text-xs">{requestor.address}</td>
                          <td>{requestor.authorized ? "Yes" : "No"}</td>
                          <td>{requestor.claimed ? "Yes" : "Pending"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <input
                className="input input-bordered w-full rounded-2xl"
                placeholder="Requestor address"
                value={requestorAddress}
                disabled={!configSaved}
                onChange={event => setRequestorAddress(event.target.value)}
              />
              <PulseButton
                variant="secondary"
                className="mt-3"
                disabled={!configSaved || !requestorAddress}
                onClick={() => {
                  mockAddRequestor(requestorAddress);
                  setRequestorAddress("");
                }}
              >
                authorizeRequestor
              </PulseButton>
            </div>
          </div>

          <PulseButton
            className="mt-6"
            disabled={!configSaved}
            onClick={() => {
              mockCompleteSetup();
              router.push("/");
            }}
          >
            Activate profile & open console
          </PulseButton>
        </section>
      </div>
    </PageShell>
  );
};

export default SetupWizard;
