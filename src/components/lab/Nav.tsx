import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Eye, Menu, Server, X } from "lucide-react";
import { getBackend, setBackend } from "@/lib/api";

const links = [
  { to: "/template-matching", label: "Template Matching" },
  { to: "/viola-jones", label: "Viola–Jones" },
  { to: "/deepface", label: "DeepFace" },
  { to: "/facenet", label: "FaceNet" },
  { to: "/compare", label: "Compare" },
  { to: "/about", label: "About" },
] as const;

export function Nav() {
  const [open, setOpen] = useState(false);
  const [cfg, setCfg] = useState(false);
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<"unknown" | "ok" | "down">("unknown");
  useEffect(() => setUrl(getBackend()), []);
  const check = async () => {
    setBackend(url);
    try {
      const r = await fetch(url.replace(/\/$/, "") + "/api/health");
      setStatus(r.ok ? "ok" : "down");
    } catch { setStatus("down"); }
  };
  return (
    <nav className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary"><Eye className="h-4 w-4 text-primary-foreground" /></span>
          VisionAI <span className="text-gradient">Lab</span>
        </Link>
        <div className="ml-auto hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground" activeProps={{ className: "rounded-lg px-3 py-2 text-sm bg-secondary text-foreground" }}>{l.label}</Link>
          ))}
        </div>
        <button onClick={() => setCfg(!cfg)} className="ml-auto flex items-center gap-1 rounded-lg border border-input px-3 py-2 text-xs lg:ml-2">
          <Server className="h-3.5 w-3.5" /> Backend
        </button>
        <button className="lg:hidden" onClick={() => setOpen(!open)} aria-label="Menu">{open ? <X /> : <Menu />}</button>
      </div>
      {open && (
        <div className="flex flex-col border-t border-border px-4 py-2 lg:hidden">
          {links.map((l) => <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="py-2 text-sm">{l.label}</Link>)}
        </div>
      )}
      {cfg && (
        <div className="border-t border-border px-4 py-3">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 text-sm">
            <span className="text-muted-foreground">Python API URL</span>
            <input value={url} onChange={(e) => setUrl(e.target.value)} className="min-w-64 flex-1 rounded-lg border border-input bg-muted px-3 py-1.5" />
            <button onClick={check} className="rounded-lg bg-gradient-primary px-3 py-1.5 font-semibold text-primary-foreground">Save & test</button>
            {status === "ok" && <span className="text-success">Connected</span>}
            {status === "down" && <span className="text-destructive">Not reachable</span>}
          </div>
        </div>
      )}
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 text-sm text-muted-foreground md:grid-cols-2">
        <div>
          <p className="font-display font-semibold text-foreground">VisionAI Lab</p>
          <p className="mt-2">Built with React, TypeScript, Tailwind CSS, FastAPI, OpenCV, DeepFace and facenet-pytorch.</p>
        </div>
        <div>
          <p className="font-semibold text-foreground">Responsible AI</p>
          <p className="mt-2">Face similarity is a probability, never proof of identity. We do not identify unknown people, store images, or connect to identity databases. Only process faces with consent.</p>
        </div>
      </div>
    </footer>
  );
}
