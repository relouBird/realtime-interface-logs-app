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
      // Défensif : retire un éventuel \r final (logs générés côté Windows,
      // cf. les traces jPOS collées depuis "PS C:\Users\...").
      const cleanLine = line.replace(/\r$/, "");
      const match = cleanLine.match(
        /^([0-9A-Fa-f]{4})\s+([0-9A-Fa-f]{2}(?:\s+[0-9A-Fa-f]{2})*)\s{2,}(.*)$/,
      );
      if (!match) return null;
      return { offset: match[1], hex: match[2].trim(), ascii: match[3] };
    })
    .filter((line): line is HexDumpLine => line !== null);
}

/**
 * Vérifie si une chaîne ressemble à un dump hexadécimal (au moins une ligne valide).
 */
export function isHexDump(text: string): boolean {
  const lines = text.split("\n").filter((l) => l.trim() !== "");
  if (lines.length === 0) return false;
  // On teste la première ligne non vide
  const firstLine = lines[0].replace(/\r$/, "");
  return /^[0-9A-Fa-f]{4}\s+([0-9A-Fa-f]{2}\s+)+[0-9A-Fa-f]{2}\s{2,}/.test(
    firstLine,
  );
}

export type HexType = "dump" | "message" | "none";

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

/**
 * Extrait la direction du message depuis l'attribut `direction` de
 * `<isomsg direction="incoming|outgoing">`. Retourne `null` si absent
 * (ex: le bloc [HEX] était indisponible et le XML est vide/malformé).
 */
export function parseIsoDirection(xml: string): "incoming" | "outgoing" | null {
  const match = xml.match(/<isomsg\s+direction="(incoming|outgoing)"/);
  return match ? (match[1] as "incoming" | "outgoing") : null;
}

/**
 * Raccourci pratique : lit le Message Type Indicator (champ 0) directement
 * depuis la liste de champs déjà parsée, plutôt que de reparser le XML.
 * Retourne `null` si le champ 0 est absent (ne devrait pas arriver pour un
 * message jPOS valide, mais on reste défensif).
 */
export function getMti(fields: ParsedIsoField[]): string | null {
  return fields.find((f) => f.id === "0")?.value ?? null;
}

export interface ParsedIsoMessage {
  /** "incoming" | "outgoing" | null si absent du dump XML */
  direction: "incoming" | "outgoing" | null;
  /** Message Type Indicator, ex: "1804", "1200"... */
  mti: string | null;
  /** Champs ISO8583 parsés, triés par id croissant — pour la vue "fields" */
  fields: ParsedIsoField[];
  /** Lignes hex/ascii décodées — pour la vue "raw" (bascule utilisateur) */
  hex: HexDumpLine[];
  /** Nombre d'octets annoncé par [HEX] (n octets), null si le bloc HEX était indisponible */
  hexOctets: number | null;
  /** true si le bloc [HEX] existait et a pu être décodé en au moins une ligne */
  hasHex: boolean;
}

/**
 * Point d'entrée unique pour le composant d'affichage : prend le `raw` brut
 * tel que renvoyé par le backend (dump [XML] + [HEX] produit par
 * ISOMsgLogger côté Java/jPOS) et retourne tout ce qu'il faut pour afficher
 * soit la vue "fields" (lisible), soit la vue "raw hex/ascii" au clic de
 * l'utilisateur — sans que le composant ait à connaître le format brut.
 *
 * N'altère aucune des fonctions existantes ci-dessus : celles-ci restent
 * utilisables indépendamment (ex: pour un test unitaire ciblé sur le XML
 * seul, ou pour réutiliser parseHexDump ailleurs).
 */
export function parseIsoRawMessage(raw: string): ParsedIsoMessage {
  const { xml, hexOctets, hexText } = splitRawMessage(raw);
  const fields = parseRawXmlFields(xml);
  const direction = parseIsoDirection(xml);
  const mti = getMti(fields);
  const hex = hexText ? parseHexDump(hexText) : [];

  return {
    direction,
    mti,
    fields,
    hex,
    hexOctets,
    hasHex: hex.length > 0,
  };
}
