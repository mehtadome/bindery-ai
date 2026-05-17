import Link from "next/link";

export default function Navbar() {
  return (
    <header className="fixed top-4 left-0 right-0 z-50 px-6">
      <div className="max-w-6xl mx-auto">
        <nav className="flex items-center justify-between px-6 py-3 bg-white border border-border rounded-2xl shadow-sm">
          <Link href="/" className="flex items-center gap-1">
            <span className="text-lg font-black tracking-tight text-foreground">Bindery</span>
            <span className="text-lg font-black tracking-tight text-brown">AI</span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted">
            <Link href="/architecture" className="hover:text-foreground transition-colors">
              Architecture
            </Link>
            <Link href="/portal" className="hover:text-foreground transition-colors">
              Portal
            </Link>
          </div>

          <Link
            href="/portal"
            className="flex items-center gap-1.5 bg-red text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-red-dark transition-colors"
          >
            Open Portal
            <span aria-hidden>→</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
