// utils/logParsing.ts
// Pure helpers turning a raw sync_log `message` into something scannable in
// a table row, while keeping the original text available (for the raw
// payload panel) so nothing is lost — the whole point of this page is to
// read the console precisely, not to paraphrase it away.

export function toDate(timestamp: string): Date {
  return new Date(timestamp.replace(" ", "T"));
}

export function hasRawDetail(message: string): boolean {
  return message.trim().startsWith("<log");
}

export function parseLogService(message: string): {
  service: string;
  session?: string;
} {
  const realmMatch = /realm="([^"]+)"/.exec(message);
  if (realmMatch) {
    const [service, session] = realmMatch[1].split("/");
    return { service, session };
  }

  if (/rabbitmq/i.test(message)) return { service: "rabbitmq-internal" };
  if (/gimac/i.test(message)) return { service: "gimac-client" };
  if (/application démarrée/i.test(message)) return { service: "bootstrap" };
  if (/configuration/i.test(message)) return { service: "iso-packager" };
  return { service: "system" };
}

export function summarizeLogMessage(message: string): string {
  const trimmed = message.trim();
  if (!trimmed.startsWith("<log")) return trimmed;

  if (/<connect>/.test(trimmed)) {
    const refused = /Connection refused:\s*([^\n\r]+)/.exec(trimmed);
    return refused
      ? `Connexion refusée (${refused[1].trim()}).`
      : "Tentative de connexion échouée.";
  }
  if (/<iso-server>/.test(trimmed)) {
    const port = /listening on port (\d+)/.exec(trimmed);
    return port
      ? `Serveur ISO en écoute sur le port ${port[1]}.`
      : "Serveur ISO démarré.";
  }
  if (/<session-start/.test(trimmed)) {
    return "Nouvelle session TCP ouverte.";
  }
  if (/<receive>|<send>/.test(trimmed)) {
    const direction = /<receive>/.test(trimmed) ? "reçu" : "envoyé";
    const mti = /<field\s+id="0"\s+value="(\d+)"/.exec(trimmed);
    return `Message ISO 8583 ${direction}${mti ? ` (MTI ${mti[1]})` : ""}.`;
  }
  return "Entrée technique — voir le payload brut.";
}