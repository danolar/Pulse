import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageShell, SectionHeader } from "~~/components/pulse";

const NewProfilePage = () => {
  return (
    <PageShell>
      <Link
        href="/"
        className="mb-6 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-pulse-secondary hover:text-base-content"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Profiles
      </Link>

      <SectionHeader title="New profile" subtitle="Configure threshold, signal sources, and verification windows." />

      <div className="pulse-card max-w-2xl p-6">
        <p className="text-sm text-pulse-muted">
          Creation form coming soon. This route demonstrates the subpage pattern with a fixed header and back link.
        </p>
        <button type="button" className="btn btn-primary mt-4" disabled>
          Create profile (coming soon)
        </button>
      </div>
    </PageShell>
  );
};

export default NewProfilePage;
