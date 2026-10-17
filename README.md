# VisionAI Lab

An educational computer-vision playground: try template matching, face detection and face
verification right in the browser, and see the maths behind each result.

## 🚀 Live Demo

VISIONLAB — Live Websitehttps://lovable.dev/projects/52ad0a3a-8458-467a-b88f-7006c43d63e9

> Open the link, pick a demo from the top bar and click a sample photo — no install needed.
> Template Matching runs completely in the browser. The face demos (Viola–Jones, DeepFace,
> FaceNet) need the Python backend running locally — see below.

Once the app is published from the Publish button, the same demo is served from a permanent
public address: **https://face-detection-processing.**

| Demo | Route | Runs |
|---|---|---|
| Home / overview | `/` | browser |
| Template Matching | `/template-matching` | browser (NCC) or backend (OpenCV) |
| Viola–Jones face detection | `/viola-jones` | backend |
| DeepFace verification | `/deepface` | backend |
| FaceNet embeddings & verify | `/facenet` | backend |
| Side-by-side comparison | `/compare` | backend |
| About & setup | `/about` | browser |

## ✨ Features

- **Template Matching** — drag a box over any part of an image, the app finds every match and
  shows the score, the box and a heatmap of the search.
- **Viola–Jones** — classic Haar-cascade face detection with adjustable scale factor and
  neighbour threshold.
- **DeepFace** — verify two photos against VGG-Face, FaceNet, ArcFace and more, with the
  distance-vs-threshold decision made visible.
- **FaceNet** — export 512-d embeddings, compare them by cosine/euclidean distance.
- **Compare** — run the same pair of photos through several models at once.
- Consent gates on every face demo, clear errors when no face is found, and nothing is stored.

## 🛠 Quick start (frontend)

```sh
bun install     # or: npm install
bun run dev     # or: npm run dev
```

Then open the printed local URL.

## 🐍 Python backend (needed for the face demos)

```sh
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Interactive API docs: http://localhost:8000/docs

In the web app, click **Backend** in the top bar, set the URL to `http://localhost:8000`
and press **Save & test**.

First run downloads model weights (DeepFace VGG-Face ~500 MB, FaceNet InceptionResnetV1
~100 MB), so the first request is slow. Uploads accept JPG/PNG/WEBP/BMP up to 8 MB.

## 📡 API

| Method | Path | Fields | Returns |
|---|---|---|---|
| GET | `/api/health` | – | `{status}` |
| POST | `/api/template-matching` | source, template, method? | score, box, image, time_ms |
| POST | `/api/viola-jones` | image, scale_factor?, min_neighbors? | count, boxes, image, time_ms |
| POST | `/api/deepface/verify` | img1, img2, model_name? | verified, distance, threshold, model, metric |
| POST | `/api/facenet/embeddings` | images (multiple) | embeddings[{dim, preview, embedding}] |
| POST | `/api/facenet/verify` | img1, img2, threshold? | distance, match, dim, previews |

## 🧪 Tests

```sh
bun run test      # vitest
bun run lint
```

## 🔒 Privacy & responsible AI

- Images are processed only when you click a button, and only after you confirm consent for
  face photos.
- Nothing is stored or logged: the server decodes images in memory and deletes temporary
  files immediately.
- Face similarity is a probability — it never proves who someone is.
- This lab does not identify unknown people or connect to any identity database.
- Sample photos in `public/samples/` are AI-generated and do not depict real people.

## 🧱 Built with

TanStack Start (React 19) · TypeScript · Tailwind CSS v4 · FastAPI · OpenCV · DeepFace ·
facenet-pytorch

---

