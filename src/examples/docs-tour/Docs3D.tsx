import React from "react";
import { Img, useCurrentFrame, interpolate, Easing } from "remotion";
import { LANCE } from "./lanceTheme";
import { Scanlines, Fuzz } from "./retro";
import { AEONIK_FONO } from "./lanceFonts";
import { Stage, At, mix, pop, type Cam } from "./boldKit";
import type { Rect } from "./cues2";

/**
 * V0.3B — the docs as objects in the show's 3D world, no cursor.
 *
 * Every page is the real 4K capture of docs.lancedb.com on a plane. Rings are
 * drawn ON the plane in page coordinates (measured on the live site), so they
 * stay on their element however the plane turns.
 *
 * Camera and object moves use SMOOTH, the same exaggerated expo in-out as the
 * 2D shots (Cole: "exaggerate the ease in and out a lot").
 */
export const SMOOTH = Easing.bezier(0.87, 0, 0.13, 1);
const E = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const, easing: SMOOTH };
const ease = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], E);

/** camera keyframes, eased with SMOOTH between neighbours */
const cam = (f: number, keys: [number, Cam][]): Cam => {
  const out: Cam = {};
  for (const p of ["x", "y", "z", "rx", "ry", "rz"] as const) {
    const fs = keys.map((k) => k[0]);
    const vs = keys.map((k) => k[1][p] ?? 0);
    out[p] = keys.length === 1 ? vs[0] : interpolate(f, fs, vs, E);
  }
  return out;
};

type Ring = { r: Rect; at: number; out?: number; pad?: number };

/** A docs page as a plane: 1920×1080 page units, drawn from the 2× capture. */
export const PagePlane: React.FC<{ src: string; rings?: Ring[]; glow?: number; dim?: number; back?: boolean }> = ({ src, rings = [], glow = 0, dim = 0, back }) => {
  const f = useCurrentFrame();
  return (
    <div
      name="Docs page plane"
      style={{
        position: "relative",
        width: 1920,
        height: 1080,
        borderRadius: 18,
        overflow: "hidden",
        background: "#000",
        border: `2px solid rgba(244,235,232,${0.14 + 0.4 * glow})`,
        boxShadow: glow > 0.01 ? `0 0 ${40 * glow}px rgba(255,115,74,${0.45 * glow})` : "0 18px 40px rgba(0,0,0,0.6)",
        backfaceVisibility: "hidden",
        transform: back ? "rotateY(180deg)" : undefined,
      }}
    >
      <Img src={src} style={{ position: "absolute", inset: 0, width: 1920, height: 1080 }} />
      {rings.map((ring, i) => {
        const pad = ring.pad ?? 8;
        const on = ease(f, ring.at, ring.at + 18);
        const off = ring.out === undefined ? 1 : 1 - ease(f, ring.out, ring.out + 12);
        if (on * off <= 0.001) return null;
        return (
          <div
            key={i}
            name="Highlight ring"
            style={{
              position: "absolute",
              left: ring.r.x - pad,
              top: ring.r.y - pad,
              width: ring.r.w + pad * 2,
              height: ring.r.h + pad * 2,
              borderRadius: 8,
              border: `4px solid ${LANCE.orange400}`,
              boxShadow: "0 0 22px rgba(255,115,74,0.75)",
              opacity: on * off,
              transform: `scale(${1.12 - 0.12 * on})`,
            }}
          />
        );
      })}
      {dim > 0.001 && <div style={{ position: "absolute", inset: 0, background: LANCE.dark800, opacity: dim }} />}
    </div>
  );
};

const Tab: React.FC<{ text: string; hot?: boolean; mock?: boolean }> = ({ text, hot, mock }) => (
  <div
    name={mock ? `MOCK edition tab · ${text}` : `Edition tab · ${text}`}
    style={{
      fontFamily: AEONIK_FONO,
      fontSize: 54,
      padding: "14px 30px",
      borderRadius: "16px 16px 0 0",
      background: hot ? LANCE.orange400 : LANCE.dark600,
      color: hot ? LANCE.dark800 : LANCE.dark100,
      border: `2px solid ${hot ? LANCE.orange300 : LANCE.dark500}`,
      borderBottom: "none",
      whiteSpace: "nowrap",
    }}
  >
    {text}
  </div>
);

