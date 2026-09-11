// types/transaction.type.ts
// Shape of the raw messages coming out of the switch / CBS simulator.

export type TransactionStatus = "SUCCESS" | "FAILED" | "PENDING" | "TIMEOUT";

export interface TransactionRequest {
  track2Data: string;
  transactionCurrency: string;
  merchantCode: string;
  mti: string;
  procCode: string;
  acquiringInstitutionCode: string;
  retrievalReferenceNumber: string;
  sysDateTime: string;
  expDate: string;
  merchantName: string;
  smartCardDataIdentifier: string;
  billingCurrency: string;
  merchantCategoryCode: string;
  transactionAmount: string;
  stan: string;
  posEntryMode: string;
  terminalCode: string;
  pan: string;
  acquiringInstitutionCountryCode: string | null;
}

export interface TransactionResponse {
  mti: string;
  pan: string;
  procCode: string;
  transactionAmount: string;
  sysDateTime: string;
  stan: string;
  acquiringInstitutionCountryCode: string | null;
  acquiringInstitutionCode: string;
  retrievalReferenceNumber: string;
  terminalCode: string;
  merchantCode: string;
  merchantName: string;
  transactionCurrency: string;
  billingCurrency: string;
  authNumber: string;
  responseCode: string;
}

export interface TransactionRecord {
  correlationId: string;
  retrievalReferenceNumber: string;
  mti: string;
  processAction: string;
  action: string;
  status: TransactionStatus | string;
  request: TransactionRequest;
  response?: TransactionResponse;
  createdAt: string;
  updatedAt: string;
}

export interface RabbitHealth {
  status: "ok" | "error";
  rabbitmq: "connected" | "disconnected";
  gbApi: "connected" | "disconnected";
}

export interface TransactionSummary {
  /** Nb de transactions financières créées aujourd'hui (UTC). */
  totalToday: number;
  /** Nb de transactions financières créées hier (UTC), pour la comparaison. */
  totalYesterday: number;
  /** Variation en % vs hier. `null` si hier = 0 (division par zéro évitée). */
  totalTodayChangePct: number | null;
  /** Nb de transactions financières des dernières 24h glissantes. */
  total24h: number;
  /** % de succès sur les transactions financières terminées des dernières 24h. `null` si aucune transaction terminée. */
  successRate24h: number | null;
  /** Nb de transactions financières pas encore dans un statut terminal. */
  activeProcessing: number;
  /** Parmi les actives, celles en attente depuis plus de `delayThresholdMs`. */
  delayedInQueue: number;
  /** Débit approximatif sur la fenêtre `opsWindowMs` (transactions/sec). */
  opsPerSecond: number;
  generatedAt: string;
}
