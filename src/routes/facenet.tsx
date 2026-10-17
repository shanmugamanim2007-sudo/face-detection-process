import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, Panel, ImageDrop, ActionButton, ErrorBox, Stat, Steps, Consent, BackendNote } from "@/components/lab/shared";
import { postForm } from "@/lib/api";

export const Route = createFileRoute("/facenet")({
  head: () => ({
    meta: [
      { title: "FaceNet Embeddings – VisionAI Lab" },
      { name: "description", content: "Generate real FaceNet embeddings, compute Euclidean distance and learn triplet loss." },
      { property: "og:title", content: "FaceNet Embeddings – VisionAI Lab" },
      { property: "og:description", content: "See faces turned into 512-dimensional vectors." },
    ],
  }),
  component: Page,
});

type R = { distance: number; threshold: number; match: boolean; dim: number; preview1: number[]; preview2: number[]; time_ms: number };

function Page() {
  const [a, setA] = useState<File | null>(null);
  const [b, setB] = useState<File | null>(null);
  const [th, setTh] = useState(1.1);
  const [consent, setConsent] = useState(false);
  const [res, setRes] = useState<R | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const run = async () => {
    if (!a || !b) return;
    setLoading(true); setErr(null); setRes(null);
    try { setRes(await postForm<R>("/api/facenet/verify", { img1: a, img2: b, threshold: String(th) })); }
    catch (e) { setErr((e as Error).message); } finally { setLoading(false); }
  };
  const match = res ? res.distance < th : false;
  return (
    <div>
      <PageHeader eyebrow="Module 4" title="FaceNet" intro="Google's FaceNet maps every face to a point in space. Same person → nearby points. Here we use a pretrained InceptionResnetV1 (VGGFace2)." />
      <Panel>
        <div className="grid gap-6 md:grid-cols-2">
          <ImageDrop label="Face 1" file={a} onFile={setA} sample="/samples/face-a.jpg" />
          <ImageDrop label="Face 2" file={b} onFile={setB} sample="/samples/face-b.jpg" />
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm">Match threshold (Euclidean, L2-normalised): {th.toFixed(2)}
              <input type="range" min={0.6} max={1.4} step={0.05} value={th} onChange={(e) => setTh(+e.target.value)} className="w-full accent-primary" /></label>
            <div className="mt-4 flex flex-wrap gap-2">
              <ActionButton onClick={run} loading={loading} disabled={!a || !b || !consent}>Generate Embeddings</ActionButton>
              <ActionButton variant="ghost" onClick={() => { setA(null); setB(null); setRes(null); setErr(null); }}>Reset</ActionButton>
            </div>
            <div className="mt-3"><BackendNote /></div>
          </div>
          <Consent checked={consent} onChange={setConsent} />
        </div>
      </Panel>
      <div className="mt-6 space-y-6">
        <ErrorBox message={err} />
        {res && (
          <Panel title="Embeddings">
            <div className="grid gap-3 sm:grid-cols-4">
              <Stat label="Dimensions" value={res.dim} />
              <Stat label="Euclidean distance" value={res.distance.toFixed(4)} />
              <Stat label="Result" value={match ? "Match" : "No match"} tone={match ? "good" : "bad"} />
              <Stat label="Time" value={`${res.time_ms} ms`} />
            </div>
            {[res.preview1, res.preview2].map((p, i) => (
              <div key={i} className="mt-4">
                <p className="text-sm text-muted-foreground">Face {i + 1} – first 16 of {res.dim} values</p>
                <div className="mt-2 flex h-16 items-center gap-1">
                  {p.map((v, j) => <div key={j} title={String(v)} className={v >= 0 ? "w-full rounded bg-primary" : "w-full rounded bg-accent"} style={{ height: `${Math.min(100, Math.abs(v) * 600)}%` }} />)}
                </div>
                <code className="mt-1 block truncate text-xs text-muted-foreground">[{p.join(", ")}, …]</code>
              </div>
            ))}
          </Panel>
        )}
        <Panel title="Triplet loss">
          <div className="grid items-center gap-6 md:grid-cols-2">
            <svg viewBox="0 0 300 200" className="w-full">
              <circle cx="90" cy="100" r="60" className="fill-primary/10 stroke-primary" strokeDasharray="4" />
              <circle cx="80" cy="95" r="10" className="fill-primary" /><text x="58" y="80" className="fill-foreground text-[10px]">Anchor</text>
              <circle cx="110" cy="120" r="10" className="fill-success" /><text x="95" y="145" className="fill-foreground text-[10px]">Positive</text>
              <circle cx="240" cy="70" r="10" className="fill-destructive" /><text x="218" y="55" className="fill-foreground text-[10px]">Negative</text>
              <line x1="80" y1="95" x2="110" y2="120" className="stroke-success" strokeWidth="2" />
              <line x1="80" y1="95" x2="240" y2="70" className="stroke-destructive" strokeWidth="2" strokeDasharray="5" />
            </svg>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p><b className="text-foreground">Anchor:</b> a photo of person A.</p>
              <p><b className="text-foreground">Positive:</b> another photo of person A.</p>
              <p><b className="text-foreground">Negative:</b> a photo of person B.</p>
              <p>Training minimises <code>max(‖a−p‖² − ‖a−n‖² + α, 0)</code>: pull the positive closer than the negative by at least a margin α.</p>
            </div>
          </div>
        </Panel>
        <Panel title="Pipeline">
          <Steps items={[
            { t: "MTCNN crop", d: "Detect and crop the face to 160×160 pixels." },
            { t: "Embedding", d: "InceptionResnetV1 outputs a 512-number vector, normalised to length 1." },
            { t: "Distance", d: "Euclidean distance between vectors: 0 = identical, ~1.1 is a typical decision boundary." },
            { t: "Decision", d: "Below the threshold → likely the same person. Adjust the slider to trade false matches against misses." },
          ]} />
        </Panel>
      </div>
    </div>
  );
}
