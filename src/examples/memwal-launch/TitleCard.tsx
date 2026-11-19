import { staticFile } from "remotion";
import React from "react";
import { useCurrentFrame, useVideoConfig, Img, interpolate, Easing } from "remotion";
import { LANCE } from "./lanceTheme";
import { AEONIK, AEONIK_FONO } from "./lanceFonts";
import { chroma, chromaFilter } from "./retro";
import { Stage, At, camPath, ramp, glide } from "./boldKit";
import { Row, inn } from "./rteKit";

/**
 * Title card on "LanceDB Realtime Engine!" (both). Not the FOTW sunset intro
 * (Cole: do not copy it). Same lens (scanlines, chroma fringe, floor grid),
 * played straight:
 *
 *   rows stream in from the left along one lane and land in a slab; every
 *   landing pulses the slab. The wordmark and "Realtime Engine" sit on it.
 *   Camera drifts in a touch for the whole card.
 */
const LOGO = staticFile("examples/memwal-launch/lancedb-logo-offwhite.png"); // lancedb-logo-offwhite

const N = 14;
const LANE_Y = 150;

export const TitleCard: React.FC<{ word?: number }> = ({ word = 6 }) => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const cam = camPath(f, [
    [0, { z: 60, y: 10, rx: -4 }],
    [durationInFrames, { z: -120, y: 0, rx: -2 }],
  ]);
  const logoIn = glide(f, word);
  const titleIn = glide(f, word + 14);
  const land = (i: number) => 4 + i * 7;
  let pulse = 0;
  for (let i = 0; i < N; i++) {
    const d = f - (land(i) + 22);
    if (d >= 0 && d < 14) pulse = Math.max(pulse, 1 - d / 14);
  }
  const ruleW = interpolate(f, [word + 10, word + 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  return (
    <Stage name="Title · LanceDB Realtime Engine" cam={cam} enter="none" exit="whoosh" floorY={360}>
      {/* the lane */}
      <At p={[-200, LANE_Y + 26, 0]}>
        <div style={{ width: 1900, height: 2, background: `linear-gradient(90deg, transparent, ${LANCE.dark500} 30%, ${LANCE.dark500})` }} />
      </At>
      {Array.from({ length: N }).map((_, i) => {
        const t = ramp(f, land(i), land(i) + 22, Easing.in(Easing.cubic));
        if (t <= 0 || t >= 1) return null;
        const x = -1150 + 1650 * t;
        return (
          <At key={i} p={[x, LANE_Y, 0]} o={Math.min(1, t * 4)}>
            <Row w={90} h={34} glow={0.4} />
          </At>
        );
      })}
      {/* the slab the rows land in */}
      <At p={[560, LANE_Y, 0]}>
        <div
          style={{
            width: 70,
            height: 120,
            borderRadius: 12,
            background: LANCE.orange400,
            boxShadow: `0 0 ${30 + 60 * pulse}px ${6 + 10 * pulse}px rgba(255,115,74,${0.35 + 0.35 * pulse})`,
            transform: `scale(${1 + pulse * 0.06})`,
          }}
        />
      </At>
      {/* wordmark */}
      <At p={[0, -150, 40]} o={logoIn} s={0.94 + 0.06 * logoIn}>
        <Img src={LOGO} style={{ width: 520, objectFit: "contain", filter: chromaFilter(1.4 + pulse * 2) }} />
      </At>
      <At p={[0, 10, 40]} o={titleIn} s={0.94 + 0.06 * titleIn}>
        <div
          style={{
            fontFamily: AEONIK,
            fontWeight: 500,
            fontSize: 150,
            lineHeight: 1,
            letterSpacing: "-0.04em",
            color: LANCE.offwhite,
            whiteSpace: "nowrap",
            textShadow: chroma(1.6 + pulse * 2.5),
          }}
        >
          Realtime Engine
        </div>
      </At>
      <At p={[0, 98, 40]} o={titleIn}>
        <div style={{ width: 760 * ruleW, height: 5, background: LANCE.orange400, borderRadius: 3, boxShadow: "0 0 18px rgba(255,115,74,0.7)" }} />
      </At>
    </Stage>
  );
};

export default TitleCard;
