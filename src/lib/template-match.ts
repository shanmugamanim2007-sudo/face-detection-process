/** In-browser normalized cross-correlation (equivalent to OpenCV TM_CCOEFF_NORMED). */
export function toGray(img: ImageData): Float32Array {
  const g = new Float32Array(img.width * img.height);
  for (let i = 0; i < g.length; i++) {
    const d = img.data;
    g[i] = 0.299 * d[i * 4]! + 0.587 * d[i * 4 + 1]! + 0.114 * d[i * 4 + 2]!;
  }
  return g;
}

export function matchTemplate(
  src: Float32Array, sw: number, sh: number,
  tpl: Float32Array, tw: number, th: number,
): { x: number; y: number; score: number } {
  const n = tw * th;
  let tMean = 0;
  for (let i = 0; i < n; i++) tMean += tpl[i]!;
  tMean /= n;
  const tz = new Float32Array(n);
  let tNorm = 0;
  for (let i = 0; i < n; i++) { const z = tpl[i]! - tMean; tz[i] = z; tNorm += z * z; }
  tNorm = Math.sqrt(tNorm);
  let best = { x: 0, y: 0, score: -Infinity };
  for (let y = 0; y <= sh - th; y++) {
    for (let x = 0; x <= sw - tw; x++) {
      let sum = 0, sum2 = 0, cross = 0;
      for (let j = 0; j < th; j++) {
        const row = (y + j) * sw + x, trow = j * tw;
        for (let i = 0; i < tw; i++) {
          const v = src[row + i]!;
          sum += v; sum2 += v * v; cross += v * tz[trow + i]!;
        }
      }
      const varS = sum2 - (sum * sum) / n;
      const denom = Math.sqrt(Math.max(varS, 1e-6)) * tNorm;
      const score = denom > 0 ? cross / denom : 0;
      if (score > best.score) best = { x, y, score };
    }
  }
  return best;
}
