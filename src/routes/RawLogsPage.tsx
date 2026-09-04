// routes/RawLogsPage.tsx
import { useSeoHead } from "@/composables/useSeoHead";

// routes/RawLogsPage.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Search, ChevronRight, Copy, Radio } from "lucide-react";

import { MOCK_SYNC_LOGS } from "@/constants/mock/mockSyncLogs";

import { cn } from "@/utils/cn";
import {
  hasRawDetail,
  parseLogService,
  summarizeLogMessage,
  toDate,
} from "@/utils/logParsing";
import { dateFormat } from "@/utils/helper";

const LEVEL_OPTIONS = ["All Levels", "INFO", "WARN", "ERROR", "DEBUG"];
const TIME_RANGE_OPTIONS = [
  { label: "Last 15m", ms: 15 * 60 * 1000 },
  { label: "Last 1h", ms: 60 * 60 * 1000 },
  { label: "Last 24h", ms: 24 * 60 * 60 * 1000 },
  { label: "All time", ms: null as number | null },
];

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

  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState(LEVEL_OPTIONS[0]);
  const [timeRangeLabel, setTimeRangeLabel] = useState(
    TIME_RANGE_OPTIONS[3].label,
  );
  const [isLive, setIsLive] = useState(true);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  const consoleRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const range = TIME_RANGE_OPTIONS.find((r) => r.label === timeRangeLabel);
    const latest = Math.max(
      ...MOCK_SYNC_LOGS.map((l) => toDate(l.timestamp).getTime()),
    );

    return MOCK_SYNC_LOGS.filter((log) => {
      const { service, session } = parseLogService(log.message);

      const matchesQuery =
        query.length === 0 ||
        String(log.id).includes(query) ||
        service.toLowerCase().includes(query) ||
        (session ?? "").toLowerCase().includes(query) ||
        log.message.toLowerCase().includes(query);

      const matchesLevel =
        levelFilter === LEVEL_OPTIONS[0] || log.status === levelFilter;

      const matchesRange =
        !range?.ms || latest - toDate(log.timestamp).getTime() <= range.ms;

      return matchesQuery && matchesLevel && matchesRange;
    }).sort(
      (a, b) => toDate(a.timestamp).getTime() - toDate(b.timestamp).getTime(),
    );
  }, [search, levelFilter, timeRangeLabel]);

  useEffect(() => {
    if (isLive && consoleRef.current) {
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

  return (
    <div className="flex flex-col gap-4">
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

      {/* Search + time range */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-60">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-tertiary" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search log id, service, session or message payload..."
            className="w-full rounded-xs border border-card-border bg-card-background-100 py-2.5 pl-9 pr-3 text-sm text-foreground-100 shadow-xs placeholder:text-input-placeholder-text focus:border-input-primary-focus-border focus:outline-none"
          />
        </div>

        <select
          value={timeRangeLabel}
          onChange={(e) => setTimeRangeLabel(e.target.value)}
          className="rounded-xs border border-card-border bg-card-background-100 px-3 py-2.5 text-sm text-foreground-100 shadow-xs focus:outline-none"
        >
          {TIME_RANGE_OPTIONS.map((opt) => (
            <option key={opt.label} value={opt.label}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Console */}
      <div
        ref={consoleRef}
        className="max-h-155 overflow-y-auto rounded-xs border border-card-border bg-sidebar-nav-default-background p-3 font-subtitle text-xs shadow-xs"
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
    </div>
  );
}
