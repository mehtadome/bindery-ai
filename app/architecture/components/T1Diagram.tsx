const stroke  = "#e5e7eb";
const arrow   = "#9ca3af";
const label   = "#6b7280";
const heading = "#0a0a0a";
const accent  = "#cc2200";

export default function T1Diagram() {
  return (
    <svg viewBox="0 0 740 292" width="100%" style={{ fontFamily: "inherit", overflow: "visible" }}>
      <defs>
        <marker id="arr1" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
          <path d="M0,0 L7,3.5 L0,7 Z" fill={arrow} />
        </marker>
        <filter id="ns1" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="2.5" floodOpacity="0.07" />
        </filter>
      </defs>

      {/* ── Nodes ─────────────────────────────────────────────────────────── */}

      {/* Data Source: x=20, y=28, w=148, h=56 */}
      <g filter="url(#ns1)">
        <rect x="20" y="28" width="148" height="56" rx="10" fill="white" stroke={stroke} strokeWidth="1.5" />
      </g>
      <text x="94" y="53" textAnchor="middle" fontSize="12" fontWeight="700" fill={heading}>Client Data Store</text>
      <text x="94" y="70" textAnchor="middle" fontSize="10" fill={label}>AMS · SFTP · S3</text>

      {/* Next.js / Vercel: x=286, y=28, w=168, h=56 */}
      <g filter="url(#ns1)">
        <rect x="286" y="28" width="168" height="56" rx="10" fill="white" stroke={stroke} strokeWidth="1.5" />
      </g>
      <text x="370" y="53" textAnchor="middle" fontSize="12" fontWeight="700" fill={heading}>Next.js / Vercel</text>
      <text x="370" y="70" textAnchor="middle" fontSize="10" fill={label}>App & API layer</text>

      {/* Claude Haiku: x=566, y=28, w=150, h=56 — red border */}
      <g filter="url(#ns1)">
        <rect x="566" y="28" width="150" height="56" rx="10" fill="white" stroke={accent} strokeWidth="1.5" />
      </g>
      <text x="641" y="53" textAnchor="middle" fontSize="12" fontWeight="700" fill={heading}>Claude Haiku</text>
      <text x="641" y="70" textAnchor="middle" fontSize="10" fill={label}>Anthropic</text>

      {/* ACORD Platform: x=420, y=212, w=196, h=56 */}
      <g filter="url(#ns1)">
        <rect x="420" y="212" width="196" height="56" rx="10" fill="white" stroke={stroke} strokeWidth="1.5" />
      </g>
      <text x="518" y="237" textAnchor="middle" fontSize="12" fontWeight="700" fill={heading}>ACORD Platform</text>
      <text x="518" y="254" textAnchor="middle" fontSize="10" fill={label}>XML submission</text>

      {/* ── Arrows ────────────────────────────────────────────────────────── */}

      {/* 1 · Data Source → Next.js */}
      <line x1="168" y1="44" x2="286" y2="44" stroke={arrow} strokeWidth="1.5" markerEnd="url(#arr1)" />
      <rect x="177" y="23" width="100" height="16" rx="4" fill="white" stroke={stroke} strokeWidth="1" />
      <text x="227" y="35" textAnchor="middle" fontSize="9.5" fill={label}>upload / API</text>

      {/* 2 · Next.js → Claude Haiku */}
      <line x1="454" y1="44" x2="566" y2="44" stroke={arrow} strokeWidth="1.5" markerEnd="url(#arr1)" />
      <rect x="456" y="21" width="106" height="16" rx="4" fill="white" stroke={stroke} strokeWidth="1" />
      <text x="509" y="33" textAnchor="middle" fontSize="9.5" fill={label}>streamText</text>

      {/* 3 · Claude Haiku → Next.js (elbow — structured fields) */}
      <path d="M 641,84 L 641,108 L 370,108 L 370,84"
        stroke={arrow} strokeWidth="1.5" fill="none" markerEnd="url(#arr1)" />
      <rect x="440" y="112" width="130" height="16" rx="4" fill="white" stroke={stroke} strokeWidth="1" />
      <text x="505" y="124" textAnchor="middle" fontSize="9.5" fill={label}>structured fields</text>

      {/* 4 · Next.js → Data Source (U-path below — write-back, always fires) */}
      <path d="M 308,84 L 308,274 L 94,274 L 94,84"
        stroke={arrow} strokeWidth="1.5" fill="none" markerEnd="url(#arr1)" />
      <rect x="146" y="253" width="110" height="16" rx="4" fill="white" stroke={stroke} strokeWidth="1" />
      <text x="201" y="265" textAnchor="middle" fontSize="9.5" fill={label}>write-back · retention</text>

      {/* 5 · Next.js → ACORD Platform (elbow — always broadcast) */}
      <path d="M 420,84 L 420,196 L 518,196 L 518,212"
        stroke={arrow} strokeWidth="1.5" fill="none" markerEnd="url(#arr1)" />
      <rect x="424" y="176" width="148" height="16" rx="4" fill="white" stroke={stroke} strokeWidth="1" />
      <text x="498" y="188" textAnchor="middle" fontSize="9.5" fill={label}>on extraction complete</text>
    </svg>
  );
}
