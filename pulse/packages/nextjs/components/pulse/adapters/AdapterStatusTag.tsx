import { StatusTag } from "~~/components/pulse/ui/StatusTag";
import type { ConfiguredAdapter } from "~~/types/pulse";

const STATUS_LABEL: Record<ConfiguredAdapter["bindingStatus"], string> = {
  active: "Active",
  "key-required": "Key required",
  paused: "Paused",
};

const STATUS_TONE: Record<ConfiguredAdapter["bindingStatus"], "success" | "warning" | "neutral"> = {
  active: "success",
  "key-required": "warning",
  paused: "neutral",
};

export const AdapterStatusTag = ({ status }: { status: ConfiguredAdapter["bindingStatus"] }) => (
  <StatusTag label={STATUS_LABEL[status]} tone={STATUS_TONE[status]} />
);
