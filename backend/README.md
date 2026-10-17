# VisionAI Lab – Python backend

## Setup
```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
Interactive API docs: http://localhost:8000/docs

On first use DeepFace downloads its model weights (~500 MB for VGG-Face) and facenet-pytorch downloads
InceptionResnetV1 (VGGFace2) weights (~100 MB). The first request is therefore slow.

## Frontend
In the web app, open **Settings** (top bar, "Backend") and set the URL to `http://localhost:8000`.

## Endpoints (multipart/form-data)
| Method | Path | Fields | Returns |
|---|---|---|---|
| GET | /api/health | – | `{status}` |
| POST | /api/template-matching | source, template, method? | score, box, image (base64), time_ms |
| POST | /api/viola-jones | image, scale_factor?, min_neighbors? | count, boxes, image, time_ms |
| POST | /api/deepface/verify | img1, img2, model_name? | verified, distance, threshold, model, metric |
| POST | /api/facenet/embeddings | images (multiple) | embeddings[{dim, preview, embedding}] |
| POST | /api/facenet/verify | img1, img2, threshold? (default 1.1) | distance, match, dim, previews |

Validation: JPG/PNG/WEBP/BMP only, max 8 MB. Faces not found → HTTP 422 with a message.

## Privacy
Images are decoded in memory. Temporary files (DeepFace) are deleted in a `finally` block. Nothing is stored or logged.
