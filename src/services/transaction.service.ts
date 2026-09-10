import type { AxiosResponse } from "axios";
import { request } from "@/helpers/request.helper";
import type {
  TransactionRecord,
  RabbitHealth,
  TransactionSummary,
} from "@/types/transaction.type";

// Interfaces de Bases
interface LogsParams {
  cursor?: string;
  limit?: number;
}

interface ResponseFormData<T> {
  data: T[];
  nextCursor: string;
  hasMore: boolean;
  success: boolean;
}

interface ResponseFormSingleData<T> {
  data: T;
  success: boolean;
}

/**
 * Typage dédié au service transaction (données non génériques, cf. §2 et §2.6 de la doc API).
 */
export type TransactionServiceProps = {
  /** GET /api/payment/transactions */
  fetchResponses: (
    params: LogsParams,
  ) => Promise<AxiosResponse<ResponseFormData<TransactionRecord>>>;
  /** GET /api/payment/transactions/:correlationId */
  fetchResponseById: (
    correlationId: string,
  ) => Promise<AxiosResponse<ResponseFormSingleData<TransactionRecord>>>;
  /** GET /api/payment/health */
  fetchHealth: () => Promise<AxiosResponse<RabbitHealth>>;
  /** GET /api/payment/transactions/summary */
  fetchSummary: () => Promise<
    AxiosResponse<ResponseFormSingleData<TransactionSummary>>
  >;
};

export default function transactionService(): TransactionServiceProps {
  const fetchResponses = async ({ cursor, limit = 50 }: LogsParams) => {
    return await request(`/payment/transactions`, {
      method: "get",
      params: {
        cursor,
        limit,
      },
    });
  };

  const fetchResponseById = async (correlationId: string) => {
    return await request(`/payment/transactions/${correlationId}`, {
      method: "get",
    });
  };

  const fetchSummary = async () => {
    return await request(`/payment/transactions/summary`, {
      method: "get",
    });
  };

  const fetchHealth = async () => {
    return await request(`/payment/health`, {
      method: "get",
    });
  };

  return {
    fetchResponses,
    fetchResponseById,
    fetchHealth,
    fetchSummary,
  };
}
