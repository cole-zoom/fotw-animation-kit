import React from "react";
import { useCurrentFrame } from "remotion";
import { LANCE } from "./lanceTheme";
import { SceneTransition } from "./sceneTransition";
import { Stage, At, Slab, Label, Chip, camPath, ramp, pop, glide, mix, V3 } from "./boldKit";
import { Client, Row, Card, Storage, Tile, FillBar, BaseTable, Wire, Mark, Tag, inn, fly, flash } from "./rteKit";
import { cueOf } from "./cues";

type P = { enter?: SceneTransition; exit?: SceneTransition };

const IDX = ["scalar", "full-text", "vector"];

// ═══════════════════════════════════════════════════════════════════════════
// Nodes — "You turn it on for a table, and its nodes accept writes from many
// clients. The nodes keep the newest rows in memory, and keep the indexes you
// choose up to date as rows arrive."
// ═══════════════════════════════════════════════════════════════════════════
export const Nodes: React.FC<P> = ({ enter = "whoosh", exit = "slide" }) => {
  const f = useCurrentFrame();
  const C = cueOf("nodes");
  const turn = C("turn", 30);
  const nodes = C("nodes", 90);
  const clients = C("many", 170);
  const memory = C("memory", 260);
  const indexes = C("indexes", 320);
  const cam = camPath(f, [
    [0, { z: 40, rx: -4 }],
    [memory - 30, { z: 40, rx: -4 }],
    [memory + 20, { z: -150, x: 40, y: -120, rx: -2 }],
  ]);
  const swOn = ramp(f, turn + 6, turn + 20);
  const nIn = (k: number) => pop(f, nodes - 6 + k * 8, 150, 16);
  const cIn = (k: number) => inn(f, clients - 30 + k * 7, 14);
  const CL: V3[] = [[-700, -230, 0], [-700, -40, 0], [-700, 150, 0]];
  const N1: V3 = [120, -150, 0];
  const N2: V3 = [120, 200, 0];
  const flowing = f >= clients;
  const arrivals = (shard: number) => (flowing ? Math.floor((f - clients) / (11 + shard * 4)) : 0);
  const memV = inn(f, memory - 10, 20);
  const idxV = inn(f, indexes - 6, 16);
  const fill = (k: number) => Math.min(0.92, 0.06 + arrivals(k) * 0.035);
  const lastHit = (k: number) => (flowing ? clients + arrivals(k) * (11 + k * 4) : -999);
  const shards = [
    { label: "table A · shard 1", node: N1, y: 120 },
    { label: "table A · shard 2", node: N1, y: 200 },
    { label: "table B", node: N2, y: 120 },
    { label: "table C", node: N2, y: 200 },
  ];
  return (
    <Stage name="Realtime Engine nodes" cam={cam} enter={enter} exit={exit} floorY={460}>
      {/* the switch: Realtime Engine on for this table */}
      <At p={[-640, -430, 30]} o={1 - inn(f, clients - 40, 20)}>
        <Slab w={460} h={90} d={16} tone="card" radius={45}>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 18px 0 30px" }}>
            <Label size={28} mono={false}>
              Realtime Engine
            </Label>
            <div style={{ position: "relative", width: 110, height: 56, borderRadius: 28, background: swOn > 0.5 ? LANCE.orange400 : LANCE.dark500 }}>
              <div style={{ position: "absolute", top: 6, left: 6 + swOn * 54, width: 44, height: 44, borderRadius: 22, background: LANCE.offwhite }} />
            </div>
          </div>
        </Slab>
      </At>
      {["Agents", "Apps", "Pipelines"].map((t, k) => (
        <At key={t} p={CL[k]} o={cIn(k)}>
          <Client text={t} w={260} />
        </At>
      ))}
      {[0, 1, 2].map((k) => (
        <Wire key={k} a={[CL[k][0] + 130, CL[k][1], -2]} b={[(k < 2 ? N1 : N2)[0] - 340, (k < 2 ? N1 : N2)[1] + (k === 1 ? 60 : 0), -2]} o={cIn(k)} dash />
      ))}
      {[N1, N2].map((n, k) => (
        <At key={k} p={n} o={Math.min(1, nIn(k) * 1.4)} s={0.85 + 0.15 * nIn(k)}>
          <Card w={680} h={300} title={`Node ${k + 1}`} sub={memV > 0.02 ? "in memory" : undefined} accent>
            {shards
              .filter((s) => s.node === n)
              .map((s, j) => {
                const si = k * 2 + j;
                const h = flash(f, lastHit(si), 10);
                return (
                  <div key={j} style={{ position: "absolute", left: 30, top: s.y, display: "flex", alignItems: "center", gap: 24 }}>
                    <div style={{ width: 230 }}>
                      <Label size={24} color={LANCE.dark100} fringe={0}>
                        {s.label}
                      </Label>
                    </div>
                    <div style={{ opacity: 0.3 + 0.7 * memV }}>
                      <FillBar w={170} v={memV > 0 ? fill(si) : 0} />
                    </div>
                    <div style={{ display: "flex", gap: 6, opacity: idxV }}>
                      {IDX.map((x) => (
                        <div key={x} style={{ padding: "4px 8px", borderRadius: 6, background: h > 0.2 ? LANCE.lavender : "#3a332e" }}>
                          <Label size={15} color={h > 0.2 ? LANCE.dark800 : LANCE.dark200} fringe={0}>
                            {x}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
          </Card>
        </At>
      ))}
      {/* rows flying from clients to their shard */}
      {flowing &&
        Array.from({ length: 36 }).map((_, i) => {
          const k = i % 3;
          const a = clients + Math.floor(i / 3) * 12 + k * 4;
          if (f < a || f > a + 22) return null;
          const tgt = k < 2 ? N1 : N2;
          return (
            <At key={i} p={fly(f, [CL[k][0] + 130, CL[k][1], 20], [tgt[0] - 300, tgt[1] + (k === 1 ? 50 : -10), 20], a, 22, 50)}>
              <Row w={56} h={22} glow={0.5} />
            </At>
          );
        })}
      <At p={[N1[0], N1[1] - 220, 40]} o={memV * (1 - idxV * 0.0)}>
        <Tag size={26}>newest rows · MemTables with live indexes</Tag>
      </At>
    </Stage>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// Durable — "A write is only acknowledged once it's durable in object
// storage. There's no disk cluster to replicate or back up. If a node goes
// away, the writes it acknowledged are already stored in the table."
// ═══════════════════════════════════════════════════════════════════════════
export const Durable: React.FC<P> = ({ enter = "slide", exit = "slide" }) => {
  const f = useCurrentFrame();
  const C = cueOf("durable");
  const ack = C("acknowledged", 80);
  const disk = C("disk", 300);
  const node = C("note", C("node", 450)); // whisper hears "note"
  const stored = C("already", 560);
  const cam = camPath(f, [
    [0, { z: 40, y: 20, rx: -6 }],
    [disk - 20, { z: 40, y: 20, rx: -6 }],
    [disk + 20, { z: 110, x: 160, y: 0, rx: -5 }],
    [node - 10, { z: 110, x: 160, y: 0, rx: -5 }],
    [node + 30, { z: 30, x: 0, y: 70, rx: -9 }],
  ]);
  const CL: V3 = [-700, -220, 0];
  const ND: V3 = [-60, -220, 0];
  const WALX = (i: number) => -470 + i * 110;
  const writes = [6, ack - 24, ack + 40, ack + 100, ack + 160];
  const gone = inn(f, C("away", node + 20) - 4, 26);
  const walGlow = inn(f, stored - 6, 16);
  const diskIn = inn(f, disk - 10, 16);
  const diskX = inn(f, C("replicate", disk + 30) - 2, 12);
  const diskOut = 1 - inn(f, node - 30, 20);
  return (
    <Stage name="Durable before ack" cam={cam} enter={enter} exit={exit} floorY={470}>
      <At p={[0, 250, -40]}>
        <Storage w={1600} h={260} title="object storage" sub="part of the Lance table" glow={walGlow * 0.5}>
          <div style={{ position: "absolute", left: 360, top: 34 }}>
            <Label size={26} color={LANCE.dark200} fringe={0}>
              write-ahead log
            </Label>
          </div>
          {writes.map((a, i) =>
            f >= a + 34 ? (
              <div key={i} style={{ position: "absolute", left: 340 + i * 110 + 150, top: 100, width: 90, height: 90, borderRadius: 12, background: LANCE.dark100, boxShadow: walGlow > 0 || flash(f, a + 34, 20) > 0 ? `0 0 ${18 + 30 * walGlow}px rgba(255,115,74,${0.4 + 0.4 * walGlow})` : undefined, border: `3px solid ${walGlow > 0 ? LANCE.orange400 : LANCE.dark200}` }} />
            ) : null,
          )}
        </Storage>
      </At>
      <At p={CL}>
        <Client text="client" w={220} />
      </At>
      <Wire a={[CL[0] + 110, CL[1], -2]} b={[ND[0] - 220, ND[1], -2]} dash />
      <At p={ND} o={1 - gone} r={[0, 0, gone * 8]} s={1 - gone * 0.1}>
        <Card w={440} h={210} title="RTE node" accent={gone < 0.5}>
          <div style={{ position: "absolute", left: 30, top: 110 }}>
            <FillBar w={380} v={0.35 + Math.min(0.4, Math.max(0, f - 6) / 1200)} />
          </div>
        </Card>
      </At>
      {/* each write: client → node → WAL in object storage → ✓ back to the client */}
      {writes.map((a, i) => (
        <React.Fragment key={i}>
          {f >= a && f < a + 16 ? (
            <At p={fly(f, [CL[0] + 100, CL[1], 20], [ND[0] - 160, ND[1], 20], a, 16, 30)}>
              <Row w={70} h={26} glow={0.5} />
            </At>
          ) : null}
          {f >= a + 16 && f < a + 34 ? (
            <At p={fly(f, [ND[0], ND[1] + 100, 20], [WALX(i) + 0, 300, 20], a + 16, 18, 20)}>
              <Row w={70} h={26} glow={0.6} />
            </At>
          ) : null}
          {f >= a + 34 && f < a + 60 ? (
            <At p={fly(f, [WALX(i), 230, 40], [CL[0] + 40, CL[1] + 80, 40], a + 34, 26, 80)}>
              <Chip text="✓ ack" tone="hit" size={26} glow={0.6} />
            </At>
          ) : null}
        </React.Fragment>
      ))}
      {/* no disk cluster */}
      <At p={[640, -200, 0]} o={diskIn * diskOut}>
        <div style={{ position: "relative", transformStyle: "preserve-3d" }}>
          {[0, 1, 2].map((k) => (
            <div key={k} style={{ position: "absolute", left: -140 + k * 30, top: -110 + k * 70, transformStyle: "preserve-3d" }}>
              <Slab w={240} h={60} d={30} tone="dim" radius={30}>
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Label size={20} color={LANCE.dark300} fringe={0}>
                    {`disk replica ${k + 1}`}
                  </Label>
                </div>
              </Slab>
            </div>
          ))}
        </div>
      </At>
      <Mark p={[680, -150, 80]} ok={false} v={diskX * diskOut} size={90} />
      <At p={[ND[0], ND[1] - 160, 40]} o={inn(f, C("away", node + 20) + 10, 14) * (1 - walGlow)}>
        <Tag size={28} color={LANCE.dark300}>
          node gone
        </Tag>
      </At>
      <At p={[0, 100, 40]} o={walGlow}>
        <Tag size={32} color={LANCE.orange300}>
          every acknowledged write · already in the table
        </Tag>
      </At>
    </Stage>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// Workers — "Merging new data into the table and updating its indexes runs in
// the background, on separate workers. The engine plans and schedules that
// work for you, and every row stays searchable while it runs."
// ═══════════════════════════════════════════════════════════════════════════
export const Workers: React.FC<P> = ({ enter = "slide", exit = "whoosh" }) => {
  const f = useCurrentFrame();
  const C = cueOf("workers");
  const merging = C("merging", 10);
  const updating = C("updating", 160);
  const workers = C("workers", 360);
  const plans = C("plans", 400);
  const every = C("every", 600);
  const cam = camPath(f, [
    [0, { z: 60, y: 10, rx: -5 }],
    [every - 20, { z: 60, y: 10, rx: -5 }],
    [every + 30, { z: 20, y: -10, rx: -3 }],
  ]);
  const MT: V3 = [-620, -190, 0];
  const genIn = (k: number) => pop(f, 4 + k * 14, 150, 16);
  const mergeT = ramp(f, merging + 20, merging + 60);
  const plus = ramp(f, merging + 50, merging + 80);
  const idxUp = ramp(f, updating + 10, updating + 60);
  const wIn = (k: number) => pop(f, workers - 20 + k * 10, 150, 16);
  const busy = (k: number) => (f > plans ? (Math.floor((f - plans) / 30) % 2 === k ? 1 : 0.25) : 0);
  const query = inn(f, every - 10, 16);
  const qBeam = ramp(f, every - 4, every + 30);
  const GX = [-250, -110, 30];
  const GY = 280;
  return (
    <Stage name="Merging in the background" cam={cam} enter={enter} exit={exit} floorY={480}>
      <At p={[180, 250, -40]}>
        <Storage w={1400} h={330} title="Lance table" sub="object storage" />
      </At>
      <At p={MT}>
        <Card w={380} h={220} title="MemTable" sub="RTE node" accent>
          <div style={{ position: "absolute", left: 30, top: 120 }}>
            <FillBar w={320} v={0.55} />
          </div>
        </Card>
      </At>
      <Wire a={[MT[0] + 120, MT[1] + 110, -2]} b={[GX[0] - 10, GY - 70, -2]} o={0.8} />
      <At p={[-470, 30, 30]}>
        <Tag size={24}>flush</Tag>
      </At>
      {[1, 2, 3].map((g, k) => {
        const isMerged = k === 0;
        const t = isMerged ? mergeT : 0;
        const p: V3 = [mix(GX[k], 560, t), GY, mix(10, 30, t)];
        return (
          <At key={g} p={p} o={Math.min(1, genIn(k) * 1.4) * (isMerged ? 1 - plus : 1)} s={0.8 + 0.2 * genIn(k)}>
            <Tile s={110} tone="paper" text={`gen ${g}`} size={26} glow={isMerged && t > 0 ? 0.6 : 0} />
          </At>
        );
      })}
      <At p={[-110, 185, 30]}>
        <Tag size={22}>SSTables · with indexes</Tag>
      </At>
      <At p={[590, 270, 10]}>
        <BaseTable w={460} h={220} rows={0.62} plus={plus} idx={mix(0.62, 0.62 + 0.38 * 0.95, idxUp)} />
      </At>
      {[0, 1].map((k) => (
        <At key={k} p={[590, -350 + k * 140, 20]} o={Math.min(1, wIn(k) * 1.4)} s={0.85 + 0.15 * wIn(k)}>
          <Card w={360} h={110} title={`Worker ${k + 1}`} titleSize={32} glow={busy(k) * 0.6} accent={busy(k) > 0.5}>
            <div style={{ position: "absolute", right: 30, top: 42 }}>
              <Label size={20} color={LANCE.dark300} fringe={0}>
                {busy(k) > 0.5 ? (k === 0 ? "merge" : "index") : ""}
              </Label>
            </div>
          </Card>
        </At>
      ))}
      <Wire a={[590, -150, 0]} b={[590, 150, 0]} dash o={inn(f, workers - 10, 14)} />
      <At p={[780, -40, 20]} o={inn(f, plans - 6, 14)}>
        <Tag size={20}>planned by the engine</Tag>
      </At>
      <At p={[-110, -420, 40]} o={query}>
        <Client text="query" w={200} h={80} size={30} glow={qBeam >= 1 ? 0.6 : 0} />
      </At>
      <Wire a={[-110, -380, 30]} b={[MT[0] + 100, MT[1] - 110, 30]} t={qBeam} color={LANCE.lavender} o={query} w={5} />
      <Wire a={[-110, -380, 30]} b={[-110, GY - 60, 30]} t={qBeam} color={LANCE.lavender} o={query} w={5} />
      <Wire a={[-110, -380, 30]} b={[460, 160, 30]} t={qBeam} color={LANCE.lavender} o={query} w={5} />
      <Mark p={[MT[0] + 160, MT[1] - 100, 60]} ok v={inn(f, every + 24, 10)} size={52} />
      <Mark p={[60, GY - 70, 60]} ok v={inn(f, every + 28, 10)} size={52} />
      <Mark p={[800, 170, 60]} ok v={inn(f, every + 32, 10)} size={52} />
    </Stage>
  );
};
