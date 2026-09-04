// constants/mock/mockIsoLogs.ts
// TODO: replace with real calls — `GET /iso-logs` (paginated, filterable by
// STAN) and `GET /iso-logs/:id` (includes the `raw` dump) — once exposed.

import type { IsoLogEntry } from "@/types/isoLog.type";

export const MOCK_ISO_LOGS: IsoLogEntry[] = [
  {
    id: 6,
    event_time: "2026-09-03T22:42:34.993Z",
    connection_name: "gimac-server",
    event_type: "HEARTBEAT",
    direction: "OUT",
    mti: "1814",
    stan: "000508",
    terminal_id: "20390059",
    account_number: null,
    detail: "Réponse pour: ECHO TEST Effectué par le GIMAC.",
    raw: `[XML]
<isomsg direction="outgoing">
  <!-- org.jpos.iso.packager.GenericPackager -->
  <field id="0" value="1814"/>
  <field id="11" value="000508"/>
  <field id="12" value="260903"/>
  <field id="13" value="0903"/>
  <field id="24" value="801"/>
  <field id="39" value="00"/>
  <field id="41" value="20390059"/>
  <field id="70" value="001"/>
</isomsg>
[HEX] (54 octets)
0000  31 38 31 34 A2 18 01 00  00 00 00 00 04 00 00 00  1814............
0010  00 00 00 00 30 30 30 35  30 38 32 36 30 39 30 33  ....000508260903
0020  30 39 30 33 38 30 31 30  30 30 30 31              090380100001`,
  },
  {
    id: 5,
    event_time: "2026-09-03T22:42:34.978Z",
    connection_name: "gimac-server",
    event_type: "HEARTBEAT",
    direction: "IN",
    mti: "1804",
    stan: "000508",
    terminal_id: "20390059",
    account_number: null,
    detail: "ECHO TEST Effectué par le GIMAC.",
    raw: `[XML]
<isomsg direction="incoming">
  <!-- org.jpos.iso.packager.GenericPackager -->
  <field id="0" value="1804"/>
  <field id="11" value="000508"/>
  <field id="12" value="260903"/>
  <field id="13" value="0903"/>
  <field id="24" value="801"/>
  <field id="41" value="20390059"/>
  <field id="70" value="001"/>
</isomsg>
[HEX] (52 octets)
0000  31 38 30 34 A2 08 01 00  00 00 00 00 04 00 00 00  1804............
0010  00 00 00 00 30 30 30 35  30 38 32 36 30 39 30 33  ....000508260903
0020  30 39 30 33 38 30 31 30  30 30 30 31              090380100001`,
  },
  {
    id: 4,
    event_time: "2026-09-03T22:41:42.887Z",
    connection_name: "gimac-server",
    event_type: "SIGN_ON",
    direction: "OUT",
    mti: "1814",
    stan: "000507",
    terminal_id: "20390059",
    account_number: null,
    detail: "Réponse pour: Ouverture connexion par le GIMAC.",
    raw: `[XML]
<isomsg direction="outgoing">
  <!-- org.jpos.iso.packager.GenericPackager -->
  <field id="0" value="1814"/>
  <field id="11" value="000507"/>
  <field id="12" value="260903"/>
  <field id="13" value="0903"/>
  <field id="24" value="801"/>
  <field id="39" value="00"/>
  <field id="41" value="20390059"/>
  <field id="70" value="001"/>
</isomsg>
[HEX] (54 octets)
0000  31 38 31 34 A2 18 01 00  00 00 00 00 04 00 00 00  1814............
0010  00 00 00 00 30 30 30 35  30 37 32 36 30 39 30 33  ....000507260903
0020  30 39 30 33 38 30 31 32  30 33 39 30 30            0903801203900`,
  },
  {
    id: 3,
    event_time: "2026-09-03T22:41:42.872Z",
    connection_name: "gimac-server",
    event_type: "SIGN_ON",
    direction: "IN",
    mti: "1804",
    stan: "000507",
    terminal_id: "20390059",
    account_number: null,
    detail: "Ouverture connexion par le GIMAC.",
    raw: `[XML]
<isomsg direction="incoming">
  <!-- org.jpos.iso.packager.GenericPackager -->
  <field id="0" value="1804"/>
  <field id="3" value="000000"/>
  <field id="7" value="0903234142"/>
  <field id="11" value="000507"/>
  <field id="12" value="260903"/>
  <field id="13" value="0903"/>
  <field id="24" value="801"/>
  <field id="41" value="20390059"/>
  <field id="70" value="001"/>
</isomsg>
[HEX] (66 octets)
0000  31 38 30 34 A2 38 01 00  00 80 00 00 04 00 00 00  1804.8..........
0010  00 00 00 00 30 30 30 30  30 30 30 39 30 33 32 33  ....000000090323
0020  34 31 34 32 30 30 30 35  30 37 32 36 30 39 30 33  4142000507260903
0030  30 39 30 33 38 30 31 32  30 33 39 30 30 35 39 30  0903801203900590
0040  30 31                                             01`,
  },
  {
    id: 2,
    event_time: "2026-09-03T22:40:12.410Z",
    connection_name: "gimac-server",
    event_type: "FINANCIAL",
    direction: "OUT",
    mti: "1210",
    stan: "000506",
    terminal_id: "20390059",
    account_number: "4576042174294270",
    detail: "Réponse autorisation: code 00 (Approved).",
  },
  {
    id: 1,
    event_time: "2026-09-03T22:40:12.365Z",
    connection_name: "gimac-server",
    event_type: "FINANCIAL",
    direction: "IN",
    mti: "1200",
    stan: "000506",
    terminal_id: "20390059",
    account_number: "4576042174294270",
    detail: "Demande d'autorisation retrait 250 000 XAF.",
  },
];

export function findIsoLog(id: number): IsoLogEntry | undefined {
  return MOCK_ISO_LOGS.find((entry) => entry.id === id);
}
