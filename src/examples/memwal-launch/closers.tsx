import { staticFile } from "remotion";
import React from "react";
import { useCurrentFrame, useVideoConfig, Img, interpolate, Easing } from "remotion";
import { LANCE } from "./lanceTheme";
import { AEONIK, AEONIK_FONO } from "./lanceFonts";
import { chroma, chromaFilter, Scanlines, Fuzz } from "./retro";

const LOGO = staticFile("examples/memwal-launch/lancedb-logo-offwhite.png"); // lancedb-logo-offwhite

const slideIn = (f: number, dur: number, cue = 6) => {
  const inO = interpolate(f, [cue, cue + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const x = interpolate(f, [cue, cue + 26], [-260, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.poly(4)) });
  const out = interpolate(f, [dur - 16, dur - 4], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.quad) });
  return { opacity: inO * out, x };
};

const plate: React.CSSProperties = {
  position: "absolute",
  padding: "22px 30px",
  backgroundColor: "rgba(23,21,19,0.93)",
  borderLeft: `5px solid ${LANCE.orange500}`,
  filter: "drop-shadow(0 10px 26px rgba(23,21,19,0.75))",
  whiteSpace: "nowrap",
};

/** "To try it, talk to us about LanceDB Enterprise, or read the blog… Links are below." */
export const CtaCard: React.FC<{ blogAt?: number }> = ({ blogAt = 100 }) => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const a = slideIn(f, durationInFrames, 6);
  const b = slideIn(f, durationInFrames, blogAt);
  const row = (label: string, value: string, s: { opacity: number; x: number }) => (
    <div style={{ opacity: s.opacity, transform: `translateX(${s.x}px)`, display: "flex", alignItems: "baseline", gap: 18, marginTop: 10 }}>
      <div style={{ fontFamily: AEONIK_FONO, fontSize: 20, letterSpacing: "0.22em", color: LANCE.lavender, width: 150 }}>{label}</div>
      <div style={{ fontFamily: AEONIK, fontWeight: 500, fontSize: 40, letterSpacing: "-0.02em", color: LANCE.offwhite, textShadow: chroma(1.2) }}>{value}</div>
    </div>
  );
  return (
    <div name="CTA · Enterprise + blog" style={{ ...plate, left: 90, top: 90 }}>
      {row("TRY IT", "LanceDB Enterprise", a)}
      {row("READ", "the blog · link below ↓", b)}
    </div>
  );
};

/** "Thanks to Dan Rammer, Xuanyu Zhan, Jack Ye and the team behind the Realtime Engine!" */
export const Credits: React.FC<{ cues?: number[] }> = ({ cues = [20, 50, 80, 110] }) => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const names = ["Dan Rammer", "Xuanyu Zhan", "Jack Ye", "+ the Realtime Engine team"];
  const head = slideIn(f, durationInFrames, 0);
  return (
    <div name="Credits · Realtime Engine team" style={{ ...plate, left: 90, top: 90, opacity: head.opacity, transform: `translateX(${head.x}px)` }}>
      <div style={{ fontFamily: AEONIK_FONO, fontSize: 20, letterSpacing: "0.26em", color: LANCE.lavender, marginBottom: 14 }}>THANKS TO</div>
      {names.map((n, i) => {
        const s = slideIn(f, durationInFrames + 999, cues[i] ?? 20 + i * 30);
        const last = i === names.length - 1;
        return (
          <div key={n} style={{ opacity: s.opacity, transform: `translateX(${s.x * 0.4}px)`, fontFamily: AEONIK, fontWeight: 500, fontSize: last ? 30 : 44, lineHeight: 1.25, letterSpacing: "-0.02em", color: last ? LANCE.dark200 : LANCE.offwhite, textShadow: chroma(last ? 0.6 : 1.2), textTransform: last ? undefined : "uppercase" }}>
            {n}
          </div>
        );
      })}
    </div>
  );
};

/** End card on "A LanceDB Production." Bookends the title card: same lane of rows, landing. */
export const Outro: React.FC = () => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const inO = interpolate(f, [0, 14], [0, 1], { extrapolateRight: "clamp" });
  const logo = interpolate(f, [4, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const word = interpolate(f, [18, 44], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const rule = interpolate(f, [26, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const out = interpolate(f, [durationInFrames - 30, durationInFrames], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div name="Outro · A LanceDB Production" style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 90% 75% at 50% 45%, ${LANCE.dark700} 0%, ${LANCE.dark800} 70%)`, opacity: inO * out, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 360, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ fontFamily: AEONIK_FONO, fontSize: 26, letterSpacing: "0.42em", color: LANCE.lavender, opacity: logo, marginBottom: 18 }}>A</div>
        <Img src={LOGO} style={{ width: 460, objectFit: "contain", opacity: logo, transform: `scale(${0.94 + 0.06 * logo})`, filter: chromaFilter(1.4) }} />
        <div style={{ marginTop: 22, fontFamily: AEONIK, fontWeight: 500, fontSize: 64, letterSpacing: "0.32em", textTransform: "uppercase", color: LANCE.orange300, opacity: word, textShadow: chroma(1.4), paddingLeft: "0.32em" }}>Production</div>
        <div style={{ marginTop: 34, width: 620 * rule, height: 4, background: LANCE.orange400, borderRadius: 2, boxShadow: "0 0 16px rgba(255,115,74,0.7)" }} />
        <div style={{ marginTop: 26, fontFamily: AEONIK_FONO, fontSize: 22, letterSpacing: "0.3em", color: LANCE.dark200, opacity: rule }}>REALTIME ENGINE</div>
      </div>
      <Scanlines opacity={0.12} />
      <Fuzz opacity={0.16} />
    </div>
  );
};
