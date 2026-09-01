// routes/OverviewPage.tsx
import { useSeoHead } from "@/composables/useSeoHead";
import { useState } from "react";
import {
  Newspaper,
  CheckCircle2,
  RefreshCw,
  TrendingUp,
  Info,
  AlertTriangle,
  ChevronDown,
  Download,
  ArrowUp,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/Button";
import { OPERATIONS, INCOMING_OPERATION } from "@/constants/mock/operation";
import type { OperationFinancialStatus } from "@/types/transaction.type";

/* -------------------------------------------------------------------------- */
/*  Small presentational helpers                                              */
/* -------------------------------------------------------------------------- */

function KpiCard({
  label,
  value,
  icon: Icon,
  footer,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  footer: React.ReactNode;
}) {
  return (
    <div className="border border-card-border bg-card-background-100 p-5 shadow-xs">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-wide text-text-secondary">
          {label}
        </span>
        <Icon className="size-4 text-text-tertiary" />
      </div>
      <p className="mt-3 font-title text-3xl font-bold text-foreground-100">
        {value}
      </p>
      <div className="mt-2 text-xs text-text-secondary">{footer}</div>
    </div>
  );
}

function ChannelBadge({ channel }: { channel: string }) {
  return (
    <span className="inline-flex w-3/4 justify-center items-center rounded-xs border bg-sidebar-badge-background/10 border-badge-neutral-text/20 px-2 py-0.5 text-xs font-medium text-badge-neutral-text">
      {channel}
    </span>
  );
}

const STATUS_CONFIG: Record<
  OperationFinancialStatus,
  {
    label: string;
    icon: typeof CheckCircle;
    bg: string;
    text: string;
    spin?: boolean;
  }
> = {
  settled: {
    label: "Settled",
    icon: CheckCircle,
    bg: "bg-badge-success-background",
    text: "text-badge-success-text",
  },
  processing: {
    label: "Processing",
    icon: RefreshCw,
    bg: "bg-badge-warning-background",
    text: "text-badge-warning-text",
    spin: true,
  },
  failed: {
    label: "Failed",
    icon: XCircle,
    bg: "bg-badge-error-background",
    text: "text-badge-error-text",
  },
  timeout: {
    label: "Timeout",
    icon: Clock,
    bg: "bg-transparent",
    text: "text-badge-warning-icon-color",
  },
};

function StatusBadge({ status }: { status: OperationFinancialStatus }) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium",
        config.bg,
        config.text,
      )}
    >
      <Icon className={cn("size-3", config.spin && "animate-spin")} />
      {config.label}
    </span>
  );
}

