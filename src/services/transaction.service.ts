import type { AxiosResponse } from "axios";
import { request } from "@/helpers/request.helper";
import type { TransactionRecord, RabbitHealth } from "@/types/transaction.type";

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
  /** GET /api/transaction/responses */
  fetchResponses: (
    params: LogsParams,
  ) => Promise<AxiosResponse<ResponseFormData<TransactionRecord>>>;
  /** GET /api/transaction/responses/:correlationId */
  fetchResponseById: (
    correlationId: string,
  ) => Promise<AxiosResponse<ResponseFormSingleData<TransactionRecord>>>;
  /** GET /api/transaction/health */
  fetchHealth: () => Promise<AxiosResponse<RabbitHealth>>;
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

  const fetchHealth = async () => {
    return await request(`/payment/health`, {
      method: "get",
    });
  };

  return {
    fetchResponses,
    fetchResponseById,
    fetchHealth,
  };
}
