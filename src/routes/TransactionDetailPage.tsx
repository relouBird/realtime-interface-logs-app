// routes/TransactionDetailPage.tsx
import { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ArrowLeft, FileText, Terminal, RotateCw } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/transactions/StatusBadge";
import { findTransaction } from "@/constants/mock/mockTransactions";
import {
  durationMs,
  formatAmount,
  networkFromAcquirer,
  resolveBankName,
  responseCodeLabel,
} from "@/utils/iso8583";

interface LifecycleStep {
  title: string;
  description: string;
  timestamp: string;
  tone: "default" | "error";
}

/**
 * There's no dedicated audit-log endpoint yet, so the lifecycle is
 * reconstructed from the timestamps/fields we do have. Swap this for a real
 * `GET /transactions/:id/events` call once the backend exposes one — the
 * shape below (title/description/timestamp/tone) is what <ExecutionLifecycle>
 * expects, so the JSX won't need to change.
 */
function buildLifecycle(
  tx: NonNullable<ReturnType<typeof findTransaction>>,
): LifecycleStep[] {
  const start = new Date(tx.createdAt).getTime();
  const end = new Date(tx.updatedAt).getTime();
  const span = Math.max(end - start, 40);
  const at = (fraction: number) =>
    format(new Date(start + span * fraction), "HH:mm:ss.SSS");

  const isFailure = tx.status.toUpperCase() === "FAILED";
  const isTimeout = tx.status.toUpperCase() === "TIMEOUT";
  const network = networkFromAcquirer(tx.request.acquiringInstitutionCode);

  const steps: LifecycleStep[] = [
    {
      title: "Transaction Received",
      description: "Initial API gateway ingress validation passed.",
      timestamp: at(0),
      tone: "default",
    },
    {
      title: "ISO Request Generated",
      description: `Mapped JSON payload to ISO 8583 format (MTI ${tx.mti}).`,
      timestamp: at(0.2),
      tone: "default",
    },
    {
      title: `Sent to ${network}`,
      description: "Outbound connection established over TLS 1.3.",
      timestamp: at(0.45),
      tone: "default",
    },
  ];

  if (isTimeout || !tx.response) {
    steps.push({
      title: "No Response",
      description:
        "The switch did not respond within the configured timeout window.",
      timestamp: at(1),
      tone: "error",
    });
    return steps;
  }

  steps.push({
    title: "Response Received",
    description: `Status Code ${tx.response.responseCode} (${responseCodeLabel(
      tx.response.responseCode,
    )}).`,
    timestamp: at(0.75),
    tone: isFailure ? "error" : "default",
  });

  steps.push({
    title: isFailure ? "Failed" : "Completed",
    description: isFailure
      ? "Transaction marked as failed and webhook fired."
      : "Database committed and webhook fired.",
    timestamp: at(1),
    tone: isFailure ? "error" : "default",
  });

  return steps;
}

