import Link from "next/link";

export default function ArchTopBar() {
  return (
    <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-border px-6 py-3 flex items-center justify-between">
      <Link
        href="/"
        className="text-xs font-semibold text-muted hover:text-foreground transition-colors flex items-center gap-1"
      >
        ← Home
      </Link>
      <div className="flex items-center gap-1.5">
        <span className="text-sm font-black text-foreground tracking-tight">Bindery</span>
        <span className="text-sm font-black text-brown tracking-tight">AI</span>
        <span className="text-muted mx-1">·</span>
        <span className="text-sm font-semibold text-muted">Architecture</span>
      </div>
      <Link
        href="/portal"
        className="text-xs font-semibold bg-red text-white px-3 py-1.5 rounded-full hover:bg-red-dark transition-colors"
      >
        Open portal →
      </Link>
    </div>
  );
}
