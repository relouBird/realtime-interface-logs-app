// utils/iso8583.ts
// Small decoders/formatters for the raw ISO 8583 fields the switch returns.
// Keep these pure so they're easy to unit test independently of the UI.

const CURRENCY_MAP: Record<string, string> = {
  "566": "NGN",
  "950": "XAF",
  "952": "XOF",
  "840": "USD",
  "978": "EUR",
  "826": "GBP",
};

export function currencyLabel(code?: string | null): string {
  if (!code) return "";
  return CURRENCY_MAP[code] ?? code;
}

/**
 * Field 4 / 5 amounts are transmitted as a 12-digit numeric string with the
 * last two digits representing the minor unit (cents).
 */
export function formatAmount(
  rawAmount?: string | null,
  currencyCode?: string | null,
): string {
  if (!rawAmount) return "—";
  const value = Number(rawAmount) / 100;
  const formatted = new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
  const currency = currencyLabel(currencyCode);
  return currency ? `${formatted} ${currency}` : formatted;
}

export function maskPan(pan?: string | null): string {
  if (!pan || pan.length < 10) return pan ?? "—";
  return `${pan.slice(0, 6)}••••••${pan.slice(-4)}`;
}

const PROC_CODE_LABELS: Record<string, string> = {
  "00": "Purchase",
  "01": "Withdrawal",
  "20": "Refund",
  "22": "Transfer",
  "30": "Balance Inquiry",
};

export function procCodeLabel(procCode?: string | null): string {
  if (!procCode) return "—";
  const prefix = procCode.slice(0, 2);
  return PROC_CODE_LABELS[prefix] ?? `Proc. ${prefix}`;
}

const RESPONSE_CODE_LABELS: Record<string, string> = {
  "00": "Approved",
  "05": "Do not honor",
  "14": "Invalid card number",
  "51": "Insufficient funds",
  "54": "Expired card",
  "91": "Issuer unavailable",
  "96": "System Error",
};

export function responseCodeLabel(code?: string | null): string {
  if (!code) return "—";
  return RESPONSE_CODE_LABELS[code] ?? `Code ${code}`;
}

const MTI_LABELS: Record<string, string> = {
  "1200": "Authorization Request",
  "1210": "Authorization Response",
  "1400": "Reversal Request",
  "1410": "Reversal Response",
  "1804": "Network Mgmt Request",
  "1814": "Network Mgmt Response",
};

export function mtiLabel(mti?: string | null): string {
  if (!mti) return "—";
  return MTI_LABELS[mti] ?? mti;
}

export function posEntryModeLabel(code?: string | null): string {
  const map: Record<string, string> = {
    "010": "Manual entry",
    "020": "Magnetic stripe",
    "021": "Chip",
    "022": "Chip fallback",
    "090": "Contactless",
  };
  if (!code) return "—";
  return map[code] ?? code;
}

/**
 * There is no explicit "network name" field on the payload — it's inferred
 * from the acquiring institution code. Replace with a real directory lookup
 * (or add the field server-side) once available.
 */
const ACQUIRER_NETWORK_MAP: Record<string, string> = {
  "27610000001": "GIMAC",
};

export function networkFromAcquirer(code?: string | null): string {
  if (!code) return "Switch Network";
  return ACQUIRER_NETWORK_MAP[code] ?? "Switch Network";
}

/**
 * Mock bank directory lookup, keyed off the acquiring institution code.
 * Swap for a real BIN/institution directory call server-side.
 */
const BANK_NAMES = ["UBA", "ECOBANK", "AFRILAND", "SGBC", "BICEC"];

export function resolveBankName(seed?: string | null): string {
  if (!seed) return "—";
  const sum = seed.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return BANK_NAMES[sum % BANK_NAMES.length];
}

export function durationMs(createdAt: string, updatedAt: string): string {
  const ms = Math.max(
    0,
    new Date(updatedAt).getTime() - new Date(createdAt).getTime(),
  );
  return `${ms}ms`;
}
