import { useRef, useState, type ReactNode } from "react";
import { Upload, Loader2, AlertTriangle, ShieldCheck, Download, X } from "lucide-react";
import { validateImage } from "@/lib/api";
import { cn } from "@/lib/utils";

export function PageHeader({ eyebrow, title, intro }: { eyebrow: string; title: string; intro: string }) {
  return (
    <header className="mb-8 animate-fade-up">
      <p className="text-sm font-medium uppercase tracking-widest text-accent">{eyebrow}</p>
      <h1 className="mt-2 text-3xl font-bold md:text-5xl">{title}</h1>
      <p className="mt-3 max-w-3xl text-muted-foreground">{intro}</p>
    </header>
  );
}

export function Panel({ title, children, className }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <section className={cn("glass rounded-2xl p-5 md:p-6", className)}>
      {title && <h2 className="mb-4 text-lg font-semibold">{title}</h2>}
      {children}
    </section>
  );
}

export function ImageDrop({
  label, file, onFile, sample,
}: { label: string; file: File | null; onFile: (f: File | null) => void; sample?: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const [err, setErr] = useState<string | null>(null);
  const url = file ? URL.createObjectURL(file) : null;
  const pick = (f?: File) => {
    if (!f) return;
    const e = validateImage(f);
    setErr(e);
    if (!e) onFile(f);
  };
  const loadSample = async () => {
    if (!sample) return;
    const b = await (await fetch(sample)).blob();
    pick(new File([b], "sample.jpg", { type: b.type || "image/jpeg" }));
  };
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <div className="flex gap-3">
          {sample && <button onClick={loadSample} className="text-accent hover:underline">Use sample</button>}
          {file && <button onClick={() => onFile(null)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>}
        </div>
      </div>
      <button
        onClick={() => ref.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); pick(e.dataTransfer.files[0]); }}
        className="flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-input bg-muted/40 transition hover:border-primary"
      >
        {url ? <img src={url} alt={label} className="h-full w-full object-contain" /> : (
          <span className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
            <Upload className="h-6 w-6" /> Click or drop an image
          </span>
        )}
      </button>
      <input ref={ref} type="file" accept="image/jpeg,image/png,image/webp,image/bmp" hidden onChange={(e) => pick(e.target.files?.[0])} />
      {err && <p className="mt-2 text-sm text-destructive">{err}</p>}
    </div>
  );
}

export function ActionButton({ onClick, loading, disabled, children, variant = "primary" }: {
  onClick: () => void; loading?: boolean; disabled?: boolean; children: ReactNode; variant?: "primary" | "ghost";
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition disabled:opacity-50",
        variant === "primary" ? "bg-gradient-primary text-primary-foreground shadow-glow hover:brightness-110" : "border border-input hover:bg-secondary",
      )}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

export function ErrorBox({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="flex gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm">
      <AlertTriangle className="h-5 w-5 shrink-0 text-destructive" />
      <p>{message}</p>
    </div>
  );
}

export function Consent({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer gap-3 rounded-xl border border-accent/30 bg-accent/5 p-4 text-sm">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 accent-primary" />
      <span>
        <ShieldCheck className="mr-1 inline h-4 w-4 text-accent" />
        I have consent from every person shown to process these facial images. Images are processed only when I click, and are not stored.
      </span>
    </label>
  );
}

export function Stat({ label, value, tone }: { label: string; value: ReactNode; tone?: "good" | "bad" }) {
  return (
    <div className="rounded-xl bg-muted/50 p-4">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={cn("mt-1 text-2xl font-bold font-display", tone === "good" && "text-success", tone === "bad" && "text-destructive")}>{value}</p>
    </div>
  );
}

export function DownloadLink({ href, name }: { href: string; name: string }) {
  return (
    <a href={href} download={name} className="inline-flex items-center gap-2 text-sm text-accent hover:underline">
      <Download className="h-4 w-4" /> Download result
    </a>
  );
}

export function Steps({ items }: { items: { t: string; d: string }[] }) {
  return (
    <ol className="grid gap-4 sm:grid-cols-2">
      {items.map((s, i) => (
        <li key={s.t} className="rounded-xl bg-muted/40 p-4">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-primary text-xs font-bold text-primary-foreground">{i + 1}</span>
          <h3 className="mt-3 font-semibold">{s.t}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
        </li>
      ))}
    </ol>
  );
}

export function BackendNote() {
  return (
    <p className="text-xs text-muted-foreground">
      Runs on the Python backend (see <code>backend/README.md</code>). Set its address via “Backend” in the top bar.
    </p>
  );
}
