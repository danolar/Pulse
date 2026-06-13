"use client";

import deployedContracts from "~~/contracts/deployedContracts";
import {
  CONNECTION_KIT_CONSUME_EXTEND_NOTE,
  CONNECTION_KIT_DEPLOYMENT_NOTE,
  CONNECTION_KIT_DOC_LINKS,
  CONNECTION_KIT_INTEGRATION_STEPS,
  CONNECTION_KIT_PANEL_INTRO,
  CONNECTION_KIT_PANEL_TITLE,
  WORLD_ID_ACTION_PATTERNS,
  buildConnectionKitSnippets,
} from "~~/constants/connectionKitContent";
import { CopyRow } from "~~/components/pulse/layout/CopyRow";
import { CopySnippet } from "~~/components/pulse/layout/CopySnippet";
import { SlideOver } from "~~/components/pulse/layout/SlideOver";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";

type ConnectionKitPanelProps = {
  open: boolean;
  onClose: () => void;
};

const PanelIntro = () => (
  <p className="text-sm leading-relaxed text-pulse-muted">{CONNECTION_KIT_PANEL_INTRO}</p>
);

const DeploymentValues = ({
  networkName,
  contractAddress,
  appId,
}: {
  networkName: string;
  contractAddress: string;
  appId: string;
}) => (
  <section className="space-y-2">
    <h3 className="pulse-label text-pulse-muted">Deployment values</h3>
    <CopyRow label="Network" value={networkName} />
    <CopyRow label="PulseOracle contract" value={contractAddress} />
    <CopyRow label="World ID app_id" value={appId} />
    <p className="text-xs leading-relaxed text-pulse-muted">{CONNECTION_KIT_DEPLOYMENT_NOTE}</p>
  </section>
);

const ActionNamingTable = () => (
  <div className="overflow-x-auto rounded-xl border border-base-content/10">
    <table className="table table-xs">
      <thead>
        <tr>
          <th>Action</th>
          <th>String</th>
          <th>Level</th>
        </tr>
      </thead>
      <tbody>
        {WORLD_ID_ACTION_PATTERNS.map(row => (
          <tr key={row.flow}>
            <td>{row.flow}</td>
            <td className="font-mono text-[11px]">{row.pattern}</td>
            <td className="capitalize">{row.level}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const IntegrationStep = ({
  index,
  title,
  explanation,
  snippet,
  showActionTable,
}: {
  index: number;
  title: string;
  explanation: string;
  snippet?: string;
  showActionTable?: boolean;
}) => (
  <li className="space-y-2">
    <div className="flex gap-3">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
        {index}
      </span>
      <div className="min-w-0 space-y-1">
        <h4 className="text-sm font-medium">{title}</h4>
        <p className="text-xs leading-relaxed text-pulse-muted">{explanation}</p>
      </div>
    </div>
    {snippet ? <CopySnippet code={snippet} label={title} /> : null}
    {showActionTable ? <ActionNamingTable /> : null}
  </li>
);

const IntegrationSteps = ({ snippets }: { snippets: ReturnType<typeof buildConnectionKitSnippets> }) => (
  <section className="space-y-4">
    <h3 className="pulse-label text-pulse-muted">Integration steps</h3>
    <ol className="space-y-5">
      {CONNECTION_KIT_INTEGRATION_STEPS.map((step, index) => (
        <IntegrationStep
          key={step.title}
          index={index + 1}
          title={step.title}
          explanation={step.explanation}
          snippet={snippets[step.snippetKey]}
          showActionTable={"includeActionTable" in step ? step.includeActionTable : false}
        />
      ))}
    </ol>
  </section>
);

const DocsLinks = () => (
  <section className="space-y-2">
    <h3 className="pulse-label text-pulse-muted">Docs</h3>
    <ul className="space-y-1.5 text-sm">
      {CONNECTION_KIT_DOC_LINKS.map(link => (
        <li key={link.href}>
          <a href={link.href} className="link link-primary" target="_blank" rel="noreferrer">
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  </section>
);

export const ConnectionKitPanel = ({ open, onClose }: ConnectionKitPanelProps) => {
  const { targetNetwork } = useTargetNetwork();
  const contractAddress =
    deployedContracts[targetNetwork.id as keyof typeof deployedContracts]?.PulseOracle?.address ?? "";
  const appId = process.env.NEXT_PUBLIC_WORLD_APP_ID ?? "";
  const snippets = buildConnectionKitSnippets({ appId, contractAddress });

  return (
    <SlideOver open={open} title={CONNECTION_KIT_PANEL_TITLE} onClose={onClose} size="lg">
      <div className="space-y-6 text-sm">
        <PanelIntro />
        <DeploymentValues networkName={targetNetwork.name} contractAddress={contractAddress} appId={appId} />
        <IntegrationSteps snippets={snippets} />
        <DocsLinks />
        <p className="text-xs leading-relaxed text-pulse-muted">{CONNECTION_KIT_CONSUME_EXTEND_NOTE}</p>
      </div>
    </SlideOver>
  );
};
