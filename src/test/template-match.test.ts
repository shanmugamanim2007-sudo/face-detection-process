import { describe, expect, it } from "vitest";
import { matchTemplate } from "@/lib/template-match";

describe("template matching", () => {
  it("finds the exact location of a cropped patch with score ~1", () => {
    const w = 20, h = 15;
    const src = new Float32Array(w * h).map((_, i) => Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 255);
    const tw = 4, th = 3, tx = 9, ty = 6;
    const tpl = new Float32Array(tw * th);
    for (let j = 0; j < th; j++) for (let i = 0; i < tw; i++) tpl[j * tw + i] = src[(ty + j) * w + tx + i]!;
    const r = matchTemplate(src, w, h, tpl, tw, th);
    expect(r.x).toBe(tx);
    expect(r.y).toBe(ty);
    expect(r.score).toBeGreaterThan(0.999);
  });
});
