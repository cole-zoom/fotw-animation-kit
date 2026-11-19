import { staticFile } from "remotion";
import React from "react";
import { Img, useCurrentFrame, interpolate } from "remotion";
import { LANCE } from "./lanceTheme";
import { AEONIK, AEONIK_FONO } from "./lanceFonts";
import { chroma, retroPlate } from "./retro";
import { Stage, At, Slab, Label, Badge, ramp, pop, glide, mix, camPath, TONE } from "./boldKit";

/**
 * The 3D beats between the docs shots, in the pocket demo's kit.
 * Every label on screen is real data (PR numbers, authors, titles, review text
 * verbatim from lancedb/lancedb), except where a name says MOCK.
 *
 * All frames are LOCAL to the clip; App.tsx passes word cues as offsets.
 */

const LOGO = staticFile("examples/docs-tour/lancedb-logo-offwhite.png"); // lancedb-logo-offwhite.png (re-rendered from site/static/assets/logo/dark-lancedb-logo.svg, Nov 13; old media had no original)

// ─── a PR card ────────────────────────────────────────────────────────────
type PR = { title: string; meta: string; who: "community" | "team" };
const PRCard: React.FC<{ pr: PR; w?: number; lit?: number; glow?: number }> = ({ pr, w = 760, lit = 0, glow = 0 }) => (
  <Slab w={w} h={128} d={20} tone="card" glow={glow}>
    <div style={{ position: "absolute", inset: 0, padding: "22px 30px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <div style={{ fontFamily: AEONIK, fontSize: 32, fontWeight: 500, color: LANCE.offwhite, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", textShadow: chroma(0.8) }}>{pr.title}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ fontFamily: AEONIK_FONO, fontSize: 22, color: LANCE.dark200 }}>{pr.meta}</div>
        <div style={{ fontFamily: AEONIK_FONO, fontSize: 18, padding: "4px 10px", borderRadius: 6, color: LANCE.dark800, background: pr.who === "community" ? LANCE.lavender : LANCE.orange300 }}>{pr.who}</div>
        {lit > 0.01 && <div style={{ fontFamily: AEONIK_FONO, fontSize: 18, padding: "4px 10px", borderRadius: 6, color: LANCE.dark800, background: LANCE.orange400, opacity: lit, boxShadow: `0 0 ${16 * lit}px rgba(255,115,74,0.7)` }}>docs/web ✎</div>}
      </div>
    </div>
  </Slab>
);

// ─── F2 · community members still help write them ────────────────────────
// Real PRs from outside contributors that edit docs/web (checked Nov 13).
const COMMUNITY_DOCS: PR[] = [
  { title: "docs: fix training and dedupe examples", meta: "#4932 · HaochengLIU", who: "community" },
  { title: "docs: add Firecrawl integration page", meta: "#4706 · JuampiHernandez", who: "community" },
  { title: "feat(python): support AwareDatetime …", meta: "#4817 · Fahmid-Arman", who: "community" },
];

export const CommunityDocs: React.FC = () => {
  const f = useCurrentFrame();
  const cam = camPath(f, [[0, { z: -120, y: -60, rx: -10 }], [130, { z: -260, y: -50, rx: -6, ry: 4 }]]);
  return (
    <Stage name="Community docs PRs" cam={cam} enter="whoosh" exit="none" floorY={330}>
      {COMMUNITY_DOCS.map((pr, i) => {
        const inn = pop(f, 4 + i * 16);
        return (
          <At key={i} p={[mix(-900, (i - 1) * 40, Math.min(1, inn)), -200 + i * 160, i * 10]} r={[0, mix(-30, 0, Math.min(1, inn)), 0]} o={Math.min(1, inn * 1.5)} name={`Community PR · ${pr.meta}`}>
            <PRCard pr={pr} lit={ramp(f, 24 + i * 16, 38 + i * 16)} glow={0.35 * ramp(f, 24 + i * 16, 38 + i * 16)} />
          </At>
        );
      })}
    </Stage>
  );
};

