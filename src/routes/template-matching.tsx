import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { PageHeader, Panel, ImageDrop, ActionButton, ErrorBox, Stat, DownloadLink, Steps } from "@/components/lab/shared";
import { postForm } from "@/lib/api";
import { matchTemplate, toGray } from "@/lib/template-match";

export const Route = createFileRoute("/template-matching")({
  head: () => ({
    meta: [
      { title: "Template Matching Demo – VisionAI Lab" },
      { name: "description", content: "Find a template inside an image using normalized cross-correlation (OpenCV matchTemplate)." },
      { property: "og:title", content: "Template Matching Demo – VisionAI Lab" },
      { property: "og:description", content: "Upload an image, select a region and watch it get located." },
    ],
  }),
  component: Page,
});

type Box = { x: number; y: number; w: number; h: number };
type Result = { score: number; box: Box; image: string; time_ms: number; engine: string };

function loadImg(f: File): Promise<HTMLImageElement> {
  return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = URL.createObjectURL(f); });
}

function Page() {
  const [source, setSource] = useState<File | null>(null);
  const [template, setTemplate] = useState<File | null>(null);
  const [engine, setEngine] = useState<"browser" | "opencv">("browser");
  const [sel, setSel] = useState<Box | null>(null);
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const srcUrl = source ? URL.createObjectURL(source) : null;

  useEffect(() => { setResult(null); setSel(null); }, [source]);

  const pt = (e: React.MouseEvent) => {
    const r = imgRef.current!.getBoundingClientRect();
    const s = imgRef.current!.naturalWidth / r.width;
    return { x: Math.round((e.clientX - r.left) * s), y: Math.round((e.clientY - r.top) * s) };
  };
  const finishSelect = async () => {
    setDrag(null);
    if (!sel || sel.w < 8 || sel.h < 8 || !imgRef.current) return;
    const c = document.createElement("canvas"); c.width = sel.w; c.height = sel.h;
    c.getContext("2d")!.drawImage(imgRef.current, sel.x, sel.y, sel.w, sel.h, 0, 0, sel.w, sel.h);
    c.toBlob((b) => b && setTemplate(new File([b], "template.png", { type: "image/png" })), "image/png");
  };

  const run = async () => {
    if (!source || !template) return;
    setLoading(true); setErr(null); setResult(null);
    try {
      if (engine === "opencv") {
        const r = await postForm<Omit<Result, "engine">>("/api/template-matching", { source, template });
        setResult({ ...r, engine: "OpenCV matchTemplate (Python)" });
      } else {
        const t0 = performance.now();
        const [si, ti] = await Promise.all([loadImg(source), loadImg(template)]);
        // downscale for speed; results mapped back to full size
        const scale = Math.min(1, 320 / Math.max(si.width, si.height));
        const sw = Math.round(si.width * scale), sh = Math.round(si.height * scale);
        const tw = Math.max(2, Math.round(ti.width * scale)), th = Math.max(2, Math.round(ti.height * scale));
        if (tw > sw || th > sh) throw new Error("Template must be smaller than the source image.");
        const c = document.createElement("canvas"); const ctx = c.getContext("2d")!;
        c.width = sw; c.height = sh; ctx.drawImage(si, 0, 0, sw, sh); const sd = ctx.getImageData(0, 0, sw, sh);
        c.width = tw; c.height = th; ctx.drawImage(ti, 0, 0, tw, th); const td = ctx.getImageData(0, 0, tw, th);
        await new Promise((r) => setTimeout(r, 20));
        const m = matchTemplate(toGray(sd), sw, sh, toGray(td), tw, th);
        const box = { x: Math.round(m.x / scale), y: Math.round(m.y / scale), w: ti.width, h: ti.height };
        c.width = si.width; c.height = si.height; ctx.drawImage(si, 0, 0);
        ctx.strokeStyle = "#ff50b4"; ctx.lineWidth = Math.max(3, si.width / 200); ctx.strokeRect(box.x, box.y, box.w, box.h);
        setResult({ score: m.score, box, image: c.toDataURL("image/png"), time_ms: Math.round(performance.now() - t0), engine: "Browser NCC (TM_CCOEFF_NORMED)" });
      }
    } catch (e) { setErr((e as Error).message); } finally { setLoading(false); }
  };

  const reset = () => { setSource(null); setTemplate(null); setResult(null); setErr(null); setSel(null); };

  return (
    <div>
      <PageHeader eyebrow="Module 1" title="Template Matching" intro="Give the computer a small picture (the template) and it searches a larger image for the spot that looks most alike." />
      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="1. Source image" className="lg:col-span-2">
          {srcUrl ? (
            <div className="relative select-none" onMouseDown={(e) => { const p = pt(e); setDrag(p); setSel({ ...p, w: 0, h: 0 }); }}
              onMouseMove={(e) => { if (!drag) return; const p = pt(e); setSel({ x: Math.min(p.x, drag.x), y: Math.min(p.y, drag.y), w: Math.abs(p.x - drag.x), h: Math.abs(p.y - drag.y) }); }}
              onMouseUp={finishSelect}>
              <img ref={imgRef} src={srcUrl} alt="Source" draggable={false} className="w-full rounded-xl" />
              {sel && imgRef.current && (() => {
                const k = imgRef.current.clientWidth / imgRef.current.naturalWidth;
                return <div className="pointer-events-none absolute border-2 border-accent bg-accent/20" style={{ left: sel.x * k, top: sel.y * k, width: sel.w * k, height: sel.h * k }} />;
              })()}
              <p className="mt-2 text-xs text-muted-foreground">Tip: drag on the image to select a region as the template.</p>
            </div>
          ) : <ImageDrop label="Upload source" file={source} onFile={setSource} sample="/samples/group.jpg" />}
        </Panel>
        <Panel title="2. Template">
          <ImageDrop label="Upload or select on the left" file={template} onFile={setTemplate} />
          <div className="mt-4 space-y-2 text-sm">
            <p className="font-medium">Engine</p>
            <label className="flex gap-2"><input type="radio" checked={engine === "browser"} onChange={() => setEngine("browser")} className="accent-primary" /> In browser (works anywhere)</label>
            <label className="flex gap-2"><input type="radio" checked={engine === "opencv"} onChange={() => setEngine("opencv")} className="accent-primary" /> OpenCV matchTemplate (Python backend)</label>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <ActionButton onClick={run} loading={loading} disabled={!source || !template}>Run Template Matching</ActionButton>
            <ActionButton variant="ghost" onClick={reset}>Reset</ActionButton>
          </div>
        </Panel>
      </div>
      <div className="mt-6 space-y-6">
        <ErrorBox message={err} />
        {result && (
          <Panel title="Result">
            <div className="mb-4 grid gap-3 sm:grid-cols-3">
              <Stat label="Similarity score" value={result.score.toFixed(3)} tone={result.score > 0.8 ? "good" : undefined} />
              <Stat label="Location" value={`${result.box.x}, ${result.box.y}`} />
              <Stat label="Time" value={`${result.time_ms} ms`} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div><p className="mb-2 text-sm text-muted-foreground">Before</p><img src={srcUrl!} alt="Before" className="rounded-xl" /></div>
              <div><p className="mb-2 text-sm text-muted-foreground">After</p><img src={result.image} alt="Matched" className="rounded-xl" /></div>
            </div>
            <div className="mt-3 flex justify-between text-xs text-muted-foreground"><span>{result.engine}</span><DownloadLink href={result.image} name="template-match.png" /></div>
          </Panel>
        )}
        <Panel title="How it works">
          <Steps items={[
            { t: "Slide", d: "The template is placed at every (x, y) position of the source image, like a window sliding across it." },
            { t: "Compare", d: "At each position the overlapping pixels are compared. Normalized cross-correlation gives 1.0 for a perfect match." },
            { t: "Score map", d: "All scores form a map; the brightest point marks the best location." },
            { t: "Limits", d: "It fails when the object is rotated, resized or lit differently, because it compares raw pixels." },
          ]} />
        </Panel>
      </div>
    </div>
  );
}
