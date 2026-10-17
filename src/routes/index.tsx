import { createFileRoute, Link } from "@tanstack/react-router";
import { ScanSearch, ScanFace, Users, Fingerprint, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VisionAI Lab – Explore Computer Vision and Face Recognition" },
      { name: "description", content: "Hands-on demos of template matching, Viola–Jones face detection, DeepFace and FaceNet for students." },
      { property: "og:title", content: "VisionAI Lab – Computer Vision Techniques" },
      { property: "og:description", content: "Learn four computer vision techniques with real, interactive demos." },
    ],
  }),
  component: Index,
});

const cards = [
  { to: "/template-matching", icon: ScanSearch, title: "Template Matching", text: "Slide a small patch across an image to find where it fits best." },
  { to: "/viola-jones", icon: ScanFace, title: "Viola–Jones", text: "Classic real-time face detection with Haar features and cascades." },
  { to: "/deepface", icon: Users, title: "DeepFace", text: "Verify whether two photos show the same person with deep models." },
  { to: "/facenet", icon: Fingerprint, title: "FaceNet", text: "Turn faces into 512-number embeddings and measure their distance." },
] as const;

function Index() {
  return (
    <div>
      <section className="py-12 text-center animate-fade-up md:py-20">
        <p className="text-sm font-medium uppercase tracking-widest text-accent">Educational lab</p>
        <h1 className="mt-4 text-5xl font-bold md:text-7xl">VisionAI <span className="text-gradient">Lab</span></h1>
        <p className="mt-4 text-xl text-muted-foreground">Explore Computer Vision and Face Recognition</p>
        <p className="mx-auto mt-6 max-w-2xl text-muted-foreground">
          Computer vision teaches computers to understand images: finding objects, locating faces and telling faces apart.
          Here you can try four landmark techniques on your own images and see exactly what each one does.
        </p>
      </section>

      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c, i) => (
          <div key={c.to} className="glass flex flex-col rounded-2xl p-6 transition hover:-translate-y-1 hover:shadow-glow animate-fade-up" style={{ animationDelay: `${i * 80}ms` }}>
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-primary"><c.icon className="h-5 w-5 text-primary-foreground" /></span>
            <h2 className="mt-4 text-xl font-semibold">{c.title}</h2>
            <p className="mt-2 flex-1 text-sm text-muted-foreground">{c.text}</p>
            <Link to={c.to} className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-accent">Try Demo <ArrowRight className="h-4 w-4" /></Link>
          </div>
        ))}
      </section>

      <section className="mt-16 glass rounded-2xl p-6 md:p-10">
        <h2 className="text-2xl font-bold md:text-3xl">How they differ</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <div><h3 className="font-semibold text-accent">Locate a pattern</h3><p className="mt-2 text-sm text-muted-foreground">Template Matching compares pixels directly. No learning — it only finds near-identical copies.</p></div>
          <div><h3 className="font-semibold text-accent">Find faces</h3><p className="mt-2 text-sm text-muted-foreground">Viola–Jones answers “where are the faces?” but not “who is this?”. Fast, trained with hand-crafted features.</p></div>
          <div><h3 className="font-semibold text-accent">Compare faces</h3><p className="mt-2 text-sm text-muted-foreground">DeepFace and FaceNet use deep neural networks that learn face representations, so two photos of one person end up close together.</p></div>
        </div>
        <Link to="/compare" className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-accent">Full comparison table <ArrowRight className="h-4 w-4" /></Link>
      </section>
    </div>
  );
}
