// constants/mock/mockSyncLogs.ts
// TODO: replace with a real fetch against `sync_log` (e.g. `GET /sync-logs`,
// ideally paginated/streamed — this table grows on every single action).

import type { SyncLogEntry } from "@/types/syncLog.type";

export const MOCK_SYNC_LOGS: SyncLogEntry[] = [
  {
    id: 335,
    timestamp: "2026-09-03 22:41:26.009",
    status: "INFO",
    message:
      "Chargement réussi de la Configuration ISO 1993 Gimac: org.jpos.iso.packager.GenericPackager",
  },
  {
    id: 336,
    timestamp: "2026-09-03 22:41:26.085",
    status: "INFO",
    message: `<log realm="greatpay-channel" at="2026-09-03T23:41:26.081628500" lifespan="1ms">
  <connect>
    Try 0 localhost:9009
      Connection refused: connect
    Unable to connect
  </connect>
</log>`,
  },
  {
    id: 337,
    timestamp: "2026-09-03 22:41:26.085",
    status: "INFO",
    message: `<log realm="iso-server" at="2026-09-03T23:41:26.080625700">
  <iso-server>
    listening on port 9010
  </iso-server>
</log>`,
  },
  {
    id: 338,
    timestamp: "2026-09-03 22:41:26.100",
    status: "ERROR",
    message: "Erreur lors du lancement du Client GIMAC: Unable to connect",
  },
  {
    id: 339,
    timestamp: "2026-09-03 22:41:26.161",
    status: "ERROR",
    message:
      "Erreur lors du lancement du RabbitMQ Interne: Connection refused: getsockopt",
  },
  {
    id: 340,
    timestamp: "2026-09-03 22:41:26.183",
    status: "INFO",
    message:
      "Application démarrée : serveur sur port 9010, client MUX vers localhost:9009",
  },
  {
    id: 341,
    timestamp: "2026-09-03 22:41:39.183",
    status: "INFO",
    message: `<log realm="iso-server.session/127.0.0.1:55047" at="2026-09-03T23:41:39.178701900">
  <session-start/>
</log>`,
  },
  {
    id: 342,
    timestamp: "2026-09-03 22:41:42.867",
    status: "INFO",
    message: `<log realm="gimac-channel/127.0.0.1:55047" at="2026-09-03T23:41:42.864355300" lifespan="3676ms">
  <receive>
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
  </receive>
</log>`,
  },
  {
    id: 343,
    timestamp: "2026-09-03 22:41:42.880",
    status: "INFO",
    message: `<log realm="gimac-channel/127.0.0.1:55047" at="2026-09-03T23:41:42.877359800">
  <send>
    <isomsg direction="outgoing">
      <!-- org.jpos.iso.packager.GenericPackager -->
      <field id="0" value="1814"/>
      <field id="3" value="000000"/>
      <field id="7" value="0903234142"/>
      <field id="11" value="000507"/>
      <field id="12" value="260903"/>
      <field id="13" value="0903"/>
      <field id="24" value="801"/>
      <field id="39" value="00"/>
      <field id="41" value="20390059"/>
      <field id="70" value="001"/>
    </isomsg>
  </send>
</log>`,
  },
  {
    id: 344,
    timestamp: "2026-09-03 22:41:52.653",
    status: "INFO",
    message: `<log realm="iso-server.session/127.0.0.1:55060" at="2026-09-03T23:41:52.650493100" lifespan="1ms">
  <session-start/>
</log>`,
  },
];
