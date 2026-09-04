// utils/isoParsing.ts
// Pure parsing helpers for the "raw" field returned by the ISO log detail
// endpoint: a jPOS-style `<isomsg>` XML dump followed by a `[HEX]` byte dump.

export const ISO_FIELD_NAMES: Record<string, string> = {
  "0": "Message Type",
  "2": "Primary Account Number",
  "3": "Processing Code",
  "4": "Amount, Transaction",
  "7": "Transmission Date & Time",
  "11": "System Trace Audit Number",
  "12": "Local Transaction Time",
  "13": "Local Transaction Date",
  "19": "Country Code, Acquiring Institution",
  "22": "Point of Service Data Code",
  "23": "Card Sequence Number",
  "24": "Function Code (NII)",
  "26": "Card Acceptor Business Code",
  "27": "Approval Code Length",
  "28": "Date, Reconciliation",
  "29": "Reconciliation Indicator",
  "32": "Acquiring Institution ID",
  "37": "Retrieval Reference Number",
  "39": "Response Code",
  "41": "Terminal ID",
  "42": "Card Acceptor ID",
  "43": "Card Acceptor Name/Location",
  "49": "Transaction Currency Code",
  "54": "Additional Amounts",
  "57": "Authorization Life Cycle Code",
  "70": "Network Management Info Code",
  "72": "Data Record (History)",
};

export interface ParsedIsoField {
  id: string;
  name: string;
  value: string;
}

export function parseRawXmlFields(xml: string): ParsedIsoField[] {
  const fieldRegex = /<field\s+id="(\d+)"\s+value="([^"]*)"\s*\/>/g;
  const fields: ParsedIsoField[] = [];
  let match: RegExpExecArray | null;
  while ((match = fieldRegex.exec(xml))) {
    const id = match[1];
    fields.push({
      id,
      name: ISO_FIELD_NAMES[id] ?? `Field ${id}`,
      value: match[2],
    });
  }
  return fields.sort((a, b) => Number(a.id) - Number(b.id));
}

export interface HexDumpLine {
  offset: string;
  hex: string;
  ascii: string;
}

export function parseHexDump(text: string): HexDumpLine[] {
  return text
    .split("\n")
    .map((line): HexDumpLine | null => {
      const match = line.match(
        /^([0-9A-Fa-f]{4})\s+([0-9A-Fa-f]{2}(?:\s+[0-9A-Fa-f]{2})*)\s{2,}(.*)$/,
      );
      if (!match) return null;
      return { offset: match[1], hex: match[2].trim(), ascii: match[3] };
    })
    .filter((line): line is HexDumpLine => line !== null);
}

export interface SplitRawMessage {
  xml: string;
  hexOctets: number | null;
  hexText: string;
}

/**
 * Splits the combined `raw` string (XML dump + `[HEX] (n octets)` dump)
 * into its two parts.
 */
export function splitRawMessage(raw: string): SplitRawMessage {
  const hexMarkerIndex = raw.indexOf("[HEX]");
  const xml = raw
    .slice(0, hexMarkerIndex === -1 ? raw.length : hexMarkerIndex)
    .replace("[XML]", "")
    .trim();

  const hexPart = hexMarkerIndex === -1 ? "" : raw.slice(hexMarkerIndex);
  const octetsMatch = hexPart.match(/\((\d+)\s*octets?\)/i);
  const hexOctets = octetsMatch ? Number(octetsMatch[1]) : null;
  const hexText = hexPart
    .replace(/^\[HEX\]\s*(\(\d+\s*octets?\))?/i, "")
    .trim();

  return { xml, hexOctets, hexText };
}