// ─── B · one site, two products: the page flips Enterprise → Embedded ─────
export const SiteFlip: React.FC<{ front: string; back: string; frontRing: Rect; backRing: Rect; enterprise?: number; embedded?: number; openSource?: number }> = ({
  front, back, frontRing, backRing, enterprise = 58, embedded = 130, openSource = 190,
}) => {
  const f = useCurrentFrame();
  const S = 0.62;
  const flip = ease(f, embedded - 14, embedded + 30);
  const lift = Math.sin(Math.PI * flip);
  const ry = mix(mix(0, -8, ease(f, 0, 40)), 172, flip);
  // Draw only the face toward the camera (CSS backface hiding is unreliable in export).
  const showBack = Math.cos((ry * Math.PI) / 180) < 0;
  // switcher on the page: (566, 32) → world (−244, −315) at S.
  // Frame 0 matches the TV dive's last frame: page fills the frame, flat. At perspective
  // 1700 a 0.62 card fills 1920 px at z = 1700·(1 − 0.62·… ) ≈ −646.
  const c = cam(f, [
    [0, { x: 0, y: 0, z: -646, rx: 0, ry: 0 }],
    [enterprise - 10, { x: -200, y: -250, z: -520, rx: -4, ry: -6 }],
    [embedded - 16, { x: -200, y: -250, z: -520, rx: -4, ry: -6 }],
    [embedded + 26, { x: 0, y: -40, z: 300, rx: -8, ry: 10 }],
    [openSource - 4, { x: 200, y: -250, z: -480, rx: -4, ry: 8 }],
    [openSource + 70, { x: 140, y: -150, z: -200, rx: -6, ry: 12 }],
  ]);
  return (
    <Stage name="One site · Enterprise ⇄ Embedded" cam={c} enter="none" exit="none" floorY={460}>
      <At p={[0, 0, 200 * lift]} r={[0, ry, 0]} s={S} name="Docs card (Enterprise front, Embedded back)">
        {showBack ? (
          <div name="Embedded side" style={{ width: 1920, height: 1080, transform: "rotateY(180deg)" }}>
            <PagePlane src={back} rings={[{ r: backRing, at: openSource }]} />
          </div>
        ) : (
          <div name="Enterprise side" style={{ width: 1920, height: 1080 }}>
            <PagePlane src={front} rings={[{ r: frontRing, at: enterprise }]} />
          </div>
        )}
      </At>
    </Stage>
  );
};

// ─── C · every release gets its own saved docs (MOCK editions) ───────────
// The live site has only 1.12.0. The five 1.10.x pages behind it are the
// same MOCK list as the dropdown capture.
const EDITIONS = ["1.12.0", "1.10.4", "1.10.3", "1.10.2", "1.10.1", "1.10.0"];
export const VersionStack: React.FC<{ page: string; menuMock: string; menuRing: Rect; exact?: number }> = ({ page, menuMock, menuRing, exact = 187 }) => {
  const f = useCurrentFrame();
  const S = 0.5;
  const toFront = ease(f, exact - 30, exact + 20);
  const c = cam(f, [
    [0, { x: 0, y: -30, z: -260, rx: -4, ry: 0 }],
    [70, { x: 420, y: -120, z: 120, rx: -10, ry: -30 }],
    [exact - 40, { x: 520, y: -140, z: 260, rx: -10, ry: -38 }],
    [exact + 20, { x: -40, y: -60, z: -120, rx: -4, ry: -6 }],
    [exact + 70, { x: -230, y: -230, z: -760, rx: -2, ry: 0 }],
    [exact + 120, { x: -230, y: -225, z: -790, rx: -2, ry: 0 }],
  ]);
  return (
    <Stage name="Saved docs per release (MOCK 1.10.x)" cam={c} enter="none" exit="none" floorY={420}>
      {EDITIONS.map((v, i) => {
        if (i === 0) return null;
        const inn = pop(f, 6 + i * 9, 140, 16);
        const z = -i * 300;
        return (
          <At key={v} p={[i * 150, -i * 34, mix(z + 400, z, Math.min(1, inn))]} s={S} o={Math.min(1, inn * 1.4) * (1 - 0.55 * toFront)} name={`MOCK edition page · ${v}`}>
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: 40, top: -84 }}><Tab text={v} mock /></div>
              <PagePlane src={page} dim={0.35 + i * 0.06} />
            </div>
          </At>
        );
      })}
      <At p={[0, 0, 0]} s={S} name="Edition page · 1.12.0 (live)">
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", left: 40, top: -84 }}><Tab text="1.12.0 · Latest" hot /></div>
          <PagePlane src={f >= exact + 40 ? menuMock : page} glow={0.6 * toFront} rings={[{ r: menuRing, at: exact + 44, pad: 6 }]} />
        </div>
      </At>
    </Stage>
  );
};

