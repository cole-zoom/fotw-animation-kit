import React from "react";
import { ThreeCanvas } from "@remotion/three";
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";
import { LANCE } from "./lanceTheme";
import { AEONIK } from "./lanceFonts";
import { useSceneTransition, SceneTransition } from "./sceneTransition";
import { Fuzz, chroma } from "./retro";
import { CAMERA, Lights, Tag, useBox, useMaterials, useProjector } from "./diagramKit";
import { hop } from "./CaptionLine";

/**
 * A pull request, as a page that whooshes in and covers the frame.
 *
 * Ep. 03's `PrPage3D`; Ep. 05 makes the PR a prop because the episode has two
 * (Yang's feature #9493 and his fix #9551 the next day). Same page, same
 * recolor (merged badge orange500, diff bar orange/dark).
 *
 * Everything on it comes from the GitHub API (see PRS below), not typed
 * from memory. Three file rows: the three largest diffs.
 *
 * `title` words carry an optional LOCAL hop frame — the words the VO says.
 */
export type PR = {
  number: number;
  title: [string, number | null][];
  merged: string;
  stats: string;
  files: [string, number, number][];
  adds: number;
  dels: number;
};

export const PRS: Record<string, PR> = {
  // Ep. 06 — gh pr view 7905: sbrunk, opened 2026-07-22, merged 2026-09-25 by Xuanwo,
  // 4 commits, 35 files, +5,290 / −190; approved by BubbleCal + Xuanwo
  bm25f: {
    number: 7905,
    title: [
      ["feat(fts):", null],
      ["add", null],
      ["BM25F", null],
      ["cross-field", null],
      ["search", null],
    ],
    merged: "@Xuanwo merged 4 commits into main from sbrunk:combined-fields-bm25f",
    stats: "4 COMMITS · 35 FILES CHANGED",
    files: [
      ["rust/lance/src/dataset/tests/dataset_fts_combined_fields.rs", 952, 0],
      ["rust/lance/src/io/exec/fts.rs", 718, 65],
      ["rust/lance-index/src/scalar/inverted/combined/search.rs", 437, 0],
    ],
    adds: 5290,
    dels: 190,
  },
  // gh pr view 9493: BubbleCal, opened + merged 2026-09-23, 4 commits, 16 files, +1,795 / −3
  feature: {
    number: 9493,
    title: [
      ["feat(vector):", null],
      ["add", null],
      ["streaming", null],
      ["duplicate", null],
      ["pair", null],
      ["enumeration", null],
    ],
    merged: "@BubbleCal merged 4 commits into main from yang/vector-duplicate-pairs",
    stats: "4 COMMITS · 16 FILES CHANGED",
    files: [
      ["rust/lance-index/src/vector/pairwise.rs", 427, 0],
      ["rust/lance/src/index/vector/dedup.rs", 390, 0],
      ["python/python/tests/test_vector.py", 443, 0],
    ],
    adds: 1795,
    dels: 3,
  },
  // gh pr view 9551: BubbleCal, opened + merged 2026-09-24, 5 commits, 22 files, +3,698 / −585
  fix: {
    number: 9551,
    title: [
      ["perf(vector)!:", null],
      ["score", null],
      ["duplicate", null],
      ["pairs", null],
      ["in", null],
      ["cache-blocked", null],
      ["native", null],
      ["tiles", null],
    ],
    merged: "@BubbleCal merged 5 commits into main from yang/rq-dedup-decoded-cache",
    stats: "5 COMMITS · 22 FILES CHANGED",
    files: [
      ["rust/lance-index/src/vector/bq/pairwise.rs", 659, 0],
      ["rust/lance-index/src/vector/pairwise.rs", 629, 265],
      ["rust/lance-index/src/vector/pq/pairwise.rs", 434, 0],
    ],
    adds: 3698,
    dels: 585,
  },
};

const PAGE = { w: 14.6, h: 6.9, d: 0.34 };
const PAD = 0.75;
const FACE = PAGE.d / 2 + 0.02;



