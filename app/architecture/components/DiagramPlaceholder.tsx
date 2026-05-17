interface DiagramPlaceholderProps {
  title: string;
  badge: string;
  description: string;
}

export default function DiagramPlaceholder({ title, badge, description }: DiagramPlaceholderProps) {
  return (
    <div className="border border-border rounded-2xl overflow-hidden">
      <div className="px-6 py-5 border-b border-border flex items-center justify-between">
        <div>
          <span className="inline-block text-xs font-semibold text-brown bg-brown/10 px-2.5 py-1 rounded-full mb-2">
            {badge}
          </span>
          <h2 className="text-xl font-black text-brown tracking-tight">{title}</h2>
          <p className="text-sm text-muted mt-1">{description}</p>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center gap-3 py-24 bg-gray-50/50">
        <div className="text-3xl text-border">⬡</div>
        <p className="text-sm font-semibold text-muted">Diagram coming soon</p>
        <p className="text-xs text-muted/70">SVG architecture diagram will be added here</p>
      </div>
    </div>
  );
}