// ─── D · which product has it, and what's early access ───────────────────
export const BadgeGlide: React.FC<{ page: string; rings: Ring[]; product?: number; early?: number }> = ({ page, rings, product = 45, early = 150 }) => {
  const f = useCurrentFrame();
  const S = 0.8;
  const c = cam(f, [
    [0, { x: 0, y: -80, z: 500, rx: -26, ry: 10 }],
    [product - 6, { x: -80, y: -230, z: -330, rx: -12, ry: 4 }],
    [early - 40, { x: -70, y: -225, z: -350, rx: -12, ry: 2 }],
    [early + 6, { x: -230, y: -60, z: -230, rx: -12, ry: -6 }],
    [256, { x: -260, y: -40, z: -180, rx: -12, ry: -10 }],
  ]);
  return (
    <Stage name="Create Function · Applies to + Early access" cam={c} enter="none" exit="none" floorY={520}>
      <At p={[0, 0, 0]} r={[18, -6, 0]} s={S} name="Create a Function (Data Curation)">
        <PagePlane src={page} rings={rings} />
      </At>
    </Stage>
  );
};

// ─── D2 · new guides: curation, feature engineering, training ─────────────
export const GuidesDeal: React.FC<{ pages: { src: string; ring: Rect; at: number; name: string }[] }> = ({ pages }) => {
  const f = useCurrentFrame();
  const S = 0.56;
  const c = cam(f, [
    [0, { x: -120, y: -40, z: 0, rx: -8, ry: -4 }],
    [pages[1].at, { x: 60, y: -50, z: -60, rx: -8, ry: 2 }],
    [pages[2].at, { x: 230, y: -60, z: -120, rx: -8, ry: 8 }],
    [pages[2].at + 60, { x: 260, y: -60, z: -180, rx: -8, ry: 10 }],
  ]);
  return (
    <Stage name="New guides · dealt in" cam={c} enter="none" exit="none" floorY={460}>
      {pages.map((p, i) => {
        const land = ease(f, p.at - 14, p.at + 16);
        if (f < p.at - 14) return null;
        const later = pages[i + 1] ? ease(f, pages[i + 1].at - 14, pages[i + 1].at + 16) : 0;
        return (
          <At
            key={i}
            p={[mix(1700, -120 + i * 190, land), mix(-300, -10 + i * 30, land), mix(-1400, i * 40, land)]}
            r={[mix(30, 4, land), mix(-50, -10 + i * 2, land), mix(-14, -2 + i * 2.5, land)]}
            s={S}
            name={p.name}
          >
            <PagePlane src={p.src} rings={[{ r: p.ring, at: p.at + 6 }]} dim={0.45 * later} />
          </At>
        );
      })}
    </Stage>
  );
};

// ═══ V0.3B r2 — ONE continuous shot through the docs ══════════════════════
// Cole (Nov 13): no flip (it made it unclear where you were on the site), Enterprise stays
// at the top of the angled page, the dropdown opens and selects without a cursor, no cuts, and
// "exaggerate the smoothness".
//
// SMOOTHNESS: the camera is a time-aware Hermite (Catmull-Rom) spline through its keys. The
// tangent at each key is the average velocity of its neighbours, so the camera never stops
// between moves; it only eases from rest at the very first key and back to rest at the last.

type CamKey = [number, Cam];
const AX = ["x", "y", "z", "rx", "ry", "rz"] as const;
const splineCam = (f: number, keys: CamKey[]): Cam => {
  const n = keys.length;
  const t = keys.map((k) => k[0]);
  if (f <= t[0]) return keys[0][1];
  if (f >= t[n - 1]) return keys[n - 1][1];
  let i = 0;
  while (f > t[i + 1]) i++;
  const h = t[i + 1] - t[i];
  const u = (f - t[i]) / h;
  const h00 = 2 * u ** 3 - 3 * u ** 2 + 1, h10 = u ** 3 - 2 * u ** 2 + u, h01 = -2 * u ** 3 + 3 * u ** 2, h11 = u ** 3 - u ** 2;
  const out: Cam = {};
  for (const a of AX) {
    const v = (j: number) => keys[j][1][a] ?? 0;
    const m = (j: number) => (j === 0 || j === n - 1 ? 0 : (v(j + 1) - v(j - 1)) / (t[j + 1] - t[j - 1]));
    out[a] = h00 * v(i) + h10 * h * m(i) + h01 * v(i + 1) + h11 * h * m(i + 1);
  }
  return out;
};


