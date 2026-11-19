import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";
import { LANCE } from "./lanceTheme";
import { AEONIK_FONO } from "./lanceFonts";
import { Glyph, ALL } from "./modality";
import { Img, staticFile } from "remotion";
import { Sunset, Scanlines, useBeat, chroma, chromaFilter, poster, HORIZON, SUN } from "./retro";

/**
 * Sign-off on the same stage as the cold open, and the sun goes back down.
 *
 * Ep. 04: copied from Ep. 03, only the episode number and kicker changed.
 * Ep. 02: unchanged from Ep. 01 by request — same 420 frames, same cues, same
 * sink anchored to the END so the finished frame genuinely freezes for about
 * three seconds. Only the episode number and the payoff kicker differ. The
 * intro got cut to 2s; the outro is where people who stayed get the credit,
 * so it keeps its length.
 *
 * The outro bed starts 75 frames before this card does, so the beat grid is
 * anchored at local 25 rather than 17 — same 120 BPM, offset to where the card
 * actually begins. Its envelope decays from the first bar, so nothing here
 * builds; it lands, states the credit, and sinks.
 *
 * Multimodal rides entirely on the skyline now - the four glyphs standing on
 * the horizon in front of the sun. The spelled-out line is gone.
 */

const LOGO = staticFile("lancedb-logo-offwhite.png");

const CUE = { title: 25, station: 58, glyphs: 86, kicker: 118, set: 150 };

const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const beat = useBeat(11, 30, 25);

  const ease = (a: number, b: number, from: number, to: number, e = Easing.out(Easing.poly(4))) =>
    interpolate(frame, [a, b], [from, to], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: e,
    });

  // Up, HELD, and only sinking over the last two seconds. The outro is 420
  // frames now rather than 210, and all of that extra length is meant to read
  // as a freeze on the finished frame - so the sink is anchored to the END
  // instead of starting at CUE.set and crawling across the whole clip.
  //
  // Both ends still go through Math.max: an absolute cue paired with
  // durationInFrames inverts the inputRange if the duration ever resolves short
  // (Kino reports 1 while media is unresolved), Remotion throws, and that one
  // throw takes the whole project's runtime analysis down. Never remove.
  const rise = ease(
    Math.max(CUE.set, durationInFrames - 130),
    Math.max(CUE.set + 1, durationInFrames),
    1,
    0.88,
    Easing.inOut(Easing.quad),
  );
  const bandsIn = ease(0, 26, 4, 9, Easing.out(Easing.poly(2)));

  const land = interpolate(frame, [CUE.title, CUE.title + 5, CUE.title + 34], [0, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });
  const fringe = Math.min(11, 1.6 + beat * 2.4 + land * 13);

  const titleIn = ease(CUE.title, CUE.title + 22, 0, 1, Easing.out(Easing.back(2.2)));
  const stationIn = ease(CUE.station, CUE.station + 18, 0, 1, Easing.out(Easing.back(2)));
  const kickIn = ease(CUE.kicker, CUE.kicker + 16, 0, 1, Easing.out(Easing.poly(4)));
  const out = ease(durationInFrames - 26, durationInFrames, 1, 0, Easing.in(Easing.quad));

  // the sun's own center, so type can be hung off the disc instead of the frame
  const sunCy = interpolate(rise, [0, 1], [HORIZON + SUN.r + 60, HORIZON]);

  const centerd = { ...poster(96), transformOrigin: "center center" as const };

  return (
    <div
      name="Outro Ground"
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: LANCE.dark800,
        overflow: "hidden",
        opacity: out,
        transform: `scale(${1 + land * 0.012})`,
      }}
    >
      <Sunset rise={rise} bandsIn={bandsIn} glow={beat * 0.7 + land}>
        {ALL.map((kind, i) => {
          const cue = CUE.glyphs + [0, 9, 17, 27][i];
          const g = interpolate(frame, [cue, cue + 18], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.back(2.6)),
          });
          if (g <= 0.02) return null;
          const x = 470 + i * 340;
          const s = 84 * g;
          return (
            <g key={kind} transform={`translate(${x - s / 2} ${HORIZON - s - 6})`} opacity={g}>
              <g transform={`scale(${s / 100})`}>
                <Glyph kind={kind} size={100} color={LANCE.offwhite} phase={frame + i * 13} />
              </g>
            </g>
          );
        })}
      </Sunset>

      {/* the credit, centerd in the sky over the sun */}
      <div
        name="Production Credit"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 138,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          color: LANCE.offwhite,
          opacity: titleIn,
          transform: `scale(${0.9 + titleIn * 0.1})`,
          textShadow: chroma(fringe),
        }}
      >
        <div
          style={{
            fontFamily: AEONIK_FONO,
            fontSize: 26,
            letterSpacing: "0.42em",
            color: LANCE.lavender,
            marginBottom: 14,
          }}
        >
          A
        </div>
        <Img
          src={LOGO}
          style={{ width: 430, objectFit: "contain", marginBottom: 18, filter: chromaFilter(fringe) }}
        />
        <div style={{ ...centerd, color: LANCE.orange300 }}>Production</div>
      </div>

      <div
        name="Station"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 430,
          textAlign: "center",
          fontFamily: AEONIK_FONO,
          fontSize: 26,
          letterSpacing: "0.3em",
          color: LANCE.lavender,
          opacity: stationIn,
          transform: `translateY(${(1 - stationIn) * 14}px)`,
          textShadow: chroma(1.6),
        }}
      >
        FEATURE OF THE WEEK — EP. 07
      </div>

      {/* On the sun itself, not the banded field - dark type on the disc is
          exactly what the sleeve does, and the bands were slicing it up.
          KEEP IT SHORT: the disc is 660px wide and this type is dark800, so
          anything that overhangs the disc lands on dark sky and vanishes.
          "BATCH VECTOR SEARCH · ANN + INDEXED · 2.5x FASTER" was ~760px and
          lost its first and last words. */}
      <div
        name="Kicker"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: sunCy - 168,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 14,
          color: LANCE.dark800,
          opacity: kickIn,
          transform: `translateY(${(1 - kickIn) * 16}px)`,
        }}
      >
        <div
          style={{
            fontFamily: AEONIK_FONO,
            fontWeight: 500,
            fontSize: 24,
            letterSpacing: "0.1em",
            whiteSpace: "nowrap",
            opacity: 0.85,
          }}
        >
          COMBINED FIELDS · BM25F ACROSS COLUMNS
        </div>
      </div>

      <Scanlines opacity={0.15 + beat * 0.05} />
    </div>
  );
};

export default Outro;
