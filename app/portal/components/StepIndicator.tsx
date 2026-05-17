import type { Step } from "@/app/types";

const STEPS: { key: Step; label: string }[] = [
  { key: "upload", label: "Upload" },
  { key: "run", label: "Run" },
  { key: "results", label: "Results" },
];

const ORDER: Step[] = ["upload", "run", "results"];

interface StepIndicatorProps {
  current: Step;
}

export default function StepIndicator({ current }: StepIndicatorProps) {
  const currentIdx = ORDER.indexOf(current);

  return (
    <div className="flex items-center gap-0">
      {STEPS.map(({ key, label }, i) => {
        const isDone = ORDER.indexOf(key) < currentIdx;
        const isActive = key === current;

        return (
          <div key={key} className="flex items-center">
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-colors ${
                  isDone
                    ? "bg-brown text-white"
                    : isActive
                    ? "bg-red text-white"
                    : "bg-border text-muted"
                }`}
              >
                {isDone ? "✓" : i + 1}
              </div>
              <span
                className={`text-sm font-semibold transition-colors ${
                  isActive ? "text-foreground" : "text-muted"
                }`}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-12 h-px mx-3 ${isDone ? "bg-brown" : "bg-border"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
