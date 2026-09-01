import type { FinancialOperation } from "@/types/transaction.type";

export const OPERATIONS: FinancialOperation[] = [
  {
    timestamp: "14:02:45.102",
    reference: "20390059.000472",
    type: "Transfer",
    channel: "GIMAC",
    amount: "250,000",
    currency: "XAF",
    status: "settled",
  },
  {
    timestamp: "14:02:41.884",
    reference: "88310244.912001",
    type: "Payment",
    channel: "SWIFT",
    amount: "12,500",
    currency: "USD",
    status: "processing",
  },
  {
    timestamp: "14:02:30.011",
    reference: "10049283.440921",
    type: "Refund",
    channel: "Internal",
    amount: "45,000",
    currency: "XOF",
    status: "settled",
  },
  {
    timestamp: "14:01:55.330",
    reference: "55920111.000032",
    type: "Transfer",
    channel: "GIMAC",
    amount: "1,200,000",
    currency: "XAF",
    status: "failed",
  },
  {
    timestamp: "14:01:12.775",
    reference: "20390058.000471",
    type: "Transfer",
    channel: "GIMAC",
    amount: "15,000",
    currency: "XAF",
    status: "settled",
  },
];

export const INCOMING_OPERATION: FinancialOperation = {
  timestamp: "14:31:42.771",
  reference: "20390059.000476",
  type: "Balance Inquiry",
  channel: "API Gateway",
  amount: "",
  currency: "",
  status: "timeout",
};