function FilterSelect({ label }: { label: string }) {
  return (
    <button className="inline-flex items-center gap-1.5 rounded-xs border border-button-outline-border bg-button-outline-background px-3 py-1.5 text-sm text-button-outline-text hover:bg-button-outline-hover-background">
      {label}
      <ChevronDown className="size-3.5 text-text-tertiary" />
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function OverviewPage() {
  useSeoHead({
    title: "Tableau de bord",
    subtitle: "Visualisez vos données de façon claire et concise",
    forcePrefix: true,
  });

  const [operations, setOperations] = useState(OPERATIONS);
  const [showIncomingPrompt, setShowIncomingPrompt] = useState(true);
  const [page] = useState(1);

  const revealIncoming = () => {
    setOperations((prev) => [INCOMING_OPERATION, ...prev]);
    setShowIncomingPrompt(false);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          label="TOTAL TRANSACTIONS TODAY"
          value="84,209"
          icon={Newspaper}
          footer={
            <span className="flex items-center gap-1 text-success-600">
              <TrendingUp className="size-3.5" />
              +12.4% vs yesterday
            </span>
          }
        />
        <KpiCard
          label="SUCCESS RATE"
          value="99.8%"
          icon={CheckCircle2}
          footer={
            <span className="flex items-center gap-1">
              <Info className="size-3.5" />
              Rolling 24h average
            </span>
          }
        />
        <KpiCard
          label="ACTIVE PROCESSING"
          value="1,432"
          icon={RefreshCw}
          footer={
            <span className="flex items-center gap-1 text-warning-600">
              <AlertTriangle className="size-3.5" />
              42 delayed in queue
            </span>
          }
        />
      </div>

      {/* Panel header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-card-border p-5">
        <div>
          <h2 className="font-title text-lg font-semibold text-foreground-100">
            Live Operations
          </h2>
          <p className="text-sm text-text-secondary">
            Monitoring global transaction flow.
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-[11px] font-semibold tracking-wide text-text-tertiary">
              TOTAL TRANSACTIONS (24H)
            </p>
            <p className="mt-0.5 text-sm font-semibold text-foreground-100">
              <span className="font-subtitle">1,248,932</span> <span className="text-success-600">↑2.4%</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-semibold tracking-wide text-text-tertiary">
              SUCCESS RATE
            </p>
            <p className="mt-0.5 text-sm font-semibold text-foreground-100">
              <span className="font-subtitle">99.8%</span> <span className="text-text-secondary">Stable</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-semibold tracking-wide text-text-tertiary">
              ACTIVE PROCESSING
            </p>
            <p className="mt-0.5 text-sm font-semibold text-foreground-100">
              <span className="font-subtitle">84</span> <span className="text-text-secondary">Ops/sec</span>
            </p>
          </div>
        </div>
      </div>

      {/* Live operations panel */}
      <div className=" bg-card-background-100 shadow-xs relative">
        {showIncomingPrompt && (
          <button
            onClick={revealIncoming}
            className="absolute left-1/2 top-13 z-10 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-full bg-foreground-100 px-3 py-1.5 text-xs font-medium text-white-100 shadow-md hover:bg-foreground-soft-200"
          >
            <ArrowUp className="size-3.5" />
            Show new operations (7)
          </button>
        )}

        {/* Filters */}
        <div className="border border-card-border flex flex-wrap items-center gap-2 px-4 py-2">
          <FilterSelect label="Today" />
          <FilterSelect label="Channel: All Networks" />
          <FilterSelect label="Status: Any" />
          <button className="text-sm text-primary-600 hover:underline">
            Clear filters
          </button>

          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="xs" iconOnly>
              <RefreshCw className="size-4" />
            </Button>
            <Button variant="ghost" size="xs" iconOnly>
              <Download className="size-4" />
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="border border-t-0 border-card-border overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-card-border text-xs font-semibold tracking-wide text-text-tertiary">
                <th className="px-4 py-2.5 font-semibold">TIMESTAMP</th>
                <th className="px-4 py-2.5 font-semibold">REFERENCE</th>
                <th className="px-4 py-2.5 font-semibold">TYPE</th>
                <th className="px-4 py-2.5 font-semibold">CHANNEL</th>
                <th className="px-4 py-2.5 text-right font-semibold">
                  AMOUNT (CURRENCY)
                </th>
                <th className="px-4 py-2.5 font-semibold">STATUS</th>
                <th className="w-10 px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {operations.map((op) => (
                <tr
                  key={op.reference}
                  className="border-b border-card-border last:border-0 hover:bg-background-soft-50"
                >
                  <td className="whitespace-nowrap px-4 py-3 font-subtitle text-xs text-text-secondary">
                    {op.timestamp}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-subtitle text-xs text-foreground-100 underline decoration-card-border underline-offset-2">
                    {op.reference}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-foreground-100">
                    {op.type}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <ChannelBadge channel={op.channel} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right font-subtitle text-foreground-100">
                    {op.amount && (
                      <>
                        {op.amount}{" "}
                        <span className="text-text-tertiary">
                          {op.currency}
                        </span>
                      </>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <StatusBadge status={op.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-text-tertiary hover:text-text-color">
                      <MoreVertical className="size-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div className="border border-t-0 bg-background-soft-10 border-card-border flex flex-wrap items-center justify-between gap-3 p-4 text-sm text-text-secondary">
          <span>Showing 1 to {operations.length} of 84,209 entries</span>

          <div className="flex items-center gap-1">
            <button
              disabled
              className="rounded-xs px-2.5 py-1 text-text-tertiary disabled:cursor-not-allowed"
            >
              Prev
            </button>
            {[1, 2, 3].map((n) => (
              <button
                key={n}
                className={cn(
                  "rounded-xs px-2.5 py-1",
                  n === page
                    ? "bg-foreground-100 text-white-100"
                    : "text-text-secondary hover:bg-background-soft-100",
                )}
              >
                {n}
              </button>
            ))}
            <span className="px-1 text-text-tertiary">...</span>
            <button className="rounded-xs px-2.5 py-1 text-text-secondary hover:bg-background-soft-100">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
