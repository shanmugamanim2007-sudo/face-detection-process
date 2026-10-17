import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, Panel, ImageDrop, ActionButton, ErrorBox, Stat, Steps, Consent, BackendNote } from "@/components/lab/shared";
import { postForm } from "@/lib/api";

export const Route = createFileRoute("/deepface")({
  head: () => ({
    meta: [
      { title: "DeepFace Face Verification – VisionAI Lab" },
      { name: "description", content: "Compare two face photos with the DeepFace library and see distance and threshold." },
      { property: "og:title", content: "DeepFace Face Verification – VisionAI Lab" },
      { property: "og:description", content: "Real DeepFace verification with clear explanations." },
    ],
  }),
  component: Page,
});

type R = { verified: boolean; distance: number; threshold: number; model: string; metric: string; time_ms: number };
const MODELS = ["VGG-Face", "Facenet512", "ArcFace", "SFace"];

function Page() {
  const [a, setA] = useState<File | null>(null);
  const [b, setB] = useState<File | null>(null);
  const [model, setModel] = useState("VGG-Face");
  const [consent, setConsent] = useState(false);
  const [res, setRes] = useState<R | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const run = async () => {
    if (!a || !b) return;
    setLoading(true); setErr(null); setRes(null);
    try { setRes(await postForm<R>("/api/deepface/verify", { img1: a, img2: b, model_name: model })); }
    catch (e) { setErr((e as Error).message); } finally { setLoading(false); }
  };
  return (
    <div>
      <PageHeader eyebrow="Module 3" title="DeepFace" intro="A Python library wrapping several deep face-recognition models. Give it two photos; it tells you how similar the faces are." />
      <Panel>
        <div className="grid gap-6 md:grid-cols-2">
          <ImageDrop label="Face 1" file={a} onFile={setA} sample="/samples/face-a.jpg" />
          <ImageDrop label="Face 2" file={b} onFile={setB} sample="/samples/face-b.jpg" />
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium">Model
              <select value={model} onChange={(e) => setModel(e.target.value)} className="mt-1 block w-full rounded-lg border border-input bg-muted px-3 py-2">
                {MODELS.map((m) => <option key={m}>{m}</option>)}
              </select></label>
            <div className="mt-4 flex flex-wrap gap-2">
              <ActionButton onClick={run} loading={loading} disabled={!a || !b || !consent}>Compare Faces</ActionButton>
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
          <Panel title="Result">
            <div className="grid gap-3 sm:grid-cols-4">
              <Stat label="Verdict" value={res.verified ? "Likely same" : "Likely different"} tone={res.verified ? "good" : "bad"} />
              <Stat label={`Distance (${res.metric})`} value={res.distance.toFixed(4)} />
              <Stat label="Threshold" value={res.threshold.toFixed(4)} />
              <Stat label="Time" value={`${res.time_ms} ms`} />
            </div>
            <p className="mt-4 text-sm text-muted-foreground">Model: {res.model}. Distance below threshold → “verified”. This is a statistical similarity, not proof of identity.</p>
          </Panel>
        )}
        <Panel title="Pipeline">
          <Steps items={[
            { t: "Detection", d: "Find where the face is in each photo (OpenCV, RetinaFace, MTCNN…)." },
            { t: "Alignment", d: "Rotate and crop so the eyes sit on a horizontal line — every face is compared in the same pose." },
            { t: "Feature extraction", d: "A deep CNN converts the face into a vector of numbers (an embedding)." },
            { t: "Verification", d: "Measure the distance between the two vectors; below the model's threshold means same person." },
          ]} />
        </Panel>
      </div>
    </div>
  );
}
