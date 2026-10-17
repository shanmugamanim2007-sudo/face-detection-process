"""VisionAI Lab backend - FastAPI + OpenCV + DeepFace + FaceNet.

Run:  uvicorn main:app --reload --port 8000
Docs: http://localhost:8000/docs
Images are processed in memory / temp files and deleted immediately. Nothing is stored.
"""
import base64
import os
import tempfile
import time
from typing import List, Optional

import cv2
import numpy as np
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

MAX_BYTES = 8 * 1024 * 1024
ALLOWED = {"image/jpeg", "image/png", "image/webp", "image/bmp"}

app = FastAPI(title="VisionAI Lab API", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])


async def read_image(f: UploadFile) -> np.ndarray:
    if f.content_type not in ALLOWED:
        raise HTTPException(400, f"Unsupported file type: {f.content_type}. Use JPG, PNG, WEBP or BMP.")
    data = await f.read()
    if len(data) > MAX_BYTES:
        raise HTTPException(413, "Image larger than 8 MB.")
    img = cv2.imdecode(np.frombuffer(data, np.uint8), cv2.IMREAD_COLOR)
    if img is None:
        raise HTTPException(400, "Could not decode image.")
    return img


def to_b64(img: np.ndarray) -> str:
    ok, buf = cv2.imencode(".png", img)
    return "data:image/png;base64," + base64.b64encode(buf).decode()


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.post("/api/template-matching")
async def template_matching(source: UploadFile = File(...), template: UploadFile = File(...),
                            method: str = Form("TM_CCOEFF_NORMED")):
    t0 = time.perf_counter()
    src, tpl = await read_image(source), await read_image(template)
    if tpl.shape[0] > src.shape[0] or tpl.shape[1] > src.shape[1]:
        raise HTTPException(400, "Template must be smaller than the source image.")
    m = getattr(cv2, method, cv2.TM_CCOEFF_NORMED)
    res = cv2.matchTemplate(cv2.cvtColor(src, cv2.COLOR_BGR2GRAY), cv2.cvtColor(tpl, cv2.COLOR_BGR2GRAY), m)
    min_v, max_v, min_l, max_l = cv2.minMaxLoc(res)
    loc, score = (min_l, min_v) if m in (cv2.TM_SQDIFF, cv2.TM_SQDIFF_NORMED) else (max_l, max_v)
    h, w = tpl.shape[:2]
    out = src.copy()
    cv2.rectangle(out, loc, (loc[0] + w, loc[1] + h), (255, 80, 180), 3)
    return {"score": float(score), "method": method,
            "box": {"x": int(loc[0]), "y": int(loc[1]), "w": int(w), "h": int(h)},
            "image": to_b64(out), "time_ms": round((time.perf_counter() - t0) * 1000, 1)}


CASCADE = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")


@app.post("/api/viola-jones")
async def viola_jones(image: UploadFile = File(...), scale_factor: float = Form(1.1), min_neighbors: int = Form(5)):
    t0 = time.perf_counter()
    img = await read_image(image)
    gray = cv2.equalizeHist(cv2.cvtColor(img, cv2.COLOR_BGR2GRAY))
    faces = CASCADE.detectMultiScale(gray, scaleFactor=scale_factor, minNeighbors=min_neighbors, minSize=(30, 30))
    out = img.copy()
    boxes = []
    for (x, y, w, h) in faces:
        cv2.rectangle(out, (x, y), (x + w, y + h), (80, 255, 120), 3)
        boxes.append({"x": int(x), "y": int(y), "w": int(w), "h": int(h)})
    return {"count": len(boxes), "boxes": boxes, "image": to_b64(out),
            "time_ms": round((time.perf_counter() - t0) * 1000, 1)}


def _tmp(img: np.ndarray) -> str:
    fd, path = tempfile.mkstemp(suffix=".png")
    os.close(fd)
    cv2.imwrite(path, img)
    return path


@app.post("/api/deepface/verify")
async def deepface_verify(img1: UploadFile = File(...), img2: UploadFile = File(...),
                          model_name: str = Form("VGG-Face")):
    from deepface import DeepFace
    t0 = time.perf_counter()
    a, b = await read_image(img1), await read_image(img2)
    p1, p2 = _tmp(a), _tmp(b)
    try:
        r = DeepFace.verify(p1, p2, model_name=model_name, enforce_detection=True)
    except ValueError as e:
        raise HTTPException(422, f"Face could not be detected in one of the images. ({e})")
    finally:
        os.remove(p1); os.remove(p2)
    return {"verified": bool(r["verified"]), "distance": float(r["distance"]),
            "threshold": float(r["threshold"]), "model": r["model"],
            "metric": r.get("distance_metric"), "time_ms": round((time.perf_counter() - t0) * 1000, 1)}


_facenet = {}


def facenet_models():
    if not _facenet:
        from facenet_pytorch import MTCNN, InceptionResnetV1
        _facenet["mtcnn"] = MTCNN(image_size=160, margin=10)
        _facenet["net"] = InceptionResnetV1(pretrained="vggface2").eval()
    return _facenet["mtcnn"], _facenet["net"]


def embed(img: np.ndarray) -> np.ndarray:
    import torch
    from PIL import Image
    mtcnn, net = facenet_models()
    face = mtcnn(Image.fromarray(cv2.cvtColor(img, cv2.COLOR_BGR2RGB)))
    if face is None:
        raise HTTPException(422, "No face detected for FaceNet embedding.")
    with torch.no_grad():
        return net(face.unsqueeze(0))[0].numpy()  # 512-d, L2-normalised


@app.post("/api/facenet/embeddings")
async def facenet_embeddings(images: List[UploadFile] = File(...)):
    t0 = time.perf_counter()
    out = []
    for f in images:
        e = embed(await read_image(f))
        out.append({"dim": int(e.shape[0]), "preview": [round(float(v), 4) for v in e[:16]], "embedding": e.tolist()})
    return {"embeddings": out, "time_ms": round((time.perf_counter() - t0) * 1000, 1)}


@app.post("/api/facenet/verify")
async def facenet_verify(img1: UploadFile = File(...), img2: UploadFile = File(...), threshold: float = Form(1.1)):
    t0 = time.perf_counter()
    e1, e2 = embed(await read_image(img1)), embed(await read_image(img2))
    d = float(np.linalg.norm(e1 - e2))
    return {"distance": d, "threshold": threshold, "match": d < threshold, "dim": int(e1.shape[0]),
            "preview1": [round(float(v), 4) for v in e1[:16]], "preview2": [round(float(v), 4) for v in e2[:16]],
            "time_ms": round((time.perf_counter() - t0) * 1000, 1)}
