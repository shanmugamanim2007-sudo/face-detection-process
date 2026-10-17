import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, Panel, ImageDrop, ActionButton, ErrorBox, Stat, DownloadLink, Steps, Consent, BackendNote } from "@/components/lab/shared";
import { postForm } from "@/lib/api";

export const Route = createFileRoute("/viola-jones")({
  head: () => ({
    meta: [
      { title: "Viola–Jones Face Detection – VisionAI Lab" },
      { name: "description", content: "Detect faces with OpenCV's Haar cascade and learn Haar features, integral images, AdaBoost and cascades." },
      { property: "og:title", content: "Viola–Jones Face Detection – VisionAI Lab" },
      { property: "og:description", content: "Real Haar-cascade face detection on your own photos." },
    ],
  }),
  component: Page,
});

type R = { count: number; boxes: { x: number; y: number; w: number; h: number }[]; image: string; time_ms: number };

function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [consent, setConsent] = useState(false);
  const [scale, setScale] = useState(1.1);
  const [neighbors, setNeighbors] = useState(5);
  const [res, setRes] = useState<R | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const run = async () => {
    if (!file) return;
    setLoading(true); setErr(null); setRes(null);
    try { setRes(await postForm<R>("/api/viola-jones", { image: file, scale_factor: String(scale), min_neighbors: String(neighbors) })); }
    catch (e) { setErr((e as Error).message); } finally { setLoading(false); }
  };
  return (
    <div>
      <PageHeader eyebrow="Module 2" title="Viola–Jones Face Detection" intro="The 2001 algorithm that made real-time face detection possible — still built into OpenCV." />
      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="Upload" className="lg:col-span-2">
          <ImageDrop label="Image with faces" file={file} onFile={(f) => { setFile(f); setRes(null); }} sample="/samples/group.jpg" />
        </Panel>
        <Panel title="Settings">
          <label className="block text-sm">Scale factor: {scale.toFixed(2)}
            <input type="range" min={1.05} max={1.5} step={0.05} value={scale} onChange={(e) => setScale(+e.target.value)} className="w-full accent-primary" /></label>
          <label className="mt-3 block text-sm">Min neighbors: {neighbors}
            <input type="range" min={1} max={10} value={neighbors} onChange={(e) => setNeighbors(+e.target.value)} className="w-full accent-primary" /></label>
          <div className="mt-4"><Consent checked={consent} onChange={setConsent} /></div>
          <div className="mt-4 flex flex-wrap gap-2">
            <ActionButton onClick={run} loading={loading} disabled={!file || !consent}>Detect Faces</ActionButton>
            <ActionButton variant="ghost" onClick={() => { setFile(null); setRes(null); setErr(null); }}>Reset</ActionButton>
          </div>
          <div className="mt-3"><BackendNote /></div>
        </Panel>
      </div>
      <div className="mt-6 space-y-6">
        <ErrorBox message={err} />
        {res && (
          <Panel title="Result">
            <div className="mb-4 grid gap-3 sm:grid-cols-2">
              <Stat label="Faces detected" value={res.count} tone={res.count ? "good" : "bad"} />
              <Stat label="Processing time" value={`${res.time_ms} ms`} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <img src={URL.createObjectURL(file!)} alt="Before" className="rounded-xl" />
              <img src={res.image} alt="Detected faces" className="rounded-xl" />
            </div>
            <div className="mt-3 text-right"><DownloadLink href={res.image} name="faces.png" /></div>
          </Panel>
        )}
        <Panel title="The four building blocks">
          <Steps items={[
            { t: "Haar-like features", d: "Simple black-and-white rectangle patterns, e.g. the eye region is darker than the cheeks below it." },
            { t: "Integral image", d: "A running-sum table that lets the sum of any rectangle be computed with just 4 lookups — very fast." },
            { t: "AdaBoost", d: "Picks the few hundred most useful features from 160,000+ candidates and combines weak classifiers into a strong one." },
            { t: "Cascade classifier", d: "Stages of increasing strictness. Most non-face windows are rejected in the first stages, so the detector stays fast." },
          ]} />
        </Panel>
      </div>
    </div>
  );
}
