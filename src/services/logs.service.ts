import type { AxiosResponse } from "axios";
import { request } from "@/helpers/request.helper";
import type { SyncLogEntry } from "@/types/syncLog.type";
import type { IsoLogEntry } from "@/types/isoLog.type";

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

/**
 * Typage dédié au service payment (données non génériques, cf. §2 et §2.6 de la doc API).
 */
export type PaymentServiceProps = {
  /** GET /api/logger/raw-logs?size=&cursor= */
  fetchRawLogs: (
    params: LogsParams,
  ) => Promise<AxiosResponse<ResponseFormData<SyncLogEntry>>>;
  /** GET /api/logger/iso-messages-logs?size=&cursor= */
  fetchIsoMsgLogs: (
    params: LogsParams,
  ) => Promise<AxiosResponse<ResponseFormData<IsoLogEntry>>>;
};

export default function logService(): PaymentServiceProps {
  const fetchRawLogs = async ({ cursor, limit = 50 }: LogsParams) => {
    return await request(`/logger/raw-logs`, {
      method: "get",
      params: {
        cursor,
        limit,
      },
    });
  };

  const fetchIsoMsgLogs = async ({ cursor, limit = 50 }: LogsParams) => {
    return await request(`/logger/iso-message-logs`, {
      method: "get",
      params: {
        cursor,
        limit,
      },
    });
  };

  return {
    fetchRawLogs,
    fetchIsoMsgLogs,
  };
}