// A floor-less stage for the journey. With the camera this close (translateZ up to ~1080 at
// perspective 1700), the show's 8000×8000 floor plane crosses behind the camera and Chromium
// allocates a huge layer for it, which crashed Kino's renderer (exit 5). Same camera math as
// boldKit's Stage, same background and grade, no floor.
const LightStage: React.FC<{ name: string; cam: Cam; children: React.ReactNode }> = ({ name, cam: c, children }) => {
  const { x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0 } = c;
  return (
    <div name={name} style={{ position: "absolute", inset: 0, overflow: "hidden", background: `radial-gradient(ellipse 90% 75% at 50% 42%, ${LANCE.dark700} 0%, ${LANCE.dark800} 70%)` }}>
      <div style={{ position: "absolute", left: "50%", top: "50%", width: 0, height: 0, perspective: 1700, perspectiveOrigin: "0 0" }}>
        <div name="World" style={{ position: "absolute", transformStyle: "preserve-3d", transform: `translateZ(${-z}px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg) translate3d(${-x}px, ${-y}px, 0px)` }}>
          {children}
        </div>
      </div>
      <Scanlines opacity={0.12} />
      <Fuzz opacity={0.16} />
    </div>
  );
};


// Cole (Nov 13, r3): too much camera movement, move only when necessary. The camera now holds
// still at each key and makes one slow eased move to the next (duplicate a key to hold longer).
const HOLD_EASE = Easing.bezier(0.65, 0, 0.35, 1);
const heldCam = (f: number, keys: CamKey[]): Cam => {
  const out: Cam = {};
  for (const a of AX) {
    out[a] = interpolate(f, keys.map((k) => k[0]), keys.map((k) => k[1][a] ?? 0), { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: HOLD_EASE });
  }
  return out;
};

type PageState = { at: number; src: string; fade?: number; name: string };
export type JourneyRing = Ring;

export const DocsJourney: React.FC<{
  states: PageState[];
  rings: JourneyRing[];
  keys: CamKey[];
  editions?: { page: string; in: number; out: number; labels: string[] };
}> = ({ states, rings, keys, editions }) => {
  const f = useCurrentFrame();
  const S = 0.62;
  const c = heldCam(f, keys);
  // current and previous page states, for an in-place crossfade like a browser navigation
  let k = 0;
  while (k + 1 < states.length && f >= states[k + 1].at) k++;
  const cur = states[k];
  const prev = k > 0 ? states[k - 1] : null;
  const a = prev ? ease(f, cur.at, cur.at + (cur.fade ?? 10)) : 1;
  const fan = editions ? ease(f, editions.in, editions.in + 70) * (1 - ease(f, editions.out, editions.out + 50)) : 0;
  return (
    <LightStage name="Docs journey · one continuous shot" cam={c}>
      {editions && fan > 0.001 &&
        editions.labels.map((v, i) => (
          <At key={v} p={[(i + 1) * 150 * fan, 0, -(i + 1) * 300 * fan - 4]} s={S} o={Math.min(1, fan * 1.6)} name={`MOCK edition page · ${v}`}>
            <div style={{ position: "relative", width: 1920, height: 1080 }}>
              <div style={{ position: "absolute", left: 40, top: -84 }}><Tab text={v} mock /></div>
              <PlainPage src={editions.page} dim={0.35 + i * 0.07} />
            </div>
          </At>
        ))}
      <At p={[0, 0, 0]} s={S} name={`Docs page · ${cur.name}`}>
        <div style={{ position: "relative", width: 1920, height: 1080 }}>
          {prev && a < 1 && (
            <div style={{ position: "absolute", inset: 0 }}>
              <PlainPage src={prev.src} />
            </div>
          )}
          <div style={{ position: "absolute", inset: 0, opacity: a }}>
            <PlainPage src={cur.src} rings={rings} />
          </div>
          {editions && fan > 0.01 && (
            <div style={{ position: "absolute", left: 40, top: -84, opacity: Math.min(1, fan * 1.6) }}><Tab text="1.12.0 · Latest" hot /></div>
          )}
        </div>
      </At>
    </LightStage>
  );
};


/** Plain page for the exporter-safe journey: an Img and its rings, no clip/radius/shadow/backface
 *  (V0.2's DocsShot draws pages this way and still exports; PagePlane's styling is the suspect). */
