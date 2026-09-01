export type OperationFinancialStatus = "settled" | "processing" | "failed" | "timeout";

export interface FinancialOperation {
  timestamp: string;
  reference: string;
  type: string;
  channel: string;
  amount: string;
  currency: string;
  status: OperationFinancialStatus;
}
