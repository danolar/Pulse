"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { PageShell, PulseButton, SectionHeader } from "~~/components/pulse";
import { PulseWorldIdButton } from "~~/components/pulse/world-id/PulseWorldIdButton";
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

const SetupWizard = () => {
  const router = useRouter();
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
  const [adapterForm, setAdapterForm] = useState({ address: "", weight: "10", label: "" });
  const [requestorAddress, setRequestorAddress] = useState("");

  const generatedProfileId = useMemo(() => profileId ?? `profile-${crypto.randomUUID().slice(0, 8)}`, [profileId]);

  const updateConfigField = (field: keyof ProfileConfig, value: string) => {
    setDraftConfig(current => ({ ...current, [field]: Number(value) || 0 }));
  };

  return (
    <PageShell>
      <SectionHeader
        title="Profile setup"
        subtitle="One-time wizard to create your Pulse profile, bind Orb identity, and configure access lists."
      />

      <div className="space-y-6">
        <section className="pulse-card p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold">Step 1 · Create profile</h2>
            {deviceVerified ? (
              <span className="badge badge-sm border-none bg-success/15 text-success">Verified</span>
            ) : null}
          </div>
          <p className="mb-4 text-sm text-pulse-muted">
            Verify with World ID (device level) to create your profile identity.
          </p>
          <PulseWorldIdButton
            level="device"
            action="pulse-create-profile"
            signal={generatedProfileId}
            label="Verify & Create Profile"
            disabled={deviceVerified}
            onVerified={runVerifiedAction(verification => {
              // TODO: wire to PulseOracle.createProfile(profileId, proof)
              mockCreateProfile(generatedProfileId, verification);
            })}
          />
        </section>

        <section className={`pulse-card p-5 sm:p-6 ${deviceVerified ? "" : "opacity-60"}`}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold">Step 2 · Bind Orb identity</h2>
            {orbBound ? <span className="badge badge-sm border-none bg-accent/15 text-accent">Orb bound</span> : null}
          </div>
          <p className="mb-4 text-sm text-pulse-muted">
            Unlocks emergency controls (block / resurrect) for this profile.
          </p>
          <PulseWorldIdButton
            level="orb"
            action="pulse-bind-orb"
            signal={generatedProfileId}
            label="Bind Orb Identity"
            disabled={!deviceVerified || orbBound}
            onVerified={runVerifiedAction(verification => {
              // TODO: wire to PulseOracle.bindOrbIdentity(profileId, proof)
              mockBindOrb(verification);
            })}
          />
        </section>

        <section className={`pulse-card p-5 sm:p-6 ${deviceVerified ? "" : "opacity-60"}`}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold">Step 3 · Profile configuration</h2>
            {configSaved ? <span className="badge badge-sm border-none bg-success/15 text-success">Saved</span> : null}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {(
              [
                ["windowDuration", "Window duration (minutes)"],
                ["attemptsPerWindow", "Attempts per window"],
                ["responseWindow", "Response window (minutes)"],
                ["missedAttemptWeight", "Missed attempt weight"],
                ["threshold", "Threshold"],
              ] as const
            ).map(([field, label]) => (
              <label key={field} className="form-control">
                <span className="label-text mb-1 text-sm text-pulse-muted">{label}</span>
                <input
                  type="number"
                  min={1}
                  className="input input-bordered rounded-2xl"
                  value={draftConfig[field]}
                  disabled={!deviceVerified}
                  onChange={event => updateConfigField(field, event.target.value)}
                />
              </label>
            ))}
          </div>
          <PulseButton
            className="mt-4"
            disabled={!deviceVerified}
            onClick={() => {
              // TODO: wire to PulseOracle.setConfig(...)
              mockSaveConfig(draftConfig);
            }}
          >
            Save Configuration
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
              <h3 className="mb-3 text-sm font-semibold">Signal adapters</h3>
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
                  placeholder="Address"
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
                  // TODO: wire to PulseOracle.authorizeAdapter(address, weight, label)
                  mockAddAdapter({
                    address: adapterForm.address,
                    weight: Number(adapterForm.weight) || 0,
                    label: adapterForm.label,
                  });
                  setAdapterForm({ address: "", weight: "10", label: "" });
                }}
              >
                Add Adapter
              </PulseButton>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-semibold">Authorized requestors</h3>
              <div className="mb-3 overflow-x-auto rounded-2xl border border-base-content/10">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requestors.length === 0 ? (
                      <tr>
                        <td className="text-pulse-muted">No requestors yet</td>
                      </tr>
                    ) : (
                      requestors.map(requestor => (
                        <tr key={requestor.id}>
                          <td className="font-mono text-xs">{requestor.address}</td>
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
                  // TODO: wire to PulseOracle.authorizeRequestor(address)
                  mockAddRequestor(requestorAddress);
                  setRequestorAddress("");
                }}
              >
                Add Requestor
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
            Go to Console
          </PulseButton>
        </section>
      </div>
    </PageShell>
  );
};

export default SetupWizard;
