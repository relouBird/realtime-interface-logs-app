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
