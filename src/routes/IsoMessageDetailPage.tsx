// routes/IsoMessageDetailPage.tsx
import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ArrowLeft, Clock, Copy, Hash } from "lucide-react";
import { format } from "date-fns";

import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/Button";
import { findIsoLog } from "@/constants/mock/mockIsoLogs";
import {
  parseHexDump,
  parseRawXmlFields,
  splitRawMessage,
} from "@/utils/isoParsing";

type PanelView = "structured" | "raw";

export default function IsoMessageDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [panel, setPanel] = useState<PanelView>("structured");
  const [hexView, setHexView] = useState<"hex" | "ascii">("hex");

  const entry = useMemo(() => (id ? findIsoLog(Number(id)) : undefined), [id]);

  const parsed = useMemo(() => {
    if (!entry?.raw) return null;
    const { xml, hexOctets, hexText } = splitRawMessage(entry.raw);
    return {
      fields: parseRawXmlFields(xml),
      hexOctets,
      hexLines: parseHexDump(hexText),
    };
  }, [entry]);

  if (!entry) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
        <p className="text-lg font-semibold text-foreground-100">
          Message not found
        </p>
        <p className="text-sm text-text-secondary">
          No ISO message matches id "{id}".
        </p>
        <Button
          appearance="outline"
          size="sm"
          onClick={() => navigate("/iso-messages")}
        >
          Back to ISO Messages
        </Button>
      </div>
    );
  }

  const copyFieldsAsJson = () => {
    if (!parsed) return;
    navigator.clipboard.writeText(JSON.stringify(parsed.fields, null, 2));
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            to="/iso-messages"
            className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-foreground-100"
          >
            <ArrowLeft className="size-4" />
            Back to ISO Messages
          </Link>
        </div>
      </div>

      <div>
        <h1 className="font-title text-xl font-bold text-foreground-100">
          Message Inspector
        </h1>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-xs border border-card-border bg-background-soft-50 px-2.5 py-1 font-subtitle text-xs text-foreground-100">
              <Hash className="size-3.5 text-text-tertiary" />
              MSG-{String(entry.id)?.padStart(6, "0")}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-xs bg-badge-blue-background px-2.5 py-1 font-subtitle text-xs font-medium text-badge-blue-text">
              MTI {entry.mti}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-xs border border-card-border bg-background-soft-50 px-2.5 py-1 font-subtitle text-xs text-text-secondary">
              <Clock className="size-3.5 text-text-tertiary" />
              {format(
                new Date(entry.event_time),
                "yyyy-MM-dd HH:mm:ss.SSS",
              )}{" "}
              UTC
            </span>
          </div>

          {/* Structured / Raw toggle (drives which panel shows on small screens) */}
          <div className="flex items-center gap-1 rounded-xs border border-card-border bg-card-background-100 p-1 shadow-xs">
            <button
              onClick={() => setPanel("structured")}
              className={cn(
                "rounded-xs px-3 py-1.5 text-xs font-semibold tracking-wide",
                panel === "structured"
                  ? "bg-foreground-100 text-white-100"
                  : "text-text-secondary hover:bg-background-soft-100",
              )}
            >
              STRUCTURED
            </button>
            <button
              onClick={() => setPanel("raw")}
              className={cn(
                "rounded-xs px-3 py-1.5 text-xs font-semibold tracking-wide",
                panel === "raw"
                  ? "bg-foreground-100 text-white-100"
                  : "text-text-secondary hover:bg-background-soft-100",
              )}
            >
              RAW
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Structured panel */}
        <div
          className={cn(
            "flex w-full flex-col rounded-xs border border-card-border bg-card-background-100 shadow-xs",
          )}
        >
          <div className="flex items-center justify-between border-b border-card-border px-4 py-3">
            <h2 className="text-sm font-semibold text-foreground-100">
              Structured (Parsed)
            </h2>
            <button
              onClick={copyFieldsAsJson}
              disabled={!parsed || parsed.fields.length === 0}
              className="flex items-center gap-1.5 text-xs font-medium text-primary-600 hover:underline disabled:cursor-not-allowed disabled:text-text-tertiary disabled:no-underline"
            >
              <Copy className="size-3.5" />
              Copy JSON
            </button>
          </div>

          {parsed && parsed.fields.length > 0 ? (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-card-border text-xs font-semibold tracking-wide text-text-tertiary">
                  <th className="px-4 py-2.5">FLD</th>
                  <th className="px-4 py-2.5">NAME</th>
                  <th className="px-4 py-2.5">VALUE</th>
                </tr>
              </thead>
              <tbody>
                {parsed.fields.map((field) => (
                  <tr
                    key={field.id}
                    className="border-b border-card-border last:border-0"
                  >
                    <td className="px-4 py-2.5 font-subtitle text-xs text-text-tertiary">
                      {field.id}
                    </td>
                    <td className="px-4 py-2.5 font-medium text-foreground-100">
                      {field.name}
                    </td>
                    <td
                      className={cn(
                        "px-4 py-2.5 font-subtitle text-xs",
                        field.id === "39"
                          ? field.value === "00"
                            ? "text-success-600"
                            : "text-error-600"
                          : "text-foreground-100",
                      )}
                    >
                      {field.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="px-4 py-10 text-center text-sm text-text-secondary">
              No structured dump available for this message.
            </p>
          )}
        </div>

        {/* Raw hex / EBCDIC panel */}
        <div
          className={cn(
            "w-2/3 flex flex-col overflow-hidden transition-all duration-300 rounded-xs border border-card-border bg-card-background-100 shadow-xs",
            panel === "structured" && "w-0 border-none",
          )}
        >
          <div className="flex items-center justify-between border-b border-card-border px-4 py-3">
            <h2 className="text-sm font-semibold text-foreground-100">
              Raw Hex / EBCDIC
              {parsed?.hexOctets != null && (
                <span className="ml-1.5 font-normal text-text-tertiary">
                  · {parsed.hexOctets} octets
                </span>
              )}
            </h2>
            <div className="flex items-center gap-1 rounded-xs border border-card-border p-0.5">
              <button
                onClick={() => setHexView("hex")}
                className={cn(
                  "rounded-xs px-2 py-1 text-xs font-semibold",
                  hexView === "hex"
                    ? "bg-foreground-100 text-white-100"
                    : "text-text-secondary hover:bg-background-soft-100",
                )}
              >
                HEX
              </button>
              <button
                onClick={() => setHexView("ascii")}
                className={cn(
                  "rounded-xs px-2 py-1 text-xs font-semibold",
                  hexView === "ascii"
                    ? "bg-foreground-100 text-white-100"
                    : "text-text-secondary hover:bg-background-soft-100",
                )}
              >
                ASCII
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto bg-sidebar-nav-default-background p-4">
            {parsed && parsed.hexLines.length > 0 ? (
              <table className="w-full font-subtitle text-xs">
                <tbody>
                  {parsed.hexLines.map((line) => (
                    <tr key={line.offset}>
                      <td className="whitespace-nowrap py-0.5 pr-3 align-top text-primary-400">
                        {line.offset}
                      </td>
                      <td
                        className={cn(
                          "whitespace-nowrap py-0.5 pr-3 align-top",
                          hexView === "hex"
                            ? "text-white-90"
                            : "text-white-90/30",
                        )}
                      >
                        {line.hex}
                      </td>
                      <td
                        className={cn(
                          "whitespace-pre py-0.5 align-top",
                          hexView === "ascii"
                            ? "text-success-500"
                            : "text-success-500/30",
                        )}
                      >
                        {line.ascii}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="py-10 text-center text-sm text-white-70">
                No raw dump available for this message.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
