const stroke  = "#e5e7eb";
const arrow   = "#9ca3af";
const label   = "#6b7280";
const heading = "#0a0a0a";
const accent  = "#cc2200";

export default function T0Diagram() {
  return (
    <svg viewBox="0 0 740 292" width="100%" style={{ fontFamily: "inherit", overflow: "visible" }}>
      <defs>
        <marker id="arr" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
          <path d="M0,0 L7,3.5 L0,7 Z" fill={arrow} />
        </marker>
        <filter id="ns" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="2.5" floodOpacity="0.07" />
        </filter>
      </defs>

      {/* ── Nodes ─────────────────────────────────────────────────────────── */}

      {/* Browser: x=20, y=28, w=128, h=56 */}
      <g filter="url(#ns)">
        <rect x="20" y="28" width="128" height="56" rx="10" fill="white" stroke={stroke} strokeWidth="1.5" />
      </g>
      <text x="84" y="53" textAnchor="middle" fontSize="12" fontWeight="700" fill={heading}>Browser</text>
      <text x="84" y="70" textAnchor="middle" fontSize="10" fill={label}>CSV · accounts · results</text>

      {/* Next.js / Vercel: x=286, y=28, w=168, h=56 */}
      <g filter="url(#ns)">
        <rect x="286" y="28" width="168" height="56" rx="10" fill="white" stroke={stroke} strokeWidth="1.5" />
      </g>
      <text x="370" y="53" textAnchor="middle" fontSize="12" fontWeight="700" fill={heading}>Next.js / Vercel</text>
      <text x="370" y="70" textAnchor="middle" fontSize="10" fill={label}>App & API layer</text>

      {/* Claude Haiku: x=566, y=28, w=150, h=56 — red border = key AI node */}
      <g filter="url(#ns)">
        <rect x="566" y="28" width="150" height="56" rx="10" fill="white" stroke={accent} strokeWidth="1.5" />
      </g>
      <text x="641" y="53" textAnchor="middle" fontSize="12" fontWeight="700" fill={heading}>Claude Haiku</text>
      <text x="641" y="70" textAnchor="middle" fontSize="10" fill={label}>Anthropic</text>

      {/* /api/resolve-account: x=106, y=212, w=188, h=56 */}
      <g filter="url(#ns)">
        <rect x="106" y="212" width="188" height="56" rx="10" fill="white" stroke={stroke} strokeWidth="1.5" />
      </g>
      <text x="200" y="237" textAnchor="middle" fontSize="12" fontWeight="700" fill={heading}>/api/resolve-account</text>
      <text x="200" y="254" textAnchor="middle" fontSize="10" fill={label}>generateText · fallback</text>

      {/* ACORD Results + PDF: x=416, y=212, w=200, h=56 */}
      <g filter="url(#ns)">
        <rect x="416" y="212" width="200" height="56" rx="10" fill="white" stroke={stroke} strokeWidth="1.5" />
      </g>
      <text x="516" y="237" textAnchor="middle" fontSize="12" fontWeight="700" fill={heading}>ACORD Results</text>
      <text x="516" y="254" textAnchor="middle" fontSize="10" fill={label}>field grid · jsPDF export</text>

      {/* ── Arrows ────────────────────────────────────────────────────────── */}

      {/* 1 · Browser → Next.js */}
      <line x1="148" y1="44" x2="286" y2="44" stroke={arrow} strokeWidth="1.5" markerEnd="url(#arr)" />
      <rect x="162" y="23" width="110" height="16" rx="4" fill="white" stroke={stroke} strokeWidth="1" />
      <text x="217" y="35" textAnchor="middle" fontSize="9.5" fill={label}>POST /api/extract</text>

      {/* 2 · Next.js → Claude Haiku */}
      <line x1="454" y1="44" x2="566" y2="44" stroke={arrow} strokeWidth="1.5" markerEnd="url(#arr)" />
      <rect x="456" y="21" width="106" height="16" rx="4" fill="white" stroke={stroke} strokeWidth="1" />
      <text x="509" y="33" textAnchor="middle" fontSize="9.5" fill={label}>streamText</text>

      {/* 3 · Claude Haiku → Next.js (elbow — JSON stream) */}
      <path d="M 641,84 L 641,108 L 370,108 L 370,84"
        stroke={arrow} strokeWidth="1.5" fill="none" markerEnd="url(#arr)" />
      <rect x="440" y="112" width="130" height="16" rx="4" fill="white" stroke={stroke} strokeWidth="1" />
      <text x="505" y="124" textAnchor="middle" fontSize="9.5" fill={label}>JSON stream · buffered</text>

      {/* 4 · Next.js → Browser (field results, return) */}
      <line x1="286" y1="62" x2="148" y2="62" stroke={arrow} strokeWidth="1.5" markerEnd="url(#arr)" />
      <rect x="162" y="66" width="86" height="16" rx="4" fill="white" stroke={stroke} strokeWidth="1" />
      <text x="205" y="78" textAnchor="middle" fontSize="9.5" fill={label}>field results</text>

      {/* 5 · Next.js → /api/resolve-account (elbow — pending rows) */}
      <path d="M 320,84 L 320,182 L 200,182 L 200,212"
        stroke={arrow} strokeWidth="1.5" fill="none" markerEnd="url(#arr)" />
      <rect x="207" y="162" width="110" height="16" rx="4" fill="white" stroke={stroke} strokeWidth="1" />
      <text x="262" y="174" textAnchor="middle" fontSize="9.5" fill={label}>pending insuredName</text>

      {/* 6 · Next.js → ACORD Results (elbow — parseExtractionResponse) */}
      <path d="M 420,84 L 420,196 L 516,196 L 516,212"
        stroke={arrow} strokeWidth="1.5" fill="none" markerEnd="url(#arr)" />
      <rect x="424" y="176" width="162" height="16" rx="4" fill="white" stroke={stroke} strokeWidth="1" />
      <text x="505" y="188" textAnchor="middle" fontSize="9.5" fill={label}>parseExtractionResponse</text>
    </svg>
  );
}
