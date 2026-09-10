// routes/TransactionsPage.tsx
import { useSeoHead } from "@/composables/useSeoHead";

// routes/TransactionsPage.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Search, ChevronRight, Download, RefreshCw } from "lucide-react";
import { format } from "date-fns";

import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/transactions/StatusBadge";
import { ChannelBadge } from "@/components/transactions/ChannelBadge";
import type { TransactionRecord } from "@/types/transaction.type";
import {
  formatAmount,
  maskPan,
  networkFromAcquirer,
  responseCodeLabel,
} from "@/utils/iso8583";
import { useTransactionStore } from "@/stores/transactions.store";
import { Pagination } from "@/components/display/Pagination";

const STATUS_OPTIONS = [
  "All statuses",
  "Success",
  "Failed",
  "Pending",
  "Timeout",
];
const MTI_OPTIONS = ["All MTIs", "1200", "1400", "1500"];
const ACTION_OPTIONS = [
  "All actions",
  "WITHDRAWAL",
  "PURCHASE",
  "REFUND",
  "REVERSAL",
  "BALANCE_INQUIRY",
];

function cleanMerchantName(name: string): string {
  return name.split("\\")[0] ?? name;
}

export default function TransactionsPage() {
  useSeoHead({
    title: "Transactions",
    subtitle: "Liste des transactions monétiques",
    forcePrefix: true,
  });

  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(STATUS_OPTIONS[0]);
  const [mtiFilter, setMtiFilter] = useState(MTI_OPTIONS[0]);
  const [actionFilter, setActionFilter] = useState(ACTION_OPTIONS[0]);

  // Store
  const currentPage = useTransactionStore((state) => state.currentPage);
  const pages = useTransactionStore((state) => state.pages);
  const hasMore = useTransactionStore((state) => state.hasMore);
  const setPage = useTransactionStore((state) => state.goToPage);
  const getPreviousPage = useTransactionStore((state) => state.getPreviousPage);
  const getNextPage = useTransactionStore((state) => state.getNextPage);

  const getMany = useTransactionStore((state) => state.getMany);
  const loading = useTransactionStore((state) => state.loading);

  const filtered = useMemo(() => {
    const currentPayments = pages[currentPage - 1]?.data ?? [];

    const query = search.trim().toLowerCase();

    return currentPayments
      .filter((tx) => {
        const matchesQuery =
          query.length === 0 ||
          tx.correlationId.toLowerCase().includes(query) ||
          tx.retrievalReferenceNumber.toLowerCase().includes(query) ||
          tx.request.pan.toLowerCase().includes(query) ||
          cleanMerchantName(tx.request.merchantName)
            .toLowerCase()
            .includes(query);

        const matchesStatus =
          statusFilter === STATUS_OPTIONS[0] ||
          tx.status.toUpperCase() === statusFilter.toUpperCase();

        const matchesMti = mtiFilter === MTI_OPTIONS[0] || tx.mti === mtiFilter;

        const matchesAction =
          actionFilter === ACTION_OPTIONS[0] || tx.action === actionFilter;

        return matchesQuery && matchesStatus && matchesMti && matchesAction;
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }, [search, statusFilter, mtiFilter, actionFilter, pages, currentPage]);

  const updateFilter = (setter: (v: string) => void, value: string) => {
    setter(value);
    setPage(1);
  };

  const goToDetail = (tx: TransactionRecord) => {
    navigate(`/transactions/${tx.correlationId}`);
  };

  // Chargement initial
  useEffect(() => {
    // fonction asynchrone pour récupérer toutes les transactions
    async function getAllTransactions() {
      try {
        await getMany();
      } catch (error) {
        console.log("Error :", error);
      }
    }

    // si aucune page n'est chargée et que le chargement n'est pas en cours, on récupère toutes les transactions
    if (pages.length === 0 && !loading) {
      getAllTransactions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-title text-2xl font-bold text-foreground-100">
            Transactions
          </h1>
          <p className="text-sm text-text-secondary">
            Every message processed by the switch, searchable by reference,
            card, or merchant.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Download className="size-4" />
            Export
          </Button>
          <Button variant="ghost" size="sm" iconOnly>
            <RefreshCw className="size-4" />
          </Button>
        </div>
      </div>

      {/* Panel */}
      <div className="rounded-xs border border-card-border bg-card-background-100 shadow-xs">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 border-b border-card-border p-4">
          <div className="relative flex-1 min-w-55">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-tertiary" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search reference, RRN, PAN or merchant"
              className="w-full rounded-xs border border-input-background bg-input-background py-1.5 pl-9 pr-3 text-sm text-foreground-100 placeholder:text-input-placeholder-text focus:border-input-primary-focus-border focus:outline-none"
            />
          </div>

          <select
            value={mtiFilter}
            onChange={(e) => updateFilter(setMtiFilter, e.target.value)}
            className="rounded-xs border border-button-outline-border bg-button-outline-background px-2.5 py-1.5 text-sm text-button-outline-text focus:outline-none"
          >
            {MTI_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt === MTI_OPTIONS[0] ? opt : `MTI ${opt}`}
              </option>
            ))}
          </select>

          <select
            value={actionFilter}
            onChange={(e) => updateFilter(setActionFilter, e.target.value)}
            className="rounded-xs border border-button-outline-border bg-button-outline-background px-2.5 py-1.5 text-sm text-button-outline-text focus:outline-none"
          >
            {ACTION_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => updateFilter(setStatusFilter, e.target.value)}
            className="rounded-xs border border-button-outline-border bg-button-outline-background px-2.5 py-1.5 text-sm text-button-outline-text focus:outline-none"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-card-border text-xs font-semibold tracking-wide text-text-tertiary">
                <th className="px-4 py-2.5">REFERENCE</th>
                <th className="px-4 py-2.5">MESSAGE</th>
                <th className="px-4 py-2.5">MERCHANT</th>
                <th className="px-4 py-2.5">CARD</th>
                <th className="px-4 py-2.5 text-right">AMOUNT</th>
                <th className="px-4 py-2.5">RESPONSE</th>
                <th className="px-4 py-2.5">STATUS</th>
                <th className="px-4 py-2.5">DATE</th>
                <th className="w-8 px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((tx) => (
                <tr
                  key={tx.correlationId}
                  onClick={() => goToDetail(tx)}
                  className="cursor-pointer border-b border-card-border last:border-0 hover:bg-background-soft-50"
                >
                  <td className="whitespace-nowrap px-4 py-3">
                    <p className="font-subtitle text-xs font-medium text-foreground-100">
                      {tx.correlationId}
                    </p>
                    <p className="font-subtitle text-xs text-text-tertiary">
                      RRN {tx.retrievalReferenceNumber}
                    </p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <ChannelBadge channel={tx.action.replace("_", " ")} />
                    </div>
                    <p className="mt-1 font-subtitle text-[11px] text-text-tertiary">
                      {tx.mti} ·{" "}
                      {networkFromAcquirer(tx.request.acquiringInstitutionCode)}
                    </p>
                  </td>
                  <td className="max-w-45 truncate px-4 py-3 text-foreground-100">
                    {cleanMerchantName(tx.request.merchantName)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-subtitle text-xs text-text-secondary">
                    {maskPan(tx.request.pan)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right font-subtitle text-foreground-100">
                    {formatAmount(
                      tx.request.transactionAmount,
                      tx.request.transactionCurrency,
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs">
                    {tx.response ? (
                      <span
                        className={cn(
                          "font-medium",
                          tx.response.responseCode === "00"
                            ? "text-success-600"
                            : "text-error-600",
                        )}
                      >
                        {tx.response.responseCode} ·{" "}
                        {responseCodeLabel(tx.response.responseCode)}
                      </span>
                    ) : (
                      <span className="text-text-tertiary">
                        Awaiting response
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <StatusBadge status={tx.status} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-text-secondary">
                    {format(new Date(tx.createdAt), "HH:mm:ss")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <ChevronRight className="size-4 text-text-tertiary" />
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-10 text-center text-sm text-text-secondary"
                  >
                    No transactions match these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          variant="inset"
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
