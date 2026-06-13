"use client";

import { useState } from "react";
import { Activity, AlertTriangle, Fingerprint, Globe, Shield, Signal, Users, Wallet } from "lucide-react";
import {
  AddCard,
  ContentCard,
  KeyValuePreview,
  MetricCard,
  ModalFooterActions,
  PageShell,
  PulseModal,
  SectionHeader,
  SequenceCard,
  SignalTimeline,
  ThresholdGauge,
  VerificationStepper,
} from "~~/components/pulse";

const demoProfiles = [
  {
    id: "1",
    title: "Primary profile",
    subtitle: "Threshold 100 · 3 active sources",
    progress: 62,
    status: "Active monitoring",
  },
  {
    id: "2",
    title: "Delegated agent",
    subtitle: "Threshold 80 · open window",
    progress: 78,
    status: "Verification pending",
  },
];

const HomePage = () => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(demoProfiles[0]);

  const openPreview = (profile: (typeof demoProfiles)[0]) => {
    setSelectedProfile(profile);
    setPreviewOpen(true);
  };

  return (
    <PageShell>
      <SectionHeader
        title="Pulse Profiles"
        subtitle="Weighted signal accumulator for onchain liveness and behavioral verification."
      />

      <div className="mb-8 grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4">
        <MetricCard label="Active profiles" value={2} icon={Users} tone="default" />
        <MetricCard label="Open windows" value={1} icon={AlertTriangle} tone="warning" />
        <MetricCard label="Signals today" value={14} icon={Signal} tone="info" />
        <MetricCard label="Near threshold" value={1} icon={Activity} tone="error" />
      </div>

      <div className="mb-8 grid grid-cols-1 items-stretch gap-6 lg:grid-cols-3">
        <div className="pulse-card flex min-h-[18rem] flex-col items-center justify-center p-6 lg:col-span-1">
          <ThresholdGauge value={selectedProfile.progress} label="Progress to threshold" size={200} />
          <p className="mt-4 text-center text-sm text-pulse-muted">{selectedProfile.title}</p>
        </div>

        <div className="min-h-[18rem] lg:col-span-2">
          <VerificationStepper
            steps={[
              {
                id: "1",
                label: "Onchain commitment",
                description: "Verification window and order recorded onchain.",
                status: "completed",
              },
              {
                id: "2",
                label: "World ID check-in",
                description: "Waiting for owner response.",
                status: "active",
              },
              {
                id: "3",
                label: "Chainlink evaluation",
                description: "Passive signals running in the background.",
                status: "upcoming",
              },
            ]}
          />
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 items-stretch gap-6 xl:grid-cols-2">
        <SignalTimeline
          events={[
            {
              id: "s1",
              title: "Onchain activity detected",
              description: "Outbound transfer on Base.",
              timestamp: "2h ago",
              weight: -8,
              tone: "positive",
              icon: Wallet,
            },
            {
              id: "s2",
              title: "Check-in attempt missed",
              description: "World ID window expired without response.",
              timestamp: "6h ago",
              weight: 12,
              tone: "negative",
              icon: Fingerprint,
            },
            {
              id: "s3",
              title: "Evidence archived",
              description: "Encrypted bundle on Walrus.",
              timestamp: "yesterday",
              weight: 0,
              tone: "neutral",
              icon: Shield,
            },
          ]}
        />

        <SequenceCard
          title="Verification sequence"
          steps={[
            {
              id: "a",
              label: "Passive signal",
              description: "Background onchain activity",
              icon: Globe,
              status: "completed",
            },
            {
              id: "b",
              label: "World ID",
              description: "Human owner check-in",
              icon: Fingerprint,
              status: "active",
            },
            {
              id: "c",
              label: "Attestation",
              description: "Confidential Chainlink evaluation",
              icon: Shield,
              status: "upcoming",
            },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
        <AddCard
          title="Add profile"
          description="Configure threshold, sources, and verification windows."
          href="/profiles/new"
        />

        {demoProfiles.map(profile => (
          <ContentCard
            key={profile.id}
            title={profile.title}
            subtitle={profile.subtitle}
            icon={Activity}
            badge={<span className="badge badge-sm border-none bg-warning/15 text-warning">{profile.status}</span>}
            onPreview={() => openPreview(profile)}
            onEdit={() => openPreview(profile)}
          >
            <ThresholdGauge value={profile.progress} size={128} compact />
          </ContentCard>
        ))}
      </div>

      <PulseModal
        open={previewOpen}
        title={`Preview · ${selectedProfile.title}`}
        onClose={() => setPreviewOpen(false)}
        footer={
          <ModalFooterActions
            onCancel={() => setPreviewOpen(false)}
            onSave={() => setPreviewOpen(false)}
            saveLabel="Close"
          />
        }
      >
        <KeyValuePreview
          items={[
            { label: "Status", value: selectedProfile.status },
            { label: "Progress", value: `${selectedProfile.progress}% toward threshold` },
            { label: "Description", value: selectedProfile.subtitle },
            {
              label: "Evidence",
              value: "walrus://pulse/evidence/bundle-0x8f3a…\nVerifiable onchain reference when threshold is crossed.",
            },
          ]}
        />
      </PulseModal>
    </PageShell>
  );
};

export default HomePage;
