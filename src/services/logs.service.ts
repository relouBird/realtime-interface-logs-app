import type { AxiosResponse } from "axios";
import { request } from "@/helpers/request.helper";
import type { RabbitHealth } from "@/types";
import type { SyncLogEntry } from "@/types/syncLog.type";

// Interfaces de Bases
interface RawLogsParams {
  cursor?: string;
  limit?: number;
}

interface ResponseFormData<T> {
  data: T[];
  nextCursor: string;
  hasMore: boolean;
  success: boolean;
}

/**
 * Typage dédié au service payment (données non génériques, cf. §2 et §2.6 de la doc API).
 */
export type PaymentServiceProps = {
  /** GET /api/payment/health */
  fetchHealth: () => Promise<AxiosResponse<RabbitHealth>>;
  /** GET /api/payment/logs?stan= */
  fetchRawLogs: (
    params: RawLogsParams,
  ) => Promise<AxiosResponse<ResponseFormData<SyncLogEntry>>>;
};

export default function logService(): PaymentServiceProps {
  const fetchHealth = async () => {
    return await request(`/payment/health`, {
      method: "get",
    });
  };

  const fetchRawLogs = async ({ cursor, limit = 50 }: RawLogsParams) => {
    return await request(`/logger/raw-logs`, {
      method: "get",
      params: {
        cursor,
        limit,
      },
    });
  };

  return {
    fetchHealth,
    fetchRawLogs,
  };
}