const PlainPage: React.FC<{ src: string; rings?: Ring[]; dim?: number }> = ({ src, rings = [], dim = 0 }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, background: "#000" }}>
      <Img src={src} style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080 }} />
      {rings.map((ring, i) => {
        const pad = ring.pad ?? 8;
        const on = ease(f, ring.at, ring.at + 18);
        const off = ring.out === undefined ? 1 : 1 - ease(f, ring.out, ring.out + 12);
        if (on * off <= 0.001) return null;
        return (
          <div key={i} name="Highlight ring" style={{ position: "absolute", left: ring.r.x - pad, top: ring.r.y - pad, width: ring.r.w + pad * 2, height: ring.r.h + pad * 2, borderRadius: 8, border: `4px solid ${LANCE.orange400}`, boxShadow: "0 0 22px rgba(255,115,74,0.75)", opacity: on * off, transform: `scale(${1.12 - 0.12 * on})` }} />
        );
      })}
      {dim > 0.001 && <div style={{ position: "absolute", inset: 0, background: LANCE.dark800, opacity: dim }} />}
    </div>
  );
};

// ═══ Exporter-safe version of the journey ═════════════════════════════════
// The true-3D DocsJourney renders in screenshots but Kino's exporter closes its window on it
// every time (Nov 13, even 100 frames, PNG or JPEG). DocsShot-style shots — ONE element with a
// perspective() rotate in its own transform, no preserve-3d world — export fine. So this draws
// the same camera spline that way: the world-space keys are converted to a page point, a zoom
// and a tilt. Editions fan out as dimmed copies behind the page inside the same tilted element.
export const DocsJourneyFlat: React.FC<{
  states: PageState[];
  rings: JourneyRing[];
  keys: CamKey[];
  editions?: { page: string; in: number; out: number; labels: string[] };
}> = ({ states, rings, keys, editions }) => {
  const f = useCurrentFrame();
  const S = 0.62;
  const c = splineCam(f, keys);
  const px = 960 + (c.x ?? 0) / S;
  const py = 540 + (c.y ?? 0) / S;
  const zoom = (S * 1700) / (1700 + (c.z ?? 0));
  const rx = -(c.rx ?? 0) * 1.2;
  const ry = -(c.ry ?? 0) * 1.2;
  let k = 0;
  while (k + 1 < states.length && f >= states[k + 1].at) k++;
  const cur = states[k];
  const prev = k > 0 ? states[k - 1] : null;
  const a = prev ? ease(f, cur.at, cur.at + (cur.fade ?? 10)) : 1;
  const fan = editions ? ease(f, editions.in, editions.in + 70) * (1 - ease(f, editions.out, editions.out + 50)) : 0;
  return (
    <div name="Docs journey · one continuous shot" style={{ position: "absolute", inset: 0, overflow: "hidden", background: `radial-gradient(ellipse 90% 75% at 50% 42%, ${LANCE.dark700} 0%, ${LANCE.dark800} 70%)` }}>
      <div
        name="Camera"
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 1920,
          height: 1080,
          transformOrigin: "0 0",
          transform: `translate(960px, 540px) perspective(2400px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${zoom}) translate(${-px}px, ${-py}px)`,
        }}
      >
        {editions && fan > 0.001 &&
          editions.labels
            .map((v, i) => ({ v, i }))
            .reverse()
            .map(({ v, i }) => {
              const d = (i + 1) * fan;
              return (
                <div
                  key={v}
                  name={`MOCK edition page · ${v}`}
                  style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, transformOrigin: "0 0", transform: `translate(${d * 230}px, ${-d * 120}px) scale(${1 - 0.07 * d})`, opacity: Math.min(1, fan * 1.6) }}
                >
                  <div style={{ position: "absolute", left: 40, top: -84 }}><Tab text={v} mock /></div>
                  <PlainPage src={editions.page} dim={0.45 + i * 0.07} />
                </div>
              );
            })}
        <div name={`Docs page · ${cur.name}`} style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080 }}>
          {prev && a < 1 && (
            <div style={{ position: "absolute", inset: 0 }}>
              <PlainPage src={prev.src} />
            </div>
          )}
          <div style={{ position: "absolute", inset: 0, opacity: a }}>
            <PlainPage src={cur.src} rings={rings} />
          </div>
          {editions && fan > 0.01 && (
            <div style={{ position: "absolute", left: 40, top: -84, opacity: Math.min(1, fan * 1.6) }}><Tab text="1.12.0 · Latest" hot /></div>
          )}
        </div>
      </div>
      <Scanlines opacity={0.12} />
      <Fuzz opacity={0.16} />
    </div>
  );
};
