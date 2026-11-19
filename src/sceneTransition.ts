import { useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";

/**
 * How adjacent full-bleed diagram scenes hand off to each other.
 *
 *   "fade"  - cross-dissolve to whatever is underneath (the talking head).
 *   "slide" - horizontal push. The outgoing scene translates to -100% while the
 *             incoming one translates from +100% to 0 over the SAME frames with
 *             the SAME easing, so the two panels stay exactly edge-to-edge and
 *             read as one filmstrip advancing. Both panels are opaque
 *             LANCE.dark800, so no seam ever exposes the footage below.
 *   "whoosh" - a fast push with motion blur, for cutting away from the faces
 *             to a graphic and back. The panel arrives from the right (or
 *             leaves to the left) in WHOOSH_FRAMES, blurred hardest at peak
 *             speed; `whoosh` (0..1) is that speed, for WhooshStreaks and
 *             timing the sound effect (peak at WHOOSH_FRAMES * 0.4).
 *   "none"  - hard cut.
 */
export type SceneTransition = "fade" | "slide" | "whoosh" | "none";

export const WHOOSH_FRAMES = 16;
const WHOOSH_EASE = Easing.bezier(0.7, 0, 0.2, 1);
/** speed profile of WHOOSH_EASE, normalised to 1 at its peak */
const whooshSpeed = (t: number) => Math.max(0, Math.sin(Math.min(1, Math.max(0, t)) * Math.PI)) ** 1.5;

/**
 * Overlap, in frames, that a sliding pair MUST share on the timeline: the
 * outgoing scene's last SLIDE_FRAMES are the incoming scene's first.
 * Change this and you must re-derive the two `from` values in App.tsx.
 */
export const SLIDE_FRAMES = 22;

// Quick off the mark, long settle - a push, not a scroll.
const SLIDE_EASE = Easing.bezier(0.4, 0, 0.1, 1);

export const useSceneTransition = ({
  enter = "fade",
  exit = "fade",
  fadeFrames,
}: {
  enter?: SceneTransition;
  exit?: SceneTransition;
  fadeFrames?: number;
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();
  const f = fadeFrames ?? Math.round(fps * 0.5);

  let opacity = 1;
  let x = 0;
  let whoosh = 0;

  if (enter === "fade") {
    opacity *= interpolate(frame, [0, f], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  } else if (enter === "whoosh") {
    const t = frame / WHOOSH_FRAMES;
    x += interpolate(t, [0, 1], [100, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: WHOOSH_EASE });
    if (t < 1) whoosh = Math.max(whoosh, whooshSpeed(t));
  } else if (enter === "slide") {
    x += interpolate(frame, [0, SLIDE_FRAMES], [100, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: SLIDE_EASE,
    });
  }

  if (exit === "fade") {
    opacity *= interpolate(
      frame,
      [durationInFrames - f, durationInFrames],
      [1, 0],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
    );
  } else if (exit === "whoosh") {
    const t = (frame - (durationInFrames - WHOOSH_FRAMES)) / WHOOSH_FRAMES;
    x -= interpolate(t, [0, 1], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: WHOOSH_EASE });
    if (t > 0) whoosh = Math.max(whoosh, whooshSpeed(t));
  } else if (exit === "slide") {
    x -= interpolate(
      frame,
      [durationInFrames - SLIDE_FRAMES, durationInFrames],
      [0, 100],
      {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: SLIDE_EASE,
      },
    );
  }

  return {
    opacity,
    transform: `translateX(${x}%)`,
    // horizontal-only smear is not a CSS primitive; a plain blur at peak
    // speed plus WhooshStreaks on top reads as motion blur at 60fps
    filter: whoosh > 0.01 ? `blur(${(whoosh * 14).toFixed(2)}px)` : undefined,
    whoosh,
  };
};
