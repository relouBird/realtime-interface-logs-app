// routes/IsoMessagesPage.tsx
import { useSeoHead } from "@/composables/useSeoHead";

// routes/IsoMessagesPage.tsx
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  Search,
  List,
  LayoutGrid,
  ArrowDownToLine,
  ArrowUpFromLine,
} from "lucide-react";

import { cn } from "@/utils/cn";
import { MOCK_ISO_LOGS } from "@/constants/mock/mockIsoLogs";
import type { IsoLogEntry } from "@/types/isoLog.type";
import { dateFormat } from "@/utils/helper";

const PAGE_SIZE = 6;

function MtiBadge({ mti }: { mti: string }) {
  return (
    <span className="inline-flex items-center justify-center rounded-xs bg-badge-blue-background px-2 py-0.5 font-subtitle text-xs font-medium text-badge-blue-text">
      {mti}
    </span>
  );
}

function DirectionBadge({
  direction,
}: {
  direction: IsoLogEntry["direction"];
}) {
  const isIn = direction === "IN";
  const Icon = isIn ? ArrowDownToLine : ArrowUpFromLine;
  return (
    <span
      className={cn(
        "w-20 inline-flex items-center justify-center gap-1 rounded-xs px-2 py-0.5 text-xs font-medium",
        isIn
          ? "bg-badge-cyan-background  border border-badge-cyan-icon-color/60 text-badge-cyan-text"
          : "bg-badge-purple-background border border-badge-purple-icon-color/60 text-badge-purple-text",
      )}
    >
      <Icon className="size-3" />
      {direction}
    </span>
  );
}

