// routes/OverviewPage.tsx
import { useSeoHead } from "@/composables/useSeoHead";
import { useEffect, useMemo } from "react";
import {
  Newspaper,
  CheckCircle2,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Info,
  AlertTriangle,
  ChevronDown,
  Download,
  ArrowUp,
  MoreVertical,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/transactions/StatusBadge";
import { ChannelBadge } from "@/components/transactions/ChannelBadge";
import { useTransactionStore } from "@/stores/transactions.store";
import { Pagination } from "@/components/display/Pagination";
import { formatAmount } from "@/utils/iso8583";
import { dateFormat } from "@/helpers";

/* -------------------------------------------------------------------------- */
/*  Formatting helpers — centralise the null-handling so the JSX below stays  */
/*  readable. `summary` is `TransactionSummary | null` (null while loading or */
/*  if the fetch failed) — never fabricate a fallback number, show a dash.    */
/* -------------------------------------------------------------------------- */

function formatCount(value: number | null | undefined): string {
  if (value == null) return "—";
  return new Intl.NumberFormat("en-US").format(value);
}

function formatPercent(value: number | null | undefined, decimals = 1): string {
  if (value == null) return "—";
  return `${value.toFixed(decimals)}%`;
}

function formatOpsPerSecond(value: number | null | undefined): string {
  if (value == null) return "—";
  return value.toLocaleString("en-US", { maximumFractionDigits: 1 });
}

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

function FilterSelect({ label }: { label: string }) {
  return (
    <button className="inline-flex items-center gap-1.5 rounded-xs border border-button-outline-border bg-button-outline-background px-3 py-1.5 text-sm text-button-outline-text hover:bg-button-outline-hover-background">
      {label}
      <ChevronDown className="size-3.5 text-text-tertiary" />
    </button>
  );
}

/** Footer for the "Total Transactions Today" card: no data for yesterday yet
 * (division by zero avoided server-side → `null`) vs. an actual up/down %. */
function TodayTrendFooter({
  changePct,
}: {
  changePct: number | null | undefined;
}) {
  if (changePct == null) {
    return (
      <span className="flex items-center gap-1 text-text-tertiary">
        <Info className="size-3.5" />
        No data for yesterday yet
      </span>
    );
  }

  const isUp = changePct >= 0;
  const Icon = isUp ? TrendingUp : TrendingDown;

  return (
    <span
      className={cn(
        "flex items-center gap-1",
        isUp ? "text-success-600" : "text-error-600",
      )}
    >
      <Icon className="size-3.5" />
      {isUp ? "+" : ""}
      {changePct.toFixed(1)}% vs yesterday
    </span>
  );
}

/** Footer for the "Active Processing" card: only warn when something is
 * actually delayed — don't claim "no delays" while summary is still null. */
function ProcessingFooter({
  summary,
}: {
  summary: { delayedInQueue: number } | null | undefined;
}) {
  if (!summary) {
    return (
      <span className="flex items-center gap-1 text-text-tertiary">
        <Info className="size-3.5" />
        Loading queue status...
      </span>
    );
  }

  if (summary.delayedInQueue > 0) {
    return (
      <span className="flex items-center gap-1 text-warning-600">
        <AlertTriangle className="size-3.5" />
        {summary.delayedInQueue} delayed in queue
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1 text-success-600">
      <CheckCircle2 className="size-3.5" />
      No delays
    </span>
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

  // store
  const summary = useTransactionStore((state) => state.summary);
  const fetchSummary = useTransactionStore((state) => state.fetchSummary);
  const currentPage = useTransactionStore((state) => state.currentPage);
  const pages = useTransactionStore((state) => state.pages);
  const hasMore = useTransactionStore((state) => state.hasMore);
  const setPage = useTransactionStore((state) => state.goToPage);
  const getPreviousPage = useTransactionStore((state) => state.getPreviousPage);
  const getNextPage = useTransactionStore((state) => state.getNextPage);

  const getMany = useTransactionStore((state) => state.getMany);
  const setFilterState = useTransactionStore((state) => state.setFilterState);
  const loading = useTransactionStore((state) => state.loading);

  // live / nouvelles transactions
  const live = useTransactionStore((state) => state.live);
  const pendingNewCount = useTransactionStore((state) => state.pendingNewCount);
  const revealNewTransactions = useTransactionStore(
    (state) => state.revealNewTransactions,
  );
  const startPolling = useTransactionStore((state) => state.startPolling);
  const stopPolling = useTransactionStore((state) => state.stopPolling);

  const filtered = useMemo(() => {
    const currentPayments = pages[currentPage - 1]?.data ?? [];
    return currentPayments;
  }, [currentPage, pages]);

  // Chargement initial — l'Overview veut toujours les transactions
  // financières uniquement (filter = true), quel que soit ce que la page
  // Transactions a demandé avant.
  useEffect(() => {
    async function getAllData() {
      try {
        setFilterState(true);
        await getMany();
        await fetchSummary();
      } catch (error) {
        console.error("Failed to fetch transaction summary:", error);
      }
    }

    if (!loading) {
      getAllData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Poll de 10s — idempotent, donc pas grave si Transactions le démarre
  // aussi ailleurs.
  useEffect(() => {
    startPolling();
    return () => stopPolling();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col gap-6">
      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          label="TOTAL TRANSACTIONS TODAY"
          value={formatCount(summary?.totalToday)}
          icon={Newspaper}
          footer={<TodayTrendFooter changePct={summary?.totalTodayChangePct} />}
        />
        <KpiCard
          label="SUCCESS RATE"
          value={formatPercent(summary?.successRate24h)}
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
          value={formatCount(summary?.activeProcessing)}
          icon={RefreshCw}
          footer={<ProcessingFooter summary={summary} />}
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
              <span className="font-subtitle">
                {formatCount(summary?.total24h)}
              </span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-semibold tracking-wide text-text-tertiary">
              SUCCESS RATE
            </p>
            <p className="mt-0.5 text-sm font-semibold text-foreground-100">
              <span className="font-subtitle">
                {formatPercent(summary?.successRate24h)}
              </span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-semibold tracking-wide text-text-tertiary">
              ACTIVE PROCESSING
            </p>
            <p className="mt-0.5 text-sm font-semibold text-foreground-100">
              <span className="font-subtitle">
                {formatOpsPerSecond(summary?.opsPerSecond)}
              </span>{" "}
              <span className="text-text-secondary">Ops/sec</span>
            </p>
          </div>
        </div>
      </div>

      {/* Live operations panel */}
      <div className=" bg-card-background-100 shadow-xs relative">
        {!live && pendingNewCount > 0 && (
          <button
            onClick={() => revealNewTransactions()}
            className="absolute left-1/2 top-13 z-10 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-full bg-foreground-100 px-3 py-1.5 text-xs font-medium text-white-100 shadow-md hover:bg-foreground-soft-200"
          >
            <ArrowUp className="size-3.5" />
            Show new operations ({pendingNewCount})
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
            <Button
              variant="ghost"
              size="xs"
              iconOnly
              onClick={() => revealNewTransactions()}
              title="Refresh now"
            >
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
              {filtered.map((op) => {
                const reference =
                  op.request.terminalCode + "." + op.request.stan;
                return (
                  <tr
                    key={reference}
                    className="border-b border-card-border last:border-0 hover:bg-background-soft-50"
                  >
                    <td className="whitespace-nowrap px-4 py-3 font-subtitle text-xs text-text-secondary">
                      {dateFormat(new Date(op.createdAt), "HH:mm:ss.lll")}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-subtitle text-xs text-foreground-100 underline decoration-card-border underline-offset-2">
                      {reference}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-foreground-100">
                      <ChannelBadge channel={op.action.replace("_", " ")} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <ChannelBadge
                        channel={op.request.merchantName ?? "GIM"}
                      />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-subtitle text-foreground-100">
                      {op.request.transactionAmount ? (
                        <>
                          {formatAmount(
                            op.request.transactionAmount,
                            op.request.transactionCurrency,
                          )}
                        </>
                      ) : (
                        "—"
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
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <Pagination
          variant="inset"
          className="bg-background-soft-10 border border-t-0 border-card-border"
          currentPage={currentPage}
          pageCount={pages.length}
          entryCount={filtered.length}
          hasMore={hasMore}
          onPrevious={getPreviousPage}
          onNext={getNextPage}
          onSelectPage={setPage}
        />
      </div>
    </div>
  );
}
