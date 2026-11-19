import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { Stage, At, Slab, Label, camPath, pop } from "./boldKit";

// scalar index scene v1

export const EvalScene: React.FC = () => {
  const f = useCurrentFrame();
  const cam = camPath(f, [
    [0, { z: -200, rx: -6, ry: -10 }],
    [300, { z: 300, rx: -10, ry: 10 }],
  ]);
  const fade = interpolate(f, [0, 30], [0, 1], { extrapolateRight: "clamp" });
  const rows = Array.from({ length: 8 }, (_, i) => i);
  return (
    <Stage name="Scalar filter" cam={cam}>
      <At p={[0, -420, 0]} o={fade}>
        <div style={{ fontFamily: "Arial", fontSize: 72, color: "#00d4ff", fontWeight: 700 }}>Scalar Index Filtering</div>
      </At>
      <At p={[0, -330, 0]} o={fade}>
        <div style={{ fontFamily: "Arial", fontSize: 28, color: "white" }}>Legend: blue = scanned, green = matched</div>
      </At>
      {rows.map((i) => (
        <At key={i} p={[-300, -220 + i * 70, 0]} s={Math.max(0.01, pop(f, 40 + i * 10))}>
          <Slab w={420} h={56} tone="card" style={{ background: i % 3 === 0 ? "#22c55e" : "#3b82f6" }} />
        </At>
      ))}
      <At p={[320, 0, 0]} s={Math.max(0.01, pop(f, 200))}>
        <Label size={40} color="#a855f7">INDEX</Label>
      </At>
      <At p={[320, 120, 0]} o={fade}>
        <Label size={26}>10x faster!</Label>
      </At>
    </Stage>
  );
};

export default EvalScene;
