// types/isoLog.type.ts
// Shape of the network-level ISO 8583 log events (sign-on, echo/heartbeat,
// financial frames, ...). This is distinct from `Transaction` — a log entry
// isn't necessarily tied to a single transaction (e.g. SIGN_ON, HEARTBEAT).

export type IsoLogDirection = "IN" | "OUT";

export interface IsoLogEntry {
  id: number;
  event_time: string;
  connection_name: string;
  event_type: string; // HEARTBEAT | SIGN_ON | FINANCIAL | SIGN_OFF | ...
  direction: IsoLogDirection;
  mti: string;
  stan: string;
  terminal_id: string;
  account_number: string | null;
  detail: string;
  /**
   * Only populated on the detail endpoint: the raw jPOS XML dump followed by
   * a `[HEX] (n octets)` hex/EBCDIC dump, exactly as produced by the switch.
   */
  raw?: string;
}
