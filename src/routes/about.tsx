import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel } from "@/components/lab/shared";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About & Setup – VisionAI Lab" },
      { name: "description", content: "Project information, setup instructions, API reference and responsible-AI notes for VisionAI Lab." },
      { property: "og:title", content: "About & Setup – VisionAI Lab" },
      { property: "og:description", content: "How to run the VisionAI Lab backend locally." },
    ],
  }),
  component: Page,
});

const api = [
  ["POST", "/api/template-matching", "source, template", "score, box, image"],
  ["POST", "/api/viola-jones", "image", "count, boxes, image, time_ms"],
  ["POST", "/api/deepface/verify", "img1, img2, model_name", "verified, distance, threshold"],
  ["POST", "/api/facenet/embeddings", "images[]", "embeddings[{dim, preview}]"],
  ["POST", "/api/facenet/verify", "img1, img2, threshold", "distance, match, previews"],
];

function Page() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Project" title="About VisionAI Lab" intro="An educational lab for college students and beginners. The website is the classroom; a small Python server does the real computer vision." />
      <Panel title="What runs where">
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li><b className="text-success">Works in the browser now:</b> Template Matching (normalized cross-correlation, same maths as OpenCV TM_CCOEFF_NORMED).</li>
          <li><b className="text-accent">Needs the Python backend:</b> OpenCV matchTemplate, Viola–Jones, DeepFace, FaceNet. First run downloads model weights (~600 MB total).</li>
        </ul>
      </Panel>
      <Panel title="Run locally">
        <pre className="overflow-x-auto rounded-xl bg-muted p-4 text-xs">{`cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
# then click "Backend" in the top bar → http://localhost:8000 → Save & test
# frontend: bun install && bun run dev`}</pre>
        <p className="mt-3 text-sm text-muted-foreground">Interactive API docs at <code>http://localhost:8000/docs</code>. Uploads: JPG/PNG/WEBP/BMP, max 8 MB.</p>
      </Panel>
      <Panel title="API" className="overflow-x-auto">
        <table className="w-full min-w-[600px] text-left text-sm">
          <thead><tr>{["Method", "Endpoint", "Form fields", "Returns"].map((h) => <th key={h} className="border-b border-border p-2 text-accent">{h}</th>)}</tr></thead>
          <tbody>{api.map((r) => <tr key={r[1]} className="border-b border-border/50">{r.map((c, i) => <td key={i} className="p-2 font-mono text-xs">{c}</td>)}</tr>)}</tbody>
        </table>
      </Panel>
      <Panel title="Responsible AI & privacy">
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          <li>Images are processed only when you click a button, and only after you confirm consent for face images.</li>
          <li>Nothing is stored: the server decodes images in memory and deletes temporary files immediately.</li>
          <li>Face similarity is a probability. It never proves who someone is.</li>
          <li>This lab does not identify unknown people or connect to any identity database.</li>
          <li>Sample photos are AI-generated and do not depict real people.</li>
        </ul>
      </Panel>
    </div>
  );
}