export const PrPage3D: React.FC<{
  pr: PR;
  hops?: Record<string, number>;
  enter?: SceneTransition;
  exit?: SceneTransition;
}> = ({ pr, hops = {}, enter = "fade", exit = "fade" }) => {
  const FILES = pr.files;
  const ADDS = pr.adds;
  const DELS = pr.dels;
  const TITLE = pr.title.map(([w, at]) => [w, hops[w] ?? at] as [string, number | null]);
  const { width, height, fps, durationInFrames } = useVideoConfig();
  const frame = useCurrentFrame();
  const box = useBox();
  const mats = useMaterials();
  const { opacity, transform } = useSceneTransition({ enter, exit });

  const IN = 26;
  const flyIn = interpolate(frame, [0, IN], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.back(1.25)),
  });
  const drift = interpolate(frame, [IN, durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const rig = {
    x: (1 - flyIn) * 11,
    y: 0.35, // lifts the lower file rows clear of the caption band
    z: interpolate(flyIn, [0, 1], [-4.5, 0]) - drift * 0.55,
    yaw: -(1 - flyIn) * 0.8 + interpolate(drift, [0, 1], [0.085, -0.03]),
    tilt: 0.045 - drift * 0.05,
    scale: 1,
  };
  const project = useProjector(rig);

  const at = (a: number, b: number, e = Easing.out(Easing.cubic)) =>
    interpolate(frame, [a, b], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: e,
    });

  const badge = at(IN + 4, IN + 18, Easing.out(Easing.back(2.6)));
  const punch = interpolate(frame, [IN + 4, IN + 9, IN + 30], [0, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });
  const statRow = at(IN + 14, IN + 30);
  const fileIn = (i: number) => at(IN + 26 + i * 6, IN + 26 + i * 6 + 14);
  const bar = at(IN + 34, IN + 34 + fps * 1.1, Easing.inOut(Easing.cubic));

  // Column geometry, in page-local units
  const L = -PAGE.w / 2 + PAD;
  const R = PAGE.w / 2 - PAD;
  const TOP = PAGE.h / 2 - PAD;
  const fileY = (i: number) => TOP - 3.95 - i * 0.7;

  const addFrac = ADDS / (ADDS + DELS);

  return (
    <div
      name={`PR Page #${pr.number}`}
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: "100%",
        height: "100%",
        backgroundColor: LANCE.dark800,
        opacity,
        transform,
        overflow: "hidden",
      }}
    >
      <ThreeCanvas
        width={width}
        height={height}
        camera={{ position: [0, 0, CAMERA.z], fov: CAMERA.fov }}
        gl={{ alpha: true, antialias: true }}
        style={{ position: "absolute", left: 0, top: 0, background: "transparent" }}
      >
        <Lights />
        <group rotation={[rig.tilt, rig.yaw, 0]} position={[rig.x, rig.y, rig.z]}>
          {/* the page */}
          <mesh geometry={box} material={mats.plate} scale={[PAGE.w, PAGE.h, PAGE.d]} />
          {/* the orange spine, same move NameCard and PrCard3D make */}
          <mesh position={[-PAGE.w / 2 + 0.1, 0, 0.005]}>
            <boxGeometry args={[0.2, PAGE.h, PAGE.d + 0.02]} />
            <meshBasicMaterial color={LANCE.orange500} />
          </mesh>
          {/* rule under the header */}
          <mesh position={[0.1, TOP - 2.42, FACE]}>
            <boxGeometry args={[PAGE.w - PAD * 2 - 0.2, 0.025, 0.02]} />
            <meshBasicMaterial color={LANCE.dark500} />
          </mesh>
          {/* rule under the tab row */}
          <mesh position={[0.1, TOP - 3.5, FACE]}>
            <boxGeometry args={[PAGE.w - PAD * 2 - 0.2, 0.02, 0.02]} />
            <meshBasicMaterial color={LANCE.dark600} />
          </mesh>

          {/* MERGED badge — GitHub's purple, recolored to the show's orange */}
          {badge > 0.01 ? (
            <mesh position={[L + 1.32 * badge, TOP - 1.72, FACE + 0.02]}>
              <boxGeometry args={[2.64 * badge, 0.62 * badge, 0.06]} />
              <meshBasicMaterial color={LANCE.orange500} />
            </mesh>
          ) : null}

          {/* diff bar: seven blocks, green/red replaced by orange/dark */}
          {Array.from({ length: 10 }, (_, i) => {
            const on = Math.max(0, Math.min(1, bar * 10 - i));
            if (on <= 0.02) return null;
            const isAdd = i / 10 < addFrac;
            return (
              <mesh
                key={`bar${i}`}
                geometry={box}
                material={isAdd ? mats.done : mats.dim}
                position={[R - 2.6 + i * 0.26, TOP - 3.0, FACE + 0.02]}
                scale={[0.2 * on, 0.2 * on, 0.05]}
              />
            );
          })}

          {/* file rows */}
          {FILES.map((f, i) => {
            const o = fileIn(i);
            if (o <= 0.02) return null;
            return (
              <mesh
                key={`row${i}`}
                geometry={box}
                material={mats.ghost}
                position={[0.1, fileY(i), FACE]}
                scale={[(PAGE.w - PAD * 2 - 0.2) * o, 0.44, 0.03]}
              />
            );
          })}
        </group>
      </ThreeCanvas>

      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <Tag at={project([L, TOP, FACE])} align="left" size={23} track="0.1em" color={LANCE.dark300}>
          lance-format / lance
        </Tag>

        {/* title + number */}
        <div
          style={{
            position: "absolute",
            ...(() => {
              const p = project([L, TOP - 0.95, FACE]);
              return { left: p.left, top: p.top };
            })(),
            transform: "translateY(-50%)",
            fontFamily: AEONIK,
            fontWeight: 500,
            fontSize: 33,
            lineHeight: 1,
            letterSpacing: "-0.02em",
            color: LANCE.offwhite,
            whiteSpace: "nowrap",
            textShadow: chroma(Math.min(7, 1.2 + punch * 6)),
          }}
        >
          {TITLE.map(([w, at], i) => {
            const h = at === null ? 0 : hop(frame - at);
            return (
              <React.Fragment key={i}>
                {i > 0 ? " " : null}
                <span
                  style={{
                    display: "inline-block",
                    transform: `translateY(${(-h * 16).toFixed(2)}px) scale(${(1 + h * 0.1).toFixed(3)})`,
                    transformOrigin: "50% 100%",
                  }}
                >
                  {w}
                </span>
              </React.Fragment>
            );
          })}
        </div>
        <Tag
          at={project([L, TOP - 1.72, FACE])}
          align="left"
          size={30}
          weight={500}
          track="0.04em"
          color={LANCE.dark800}
          opacity={badge}
        >
          &nbsp;&nbsp;✓ MERGED&nbsp;&nbsp;
        </Tag>
        <Tag
          at={project([L + 2.95, TOP - 1.72, FACE])}
          align="left"
          size={25}
          weight={400}
          track="0.02em"
          color={LANCE.dark200}
          opacity={badge}
        >
          {pr.merged}
        </Tag>
        <Tag at={project([R, TOP, FACE])} align="right" size={44} color={LANCE.orange300}>
          #{pr.number}
        </Tag>

        {/* tab row */}
        <Tag
          at={project([L, TOP - 2.95, FACE])}
          align="left"
          size={24}
          track="0.12em"
          color={LANCE.dark300}
          opacity={statRow}
        >
          {pr.stats}
        </Tag>
        <Tag
          at={project([R - 3.0, TOP - 3.0, FACE])}
          align="right"
          size={26}
          weight={500}
          color={LANCE.orange300}
          opacity={bar > 0.02 ? 1 : 0}
        >
          +{ADDS.toLocaleString("en-US")}
        </Tag>
        <Tag
          at={project([R, TOP - 3.0, FACE])}
          align="left"
          size={26}
          weight={500}
          color={LANCE.dark300}
          opacity={bar > 0.02 ? 1 : 0}
          dy={0}
        >
          {"  "}−{DELS.toLocaleString("en-US")}
        </Tag>

        {/* files */}
        {FILES.map((f, i) => {
          const o = fileIn(i);
          if (o <= 0.02) return null;
          return (
            <React.Fragment key={f[0]}>
              <Tag
                at={project([L + 0.2, fileY(i), FACE])}
                align="left"
                size={23}
                weight={400}
                track="0.01em"
                color={LANCE.dark100}
                opacity={o}
              >
                {f[0]}
              </Tag>
              <Tag
                at={project([R - 1.15, fileY(i), FACE])}
                align="right"
                size={22}
                color={LANCE.orange300}
                opacity={o}
              >
                +{f[1]}
              </Tag>
              <Tag
                at={project([R - 0.2, fileY(i), FACE])}
                align="right"
                size={22}
                color={LANCE.dark400}
                opacity={o}
              >
                −{f[2]}
              </Tag>
            </React.Fragment>
          );
        })}
      </div>

      <Fuzz opacity={0.2} />
    </div>
  );
};

export default PrPage3D;
