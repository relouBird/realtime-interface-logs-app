// routes/RawLogsPage.tsx
import { useSeoHead } from "@/composables/useSeoHead";

// routes/RawLogsPage.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronRight, Copy, Radio } from "lucide-react";

import { cn } from "@/utils/cn";
import {
  hasRawDetail,
  parseLogService,
  summarizeLogMessage,
  toDate,
} from "@/utils/logParsing";
import { dateFormat } from "@/helpers";
import { useRawLogStore } from "@/stores/raw-logs.store";

const LEVEL_OPTIONS = ["All Levels", "INFO", "WARN", "ERROR", "DEBUG"];

const LEVEL_STYLES: Record<string, string> = {
  INFO: "border-card-border bg-text-secondary/30 text-text-secondary",
  WARN: "border-warning-400 bg-warning-200 text-warning-600",
  ERROR: "border-error-400 bg-error-200 text-error-600",
  DEBUG: "border-transparent text-text-tertiary",
};

function LevelBadge({ level }: { level: string }) {
  const style = LEVEL_STYLES[level] ?? LEVEL_STYLES.INFO;
  return (
    <span
      className={cn(
        "inline-flex w-18.5 shrink-0 items-center justify-center gap-1 rounded-xs border px-1.5 py-0.5 text-[11px] font-semibold tracking-wide",
        style,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {level}
    </span>
  );
}

/** Colors XML tags vs. plain text — no dangerouslySetInnerHTML, just tokens. */
function HighlightedRaw({ text }: { text: string }) {
  const tokens = text.split(/(<[^>]+>)/g);
  return (
    <>
      {tokens.map((token, i) => {
        if (!token) return null;
        if (token.startsWith("<!--")) {
          return (
            <span key={i} className="italic text-white-60/60">
              {token}
            </span>
          );
        }
        if (token.startsWith("<")) {
          return (
            <span key={i} className="text-primary-300">
              {token}
            </span>
          );
        }
        return (
          <span key={i} className="text-white-90">
            {token}
          </span>
        );
      })}
    </>
  );
}

export default function RawLogsPage() {
  useSeoHead({
    title: "Logs bruts",
    subtitle: "Accès aux logs techniques détaillés",
    forcePrefix: true,
  });

  const [levelFilter, setLevelFilter] = useState(LEVEL_OPTIONS[0]);
  const [isLive, setIsLive] = useState(true);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  const consoleRef = useRef<HTMLDivElement>(null);

  // Store
  const currentPage = useRawLogStore((state) => state.currentPage);
  const pages = useRawLogStore((state) => state.pages);
  const hasMore = useRawLogStore((state) => state.hasMore);
  const setPage = useRawLogStore((state) => state.goToPage);
  const getPreviousPage = useRawLogStore((state) => state.getPreviousPage);
  const getNextPage = useRawLogStore((state) => state.getNextPage);

  const getMany = useRawLogStore((state) => state.getMany);
  const loading = useRawLogStore((state) => state.loading);

  const filtered = useMemo(() => {
    const currentLogs = pages[currentPage - 1]?.data ?? [];
    const filteredLogs = currentLogs.filter((log) => {
      const matchesLevel =
        levelFilter === LEVEL_OPTIONS[0] || log.status === levelFilter;
      return matchesLevel;
    });
    // Tri : on crée une copie pour ne pas muter
    return [...filteredLogs].sort(
      (a, b) => toDate(a.timestamp).getTime() - toDate(b.timestamp).getTime(),
    );
  }, [levelFilter, pages, currentPage]);

  useEffect(() => {
    if (isLive && consoleRef.current && filtered.length > 0) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [filtered, isLive]);

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const copyRaw = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Chargement initial
  useEffect(() => {
    if (pages.length === 0 && !loading) {
      getMany();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="flex flex-col gap-0">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-title text-2xl font-bold text-foreground-100">
            Raw Technical Logs
          </h1>
          <p className="text-sm text-text-secondary">
            Real-time diagnostic stream for financial transaction events — every
            action, down to bootstrapping a connection, writes here.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsLive((v) => !v)}
            className={cn(
              "flex items-center gap-1.5 rounded-xs px-3 py-1.5 text-xs font-bold",
              isLive
                ? "bg-primary-500/20 text-primary-700"
                : "bg-background-soft-100 text-text-secondary",
            )}
          >
            <Radio className={cn("size-3.5", isLive && "animate-pulse")} />
            {isLive ? "LIVE" : "PAUSED"}
          </button>

          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="rounded-xs border border-button-outline-border bg-button-outline-background px-2.5 py-1.5 text-sm text-button-outline-text focus:outline-none"
          >
            {LEVEL_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Console */}
      <div
        ref={consoleRef}
        className="max-h-[62vh] mt-6 overflow-y-auto rounded-xs border border-card-border bg-sidebar-nav-default-background p-3 font-subtitle text-xs shadow-xs"
      >
        {/* Table header */}
        <div className="sticky -top-3 z-10 grid grid-cols-[74px_190px_140px_1fr_20px] gap-3 border-b border-white-100/10 bg-sidebar-nav-default-background px-2 py-2 text-[11px] font-semibold tracking-wide text-white-60">
          <span>LEVEL</span>
          <span>TIMESTAMP</span>
          <span>SERVICE</span>
          <span>MESSAGE</span>
          <span />
        </div>

        <div className="flex flex-col">
          {filtered.map((log) => {
            const { service, session } = parseLogService(log.message);
            const summary = summarizeLogMessage(log.message);
            const expandable = hasRawDetail(log.message);
            const isExpanded = expandedIds.has(log.id);

            return (
              <div
                key={log.id}
                className="border-b border-white-100/5 last:border-0"
              >
                <button
                  onClick={() => expandable && toggleExpand(log.id)}
                  className={cn(
                    "grid w-full grid-cols-[74px_190px_140px_1fr_20px] items-start gap-3 px-2 py-2 text-left",
                    expandable && "cursor-pointer hover:bg-white-100/5",
                  )}
                >
                  <LevelBadge level={log.status} />
                  <span className="whitespace-nowrap text-white-70">
                    {dateFormat(
                      toDate(log.timestamp),
                      "YYYY-MM-DD HH:mm:ss.lll",
                      "fr-FR",
                    )}
                  </span>
                  <span className="flex flex-col">
                    <span className="truncate text-primary-300">{service}</span>
                    {session && (
                      <span className="truncate text-[11px] text-white-60/70">
                        {session}
                      </span>
                    )}
                  </span>
                  <span className="text-white-90">{summary}</span>
                  {expandable && (
                    <ChevronRight
                      className={cn(
                        "mt-0.5 size-3.5 shrink-0 text-white-60 transition-transform",
                        isExpanded && "rotate-90",
                      )}
                    />
                  )}
                </button>

                {expandable && isExpanded && (
                  <div className="mx-2 mb-3 rounded-xs border border-white-100/10 bg-black/20 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-[11px] font-semibold tracking-wide text-white-60">
                        RAW PAYLOAD
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyRaw(log.message);
                        }}
                        className="flex items-center gap-1 text-[11px] text-white-60 hover:text-white-90"
                      >
                        <Copy className="size-3" />
                        Copy
                      </button>
                    </div>
                    <pre className="whitespace-pre-wrap leading-relaxed">
                      <HighlightedRaw text={log.message} />
                    </pre>
                  </div>
                )}
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="px-2 py-10 text-center text-white-60">
              No log entries match these filters.
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex mt-4 flex-wrap items-center justify-between gap-3 rounded-xs border border-card-border bg-card-background-100 p-3 text-sm text-text-secondary shadow-xs">
        <span>Showing {filtered.length} entries</span>
        <div className="flex items-center gap-1">
          <button
            disabled={currentPage === 1}
            onClick={() => getPreviousPage()}
            className="rounded-xs px-2.5 py-1 text-text-secondary hover:bg-background-soft-100 disabled:cursor-not-allowed disabled:text-text-tertiary disabled:hover:bg-transparent"
          >
            Prev
          </button>
          {Array.from({ length: pages.length }, (_, i) => i + 1).map((n) => (
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
            disabled={hasMore === false}
            onClick={() => getNextPage()}
            className="rounded-xs px-2.5 py-1 text-text-secondary hover:bg-background-soft-100 disabled:cursor-not-allowed disabled:text-text-tertiary disabled:hover:bg-transparent"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