export default function IsoMessagesPage() {
  useSeoHead({
    title: "Messages ISO",
    subtitle: "Consultez et filtrez les messages ISO 8583",
    forcePrefix: true,
  });

  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [view, setView] = useState<"list" | "grid">("list");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return MOCK_ISO_LOGS.filter(
      (entry) => query.length === 0 || entry.stan.toLowerCase().includes(query),
    ).sort(
      (a, b) =>
        new Date(b.event_time).getTime() - new Date(a.event_time).getTime(),
    );
  }, [search]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageItems = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const goToDetail = (entry: IsoLogEntry) => {
    navigate(`/iso-messages/${entry.id}`);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div>
        <h1 className="font-title text-2xl font-bold text-foreground-100">
          ISO Messages
        </h1>
        <p className="text-sm text-text-secondary">
          Every request/response and network-management frame exchanged with the
          switch — including sign-on and heartbeat traffic.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-60">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-tertiary" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Filtrer par STAN..."
            className="w-full rounded-xs border border-card-border bg-card-background-100 py-2.5 pl-9 pr-3 text-sm text-foreground-100 shadow-xs placeholder:text-input-placeholder-text focus:border-input-primary-focus-border focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1 rounded-xs border border-card-border bg-card-background-100 p-1 shadow-xs">
          <button
            onClick={() => setView("list")}
            className={cn(
              "grid size-8 place-items-center rounded-xs",
              view === "list"
                ? "bg-primary-100 text-primary-600"
                : "text-text-tertiary hover:bg-background-soft-100",
            )}
          >
            <List className="size-4" />
          </button>
          <button
            onClick={() => setView("grid")}
            className={cn(
              "grid size-8 place-items-center rounded-xs",
              view === "grid"
                ? "bg-primary-100 text-primary-600"
                : "text-text-tertiary hover:bg-background-soft-100",
            )}
          >
            <LayoutGrid className="size-4" />
          </button>
        </div>
      </div>

      {/* List view */}
      {view === "list" && (
        <div className="rounded-xs border border-card-border bg-card-background-100 shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-card-border text-xs font-semibold tracking-wide text-text-tertiary">
                  <th className="px-4 py-2.5">STAN</th>
                  <th className="px-4 py-2.5">MTI</th>
                  <th className="px-4 py-2.5">DIRECTION</th>
                  <th className="px-4 py-2.5">HORODATAGE</th>
                  <th className="px-4 py-2.5">MESSAGE BRUT</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((entry) => (
                  <tr
                    key={entry.id}
                    onClick={() => goToDetail(entry)}
                    className="cursor-pointer border-b border-card-border last:border-0 hover:bg-background-soft-50"
                  >
                    <td className="whitespace-nowrap px-4 py-3 font-subtitle text-sm font-medium text-foreground-100">
                      {entry.stan}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="flex items-center gap-1">
                        <MtiBadge mti={entry.mti} />
                        <span className="text-xs font-medium tracking-wide text-text-tertiary">
                          {entry.event_type}
                        </span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <DirectionBadge direction={entry.direction} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <p className="font-subtitle text-xs text-foreground-100">
                        {dateFormat(
                          entry.event_time,
                          "DD/MM/YYYY HH:mm:ss.lll",
                          "fr-FR",
                        )}
                      </p>
                      <p className="text-[11px] text-text-tertiary">
                        {entry.connection_name}
                      </p>
                    </td>
                    <td className="px-4 py-3 font-subtitle text-xs italic text-text-secondary">
                      {entry.detail}
                    </td>
                  </tr>
                ))}

                {pageItems.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-10 text-center text-sm text-text-secondary"
                    >
                      Aucun message ne correspond à ce STAN.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-card-border p-4 text-sm text-text-secondary">
            <span>
              Showing{" "}
              {pageItems.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}{" "}
              to {(currentPage - 1) * PAGE_SIZE + pageItems.length} of{" "}
              {filtered.length} entries
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-xs px-2.5 py-1 text-text-secondary hover:bg-background-soft-100 disabled:cursor-not-allowed disabled:text-text-tertiary disabled:hover:bg-transparent"
              >
                Prev
              </button>
              {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={cn(
                    "rounded-xs px-2.5 py-1",
                    n === currentPage
                      ? "bg-foreground-100 text-white-100"
                      : "text-text-secondary hover:bg-background-soft-100",
                  )}
                >
                  {n}
                </button>
              ))}
              <button
                disabled={currentPage === pageCount}
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                className="rounded-xs px-2.5 py-1 text-text-secondary hover:bg-background-soft-100 disabled:cursor-not-allowed disabled:text-text-tertiary disabled:hover:bg-transparent"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grid view */}
      {view === "grid" && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pageItems.map((entry) => (
              <button
                key={entry.id}
                onClick={() => goToDetail(entry)}
                className="flex flex-col gap-3 rounded-xs border border-card-border bg-card-background-100 p-4 text-left shadow-xs hover:border-primary-300"
              >
                <div className="flex items-center justify-between">
                  <span className="font-subtitle text-sm font-semibold text-foreground-100">
                    {entry.stan}
                  </span>
                  <DirectionBadge direction={entry.direction} />
                </div>
                <div className="flex items-center gap-2">
                  <MtiBadge mti={entry.mti} />
                  <span className="text-[11px] font-medium tracking-wide text-text-tertiary">
                    {entry.event_type}
                  </span>
                </div>
                <p className="line-clamp-2 font-subtitle text-xs italic text-text-secondary">
                  {entry.detail}
                </p>
                <p className="font-subtitle text-[11px] text-text-tertiary">
                  {dateFormat(
                    entry.event_time,
                    "DD/MM/YYYY HH:mm:ss.lll",
                    "fr-FR",
                  )}{" "}
                  · {entry.connection_name}
                </p>
              </button>
            ))}

            {pageItems.length === 0 && (
              <div className="col-span-full rounded-lg border border-dashed border-card-border p-10 text-center text-sm text-text-secondary">
                Aucun message ne correspond à ce STAN.
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xs border border-card-border bg-card-background-100 p-4 text-sm text-text-secondary shadow-xs">
            <span>
              Showing{" "}
              {pageItems.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}{" "}
              to {(currentPage - 1) * PAGE_SIZE + pageItems.length} of{" "}
              {filtered.length} entries
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-xs px-2.5 py-1 text-text-secondary hover:bg-background-soft-100 disabled:cursor-not-allowed disabled:text-text-tertiary disabled:hover:bg-transparent"
              >
                Prev
              </button>
              {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={cn(
                    "rounded-xs px-2.5 py-1",
                    n === currentPage
                      ? "bg-foreground-100 text-white-100"
                      : "text-text-secondary hover:bg-background-soft-100",
                  )}
                >
                  {n}
                </button>
              ))}
              <button
                disabled={currentPage === pageCount}
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                className="rounded-xs px-2.5 py-1 text-text-secondary hover:bg-background-soft-100 disabled:cursor-not-allowed disabled:text-text-tertiary disabled:hover:bg-transparent"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
