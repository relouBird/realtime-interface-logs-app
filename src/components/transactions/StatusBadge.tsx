// components/domain/StatusBadge.tsx
import {
  CheckCircle,
  XCircle,
  RefreshCw,
  Clock,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/utils/cn";

type Status = "SUCCESS" | "FAILED" | "PROCESSING" | "PENDING" | "TIMEOUT";

const STATUS_CONFIG: Record<
  Status,
  {
    label: string;
    icon: LucideIcon;
    bg: string;
    text: string;
    spin?: boolean;
    pill?: boolean;
  }
> = {
  SUCCESS: {
    label: "Success",
    icon: CheckCircle,
    bg: "bg-badge-success-background",
    text: "text-badge-success-text",
    pill: true,
  },
  PROCESSING: {
    label: "Processing",
    icon: RefreshCw,
    bg: "bg-badge-warning-background",
    text: "text-badge-warning-text",
    spin: true,
    pill: true,
  },
  PENDING: {
    label: "Pending",
    icon: Clock,
    bg: "bg-badge-neutral-background",
    text: "text-badge-neutral-text",
    pill: true,
  },
  FAILED: {
    label: "Failed",
    icon: XCircle,
    bg: "bg-badge-error-background",
    text: "text-badge-error-text",
    pill: true,
  },
  TIMEOUT: {
    label: "Timeout",
    icon: Clock,
    bg: "bg-transparent",
    text: "text-badge-warning-icon-color",
    pill: false,
  },
};

function normalize(status: string): Status {
  const upper = status.toUpperCase();
  if (upper in STATUS_CONFIG) return upper as Status;
  if (upper === "SETTLED" || upper === "APPROVED") return "SUCCESS";
  if (upper === "TIMEOUT") return "TIMEOUT";
  return "PENDING";
}

export function StatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const config = STATUS_CONFIG[normalize(status)];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium",
        config.pill && "rounded-full px-2 py-1",
        config.bg,
        config.text,
        className,
      )}
    >
      <Icon className={cn("size-3", config.spin && "animate-spin")} />
      {config.label}
    </span>
  );
}
