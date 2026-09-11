// types/syncLog.type.ts
// Every action — even bootstrapping the DB/connections — writes a row here.
// `message` is free text: sometimes a plain sentence, sometimes a raw jPOS
// `<log>` XML block (connect attempts, ISO frames sent/received, ...).

export type SyncLogStatus = "INFO" | "WARN" | "ERROR" | "DEBUG" | string;

export interface SyncLogEntry {
  id: number;
  timestamp: string; // "YYYY-MM-DD HH:mm:ss.SSS"
  status: SyncLogStatus;
  message: string;
}