// ─── G + H · Esquire (formerly Gatekeeper; GitHub bot login still lancedb-gatekeeper[bot] on Nov 18) ───────────────────────────────────────────────────
// Reviewed by Gatekeeper (checked Nov 13): community #4817, #4757; team #4628.
const FLOW: { pr: PR; at: number }[] = [
  { pr: { title: "feat(python): support AwareDatetime …", meta: "#4817 · Fahmid-Arman", who: "community" }, at: 0 },
  { pr: { title: "feat(python): expose the NGram scalar index", meta: "#4757 · BHAWESHBHASKAR", who: "community" }, at: 1 },
  { pr: { title: "chore: update lance dependency to v15.0.0-beta.1", meta: "#4628 · Xuanwo", who: "team" }, at: 2 },
];

export const Esquire: React.FC<{ community?: number; team?: number; andNow?: number; docs?: number }> = ({ community = 186, team = 264, andNow = 318, docs = 356 }) => {
  const f = useCurrentFrame();
  const gateIn = pop(f, 6, 120, 14);
  const docsRow = pop(f, andNow);
  const docsLit = ramp(f, docs - 4, docs + 10);
  const cam = camPath(f, [
    [0, { x: 380, z: -420, y: -110, rx: -10, ry: -10 }],
    [community - 50, { x: 380, z: -560, y: -110, rx: -8, ry: -4 }],
    [community + 30, { x: -60, z: -160, y: -90, rx: -10, ry: 2 }],
    [andNow - 6, { x: -20, z: -150, y: -90, rx: -10, ry: 6 }],
    [andNow + 34, { x: 380, z: -520, y: -110, rx: -6, ry: -4 }],
  ]);
  const starts = [community - 30, community + 6, team - 20];
  return (
    <Stage name="Esquire" cam={cam} enter="whoosh" exit="none" floorY={340}>
      {/* the gate */}
      <At p={[380, -110, 0]} s={Math.max(0.01, gateIn)} name="LanceDB Esquire">
        <Slab w={560} h={330} d={60} tone="card" glow={0.25 + 0.5 * docsLit}>
          <div style={{ position: "absolute", inset: 0, padding: "34px 40px", display: "flex", flexDirection: "column", gap: 26 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <Img src={LOGO} style={{ height: 44, width: "auto" }} />
              <Label size={38} mono={false}>Esquire</Label>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <Badge ok size={52} />
              <Label size={32} color={LANCE.offwhite}>reviews the change</Label>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 18, opacity: Math.min(1, docsRow * 1.4), transform: `translateY(${(1 - Math.min(1, docsRow)) * 30}px)` }}>
              <Badge ok={docsLit > 0.5} size={52} />
              <Label size={32} color={docsLit > 0.5 ? LANCE.orange300 : LANCE.dark200} style={{ textShadow: `0 0 ${20 * docsLit}px rgba(255,115,74,0.8)` }}>checks the docs</Label>
            </div>
          </div>
        </Slab>
      </At>

      {/* PRs flowing through it: in from the left, a tick, out to the right */}
      {FLOW.map(({ pr }, i) => {
        const t = interpolate(f, [starts[i], starts[i] + 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        if (t <= 0) return null;
        const x = mix(-1700, -560, Math.min(1, t / 0.45));
        const settled = t >= 0.45;
        return (
          <At key={i} p={[x, -260 + i * 150, 30]} r={[0, settled ? 0 : 24, 0]} s={0.8} o={Math.min(1, t * 4)} name={`PR · ${pr.meta}`}>
            <div style={{ position: "relative", transformStyle: "preserve-3d" }}>
              <PRCard pr={pr} w={760} glow={settled ? 0.3 : 0} />
              {settled && (
                <div style={{ position: "absolute", right: -40, top: 30, transform: `scale(${Math.max(0.01, pop(f, starts[i] + 34))})` }}>
                  <Badge ok size={64} />
                </div>
              )}
            </div>
          </At>
        );
      })}
    </Stage>
  );
};

// ─── I · it points to the exact docs ─────────────────────────────────────
// Gatekeeper's first review on #4817 (Nov 3, 17:04 UTC), verbatim. GitHub
// hides it from signed-out visitors as "outdated", so it is set here as text.
export const ReviewToDocs: React.FC<{ points?: number }> = ({ points = 83 }) => {
  const f = useCurrentFrame();
  const cardIn = glide(f, 2, 120);
  const link = ramp(f, points - 6, points + 10);
  const fileIn = pop(f, points + 24);
  const pulse = interpolate(f, [points + 10, points + 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const commitIn = pop(f, points + 92);
  const cam = camPath(f, [[0, { z: -380, x: -330, y: -80, rx: -6, ry: -8 }], [points, { z: -420, x: -300, y: -80, rx: -4, ry: -2 }], [points + 60, { z: -60, x: 150, y: -60, rx: -6, ry: 6 }]]);
  return (
    <Stage name="Review → docs" cam={cam} enter="whoosh" exit="none" floorY={380}>
      <At p={[-330, -140, 0]} o={Math.min(1, cardIn * 1.3)} s={mix(0.9, 1, cardIn)} name="Esquire review · #4817">
        <div style={{ ...retroPlate("30px 36px 34px", 1), width: 900, borderRadius: 14, position: "relative" }}>
          <div style={{ fontFamily: AEONIK_FONO, fontSize: 22, color: LANCE.dark200, marginBottom: 18 }}>LanceDB Esquire · review on #4817</div>
          <div style={{ fontFamily: AEONIK, fontSize: 34, fontWeight: 500, color: LANCE.offwhite, marginBottom: 18 }}>✅ Gate recommendation: approve.</div>
          <div style={{ fontFamily: AEONIK, fontSize: 30, lineHeight: 1.42, color: LANCE.dark100 }}>
            <b>Documentation:</b> Please add <code style={{ fontFamily: AEONIK_FONO }}>AwareDatetime</code> and <code style={{ fontFamily: AEONIK_FONO }}>NaiveDatetime</code> to the{" "}
            <span style={{ color: mix(0, 1, link) > 0.5 ? LANCE.orange300 : LANCE.offwhite, textDecoration: "underline", textUnderlineOffset: 6, background: `rgba(255,115,74,${0.22 * link})`, boxShadow: `0 0 ${24 * link}px rgba(255,115,74,${0.5 * link})`, borderRadius: 6, padding: "0 4px" }}>
              Pydantic type-conversion table
            </span>
            , including the UTC default and <code style={{ fontFamily: AEONIK_FONO }}>{'json_schema_extra={"tz": ...}'}</code> override for aware fields.
          </div>
        </div>
      </At>

      {pulse > 0.01 && pulse < 0.99 && (
        <At p={[mix(-60, 420, pulse), mix(-40, -170, pulse), 40]} name="Pulse">
          <div style={{ width: 26, height: 26, borderRadius: 13, background: LANCE.orange300, boxShadow: "0 0 26px 9px rgba(255,115,74,0.7)" }} />
        </At>
      )}

      <At p={[560, -190, 20]} s={Math.max(0.01, fileIn)} name="Docs page · pydantic.mdx">
        <Slab w={560} h={120} d={24} tone="paper" glow={0.3}>
          <div style={{ position: "absolute", inset: 0, padding: "20px 26px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 10 }}>
            <Label size={22} color={LANCE.dark500} fringe={0}>docs/web/integrations/data/</Label>
            <Label size={34} color={LANCE.dark800} fringe={0}>pydantic.mdx</Label>
          </div>
        </Slab>
      </At>

      <At p={[560, 10, 20]} s={Math.max(0.01, commitIn)} name="Docs commit · 4db67c3">
        <div style={{ display: "flex", alignItems: "center", gap: 20, transformStyle: "preserve-3d" }}>
          <Badge ok size={64} />
          <Slab w={620} h={110} d={18} tone="hit" glow={0.6}>
            <div style={{ position: "absolute", inset: 0, padding: "16px 24px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 8 }}>
              <Label size={22} color={LANCE.dark800} fringe={0}>Fahmid-Arman · 4db67c3</Label>
              <div style={{ fontFamily: AEONIK_FONO, fontSize: 21, color: LANCE.dark800, lineHeight: 1.2 }}>docs: list AwareDatetime and NaiveDatetime in the pydantic type table</div>
            </div>
          </Slab>
        </div>
      </At>
    </Stage>
  );
};

// ─── J · each release takes a snapshot  (MOCK versions) ──────────────────
// The release numbers below the real 1.12.0 are the same MOCK list as the
// dropdown capture: those editions are not on the live site today.
const RELEASES = ["1.10.0", "1.10.2", "1.10.4", "1.12.0"];
export const Snapshot: React.FC<{ snap?: number }> = ({ snap = 31 }) => {
  const f = useCurrentFrame();
  const folderIn = pop(f, 2);
  const flash = interpolate(f, [snap, snap + 2, snap + 14], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cam = camPath(f, [[0, { x: -400, z: -520, y: -60, rx: -12, ry: -12 }], [snap + 10, { x: -300, z: -420, y: -60, rx: -12, ry: -6 }], [snap + 120, { x: 60, z: -300, y: -60, rx: -10, ry: 8 }]]);
  return (
    <Stage name="Snapshot per release (MOCK versions)" cam={cam} enter="whoosh" exit="none" floorY={300}>
      <At p={[-420, -60, 0]} s={Math.max(0.01, folderIn)} name="docs/web">
        <Slab w={420} h={300} d={40} tone="card" glow={0.25 + 0.6 * flash}>
          <div style={{ position: "absolute", inset: 0, padding: 34, display: "flex", flexDirection: "column", gap: 16 }}>
            <Label size={40}>docs/web</Label>
            {["basics/", "curation/", "feature-engineering/", "training/", "…"].map((t) => (
              <Label key={t} size={24} color={LANCE.dark200}>{t}</Label>
            ))}
          </div>
        </Slab>
      </At>
      {RELEASES.map((v, i) => {
        const at = snap + i * 14;
        const t = glide(f, at, 110);
        if (f < at) return null;
        const latest = i === RELEASES.length - 1;
        return (
          <At key={v} p={[mix(-420, 360, t), mix(-60, -170 + i * 92, t), mix(0, -i * 30, t)]} s={mix(0.6, 1, t)} r={[0, mix(0, -12, t), 0]} name={latest ? `Edition · ${v}` : `MOCK edition · ${v}`}>
            <Slab w={460} h={78} d={22} tone={latest ? "hit" : "idle"} glow={latest ? 0.6 : 0}>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 26px" }}>
                <Label size={32} color={latest ? LANCE.dark800 : LANCE.offwhite} fringe={latest ? 0 : 1}>{v}</Label>
                <Label size={20} color={latest ? LANCE.dark800 : LANCE.dark200} fringe={0}>{latest ? "Latest" : "saved"}</Label>
              </div>
            </Slab>
          </At>
        );
      })}
      <div name="Flash" style={{ position: "absolute", inset: 0, background: "#fff", opacity: 0.55 * flash, pointerEvents: "none" }} />
    </Stage>
  );
};

// ─── K · end card ─────────────────────────────────────────────────────────
export const EndCard: React.FC<{ url?: number }> = ({ url = 30 }) => {
  const f = useCurrentFrame();
  const inn = glide(f, 0, 80);
  const lit = ramp(f, url - 4, url + 10);
  return (
    <div name="End card" style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 44, opacity: Math.min(1, inn * 1.4), transform: `scale(${mix(0.9, 1, inn)})` }}>
      <Img src={LOGO} style={{ height: 150, width: "auto" }} />
      <Label size={60} color={lit > 0.5 ? LANCE.orange300 : LANCE.dark200} style={{ textShadow: `0 0 ${24 * lit}px rgba(255,115,74,0.7)` }}>docs.lancedb.com</Label>
    </div>
  );
};

export { TONE };
