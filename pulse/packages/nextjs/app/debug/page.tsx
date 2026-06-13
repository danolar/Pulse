import { DebugContracts } from "./_components/DebugContracts";
import { PageShell, SectionHeader } from "~~/components/pulse";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

export const metadata = getMetadata({
  title: "Debug Contracts",
  description: "Debug your deployed 🏗 Scaffold-ETH 2 contracts in an easy way",
});

const DebugPage = () => {
  return (
    <PageShell>
      <SectionHeader
        title="Debug Contracts"
        subtitle="Read and write deployed contracts while developing on the local chain."
      />
      <DebugContracts />
    </PageShell>
  );
};

export default DebugPage;
