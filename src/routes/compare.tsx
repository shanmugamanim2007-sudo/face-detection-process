import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel } from "@/components/lab/shared";

export const Route = createFileRoute("/compare")({
  head: () => ({
    meta: [
      { title: "Compare Techniques – VisionAI Lab" },
      { name: "description", content: "Side-by-side comparison of template matching, Viola–Jones, DeepFace and FaceNet." },
      { property: "og:title", content: "Compare Techniques – VisionAI Lab" },
      { property: "og:description", content: "Purpose, algorithm, inputs, outputs, pros and cons of four CV techniques." },
    ],
  }),
  component: Page,
});

const cols = ["Technique", "Main purpose", "Core algorithm", "Input", "Output", "Advantages", "Limitations", "Real-world applications"];
const rows = [
  ["Template Matching", "Locate a known pattern", "Sliding window + cross-correlation", "Image + template", "Best location, score", "Simple, no training", "Fails with scale, rotation, lighting changes", "PCB inspection, game bots, logo spotting"],
  ["Viola–Jones", "Detect faces", "Haar features, integral image, AdaBoost, cascade", "Grayscale image", "Face bounding boxes", "Very fast, runs on CPU", "Frontal faces only, false positives", "Camera autofocus, webcams, counting people"],
  ["DeepFace", "Verify / analyse faces", "Deep CNNs (VGG-Face, ArcFace, …)", "Two face images", "Verified flag, distance, threshold", "Many models in one library, accurate", "Heavy downloads, bias risks", "Photo apps, access control (with consent)"],
  ["FaceNet", "Face embeddings for verification & clustering", "Inception CNN trained with triplet loss", "Face image", "512-d embedding, distance", "Compact vectors, reusable for search", "Needs good crops; threshold tuning", "Photo grouping, attendance systems"],
];

function Page() {
  return (
    <div>
      <PageHeader eyebrow="Comparison" title="Four techniques, side by side" intro="Template Matching locates patterns. Viola–Jones detects faces. DeepFace and FaceNet verify or recognise faces using learned facial representations." />
      <Panel className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead><tr>{cols.map((c) => <th key={c} className="border-b border-border p-3 font-display text-accent">{c}</th>)}</tr></thead>
          <tbody>{rows.map((r) => <tr key={r[0]} className="border-b border-border/50 align-top">{r.map((c, i) => <td key={i} className={i === 0 ? "p-3 font-semibold" : "p-3 text-muted-foreground"}>{c}</td>)}</tr>)}</tbody>
        </table>
      </Panel>
    </div>
  );
}
