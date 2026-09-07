import type { AxiosResponse } from "axios";
import { request } from "@/helpers/request.helper";
import type {
  PaymentRecord,
  NewTransactionPayload,
  QueuedTransactionResponse,
  QueuesHealth,
  RabbitHealth,
  IsoMsgLog,
} from "@/types/payment.type";

/**
 * Typage dédié au service payment (données non génériques, cf. §2 et §2.6 de la doc API).
 */
export type PaymentServiceProps = {
  /** POST /api/payment/transaction */
  createTransaction: (
    payload: NewTransactionPayload,
  ) => Promise<AxiosResponse<QueuedTransactionResponse>>;
  /** GET /api/payment/responses */
  fetchResponses: () => Promise<AxiosResponse<PaymentRecord[]>>;
  /** GET /api/payment/responses/:correlationId */
  fetchResponseById: (
    correlationId: string,
  ) => Promise<AxiosResponse<PaymentRecord>>;
  /** GET /api/payment/health */
  fetchHealth: () => Promise<AxiosResponse<RabbitHealth>>;
  /** GET /api/payment/queues */
  fetchQueues: () => Promise<AxiosResponse<QueuesHealth>>;
  /** GET /api/payment/logs?stan= */
  fetchLogs: (stan?: string) => Promise<AxiosResponse<IsoMsgLog[]>>;
};

export default function paymentService(): PaymentServiceProps {
  const createTransaction = async (payload: NewTransactionPayload) => {
    return await request(`/payment/transaction`, {
      method: "post",
      data: payload,
    });
  };

  const fetchResponses = async () => {
    return await request(`/payment/responses`, {
      method: "get",
    });
  };

  const fetchResponseById = async (correlationId: string) => {
    return await request(`/payment/responses/${correlationId}`, {
      method: "get",
    });
  };

  const fetchHealth = async () => {
    return await request(`/payment/health`, {
      method: "get",
    });
  };

  const fetchQueues = async () => {
    return await request(`/payment/queues`, {
      method: "get",
    });
  };

  const fetchLogs = async (stan?: string) => {
    return await request(`/payment/logs`, {
      method: "get",
      params: stan ? { stan } : undefined,
    });
  };

  return {
    createTransaction,
    fetchResponses,
    fetchResponseById,
    fetchHealth,
    fetchQueues,
    fetchLogs,
  };
}