function ExecutionLifecycle({ steps }: { steps: LifecycleStep[] }) {
  return (
    <div className="relative">
      <ol className="space-y-6">
        {steps.map((step, index) => (
          <li key={step.title} className="relative flex gap-4 pl-1">
            {index < steps.length - 1 && (
              <span className="absolute left-1.25 top-4 h-full w-px bg-card-border" />
            )}
            <span
              className={
                "relative z-10 mt-1.5 size-2.5 shrink-0 rounded-full " +
                (step.tone === "error" ? "bg-error-500" : "bg-success-500")
              }
            />
            <div className="flex flex-1 items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-foreground-100">
                  {step.title}
                </p>
                <p className="text-sm text-text-secondary">
                  {step.description}
                </p>
              </div>
              <span className="shrink-0 whitespace-nowrap font-subtitle text-xs text-text-tertiary">
                {step.timestamp}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function TransactionDetailPage() {
  const { reference } = useParams<{ reference: string }>();
  const navigate = useNavigate();

  const transaction = useMemo(
    () => (reference ? findTransaction(reference) : undefined),
    [reference],
  );

  if (!transaction) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
        <p className="text-lg font-semibold text-foreground-100">
          Transaction not found
        </p>
        <p className="text-sm text-text-secondary">
          "{reference}" doesn't match any known transaction reference.
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/transactions")}
        >
          Back to transactions
        </Button>
      </div>
    );
  }

  const lifecycle = buildLifecycle(transaction);
  const network = networkFromAcquirer(
    transaction.request.acquiringInstitutionCode,
  );
  const originatingBank = resolveBankName(
    transaction.request.acquiringInstitutionCode,
  );
  const destinationBank = resolveBankName(transaction.request.merchantCode);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/transactions"
            className="grid size-9 place-items-center rounded-xs text-text-secondary hover:bg-background-soft-100"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <div>
            <p className="text-xs font-semibold tracking-wide text-text-tertiary">
              TRANSACTION REFERENCE
            </p>
            <div className="mt-0.5 flex items-center gap-3">
              <h1 className="font-title text-xl font-bold text-foreground-100">
                {transaction.correlationId}
              </h1>
              <StatusBadge status={transaction.status} />
            </div>
          </div>
        </div>

        <Button appearance="outline" className="rounded-xs" size="sm">
          <RotateCw className="size-4" />
          Replay
        </Button>
      </div>

      <div className="border-t border-card-border" />

      {/* Main content grid */}
      <div className="grid grid-cols-1 grid-rows-1 gap-6 lg:grid-cols-3">
        {/* Quick stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 rounded-xs border border-card-border bg-card-background-100 p-5 col-span-2">
          <div>
            <p className="text-xs font-semibold tracking-wide text-text-tertiary">
              AMOUNT
            </p>
            <p className="mt-1 font-title text-lg font-bold text-foreground-100">
              {formatAmount(
                transaction.request.transactionAmount,
                transaction.request.transactionCurrency,
              )}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold tracking-wide text-text-tertiary">
              DURATION
            </p>
            <p className="mt-1 text-sm font-medium text-foreground-100">
              {durationMs(transaction.createdAt, transaction.updatedAt)}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold tracking-wide text-text-tertiary">
              CHANNEL
            </p>
            <p className="mt-1 text-sm font-medium text-foreground-100">
              {network}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold tracking-wide text-text-tertiary">
              CORRELATION ID
            </p>
            <p className="mt-1 font-subtitle text-sm text-foreground-100">
              {transaction.correlationId}
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-6 col-span-1 lg:row-span-2">
          <div className="rounded-xs border border-card-border bg-card-background-100">
            <div className="p-5">
              <p className="text-xs font-semibold tracking-wide text-text-tertiary">
                RELATED CONTENT
              </p>
              <div className="mt-3 flex flex-col gap-1">
                <Link
                  to={`/iso-messages?ref=${transaction.correlationId}`}
                  className="flex items-center justify-between rounded-xs px-2 py-2 text-sm text-foreground-100 hover:bg-background-soft-100"
                >
                  <span className="flex items-center gap-2">
                    <FileText className="size-4 text-text-tertiary" />
                    ISO Messages
                  </span>
                  <span className="rounded-xs bg-badge-primary-background px-1.5 py-0.5 text-xs font-medium text-badge-primary-text">
                    {transaction.response ? 2 : 1}
                  </span>
                </Link>
                <Link
                  to={`/raw-logs?ref=${transaction.correlationId}`}
                  className="flex items-center justify-between rounded-xs px-2 py-2 text-sm text-foreground-100 hover:bg-background-soft-100"
                >
                  <span className="flex items-center gap-2">
                    <Terminal className="size-4 text-text-tertiary" />
                    Technical Logs
                  </span>
                  <span className="rounded-xs bg-badge-primary-background px-1.5 py-0.5 text-xs font-medium text-badge-primary-text">
                    5
                  </span>
                </Link>
              </div>
            </div>

            <div className="border-t border-card-border p-5">
              <p className="text-xs font-semibold tracking-wide text-text-tertiary">
                TECHNICAL META
              </p>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-text-secondary">Node</dt>
                  <dd className="font-subtitle text-foreground-100">
                    wk-prod-ap-01
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-text-secondary">Trace ID</dt>
                  <dd className="font-subtitle text-foreground-100">
                    tr_{transaction.request.stan}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="rounded-xs border border-card-border bg-card-background-100 p-5">
            <h2 className="font-title text-base font-semibold text-foreground-100">
              Metadata
            </h2>
            <dl className="mt-3 space-y-2.5 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-xs font-semibold tracking-wide text-text-tertiary">
                  CHANNEL
                </dt>
                <dd className="font-medium text-foreground-100">{network}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-xs font-semibold tracking-wide text-text-tertiary">
                  DURATION
                </dt>
                <dd className="font-medium text-foreground-100">
                  {durationMs(transaction.createdAt, transaction.updatedAt)}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-xs font-semibold tracking-wide text-text-tertiary">
                  ORIGINATING BANK
                </dt>
                <dd className="font-medium text-foreground-100">
                  {originatingBank}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-xs font-semibold tracking-wide text-text-tertiary">
                  DESTINATION BANK
                </dt>
                <dd className="font-medium text-foreground-100">
                  {destinationBank}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Lifecycle */}
        <div className="rounded-xs border border-card-border bg-card-background-100 p-5 col-span-2 sm:row-start-2">
          <h2 className="font-title text-base font-semibold text-foreground-100">
            Execution Lifecycle
          </h2>
          <div className="mt-5">
            <ExecutionLifecycle steps={lifecycle} />
          </div>
        </div>
      </div>
    </div>
  );
}
