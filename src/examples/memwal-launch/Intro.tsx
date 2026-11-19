import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, interpolate, Easing } from "remotion";

/**
 * Music intro (Nov 17, Cole: "we need a cool intro, then cross fade into the start").
 * One beat-cut of a scene: shows the wrapped scene from its local frame `at`, with a
 * small punch-in (1.06 → 1) and a 4-frame flash on the cut. `fadeOut` > 0 dissolves the
 * cut to what's underneath (the opening faces shot) over its last `fadeOut` frames.
 */
export const IntroCut: React.FC<{ at: number; dur: number; fadeOut?: number; children: React.ReactNode }> = ({
  at, dur, fadeOut = 0, children,
}) => {
  const f = useCurrentFrame();
  const scale = interpolate(f, [0, 22], [1.06, 1], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const flash = interpolate(f, [0, 4], [0.22, 0], { extrapolateRight: "clamp" });
  const opacity = fadeOut ? interpolate(f, [dur - fadeOut, dur], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;
  return (
    <AbsoluteFill style={{ zIndex: 5, opacity, overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${scale})` }}>
        <Sequence from={-at} durationInFrames={at + dur} layout="none">{children}</Sequence>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "#fff", opacity: flash, pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};
