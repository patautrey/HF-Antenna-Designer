/* ============================================================
   Flowerpot (T2LT) Antenna — SVG Build Diagram
   ============================================================ */

export const FlowerpotDiagram = `
<svg width="320" height="700" viewBox="0 0 320 700" xmlns="http://www.w3.org/2000/svg">

    <!-- Top Radiator -->
    <line x1="160" y1="40" x2="160" y2="260"
          stroke="#0077cc" stroke-width="6"/>
    <text x="170" y="150" font-size="16" fill="#0077cc">Top Radiator</text>

    <!-- Feedpoint -->
    <circle cx="160" cy="260" r="8" fill="#ff6600"/>
    <text x="175" y="265" font-size="16" fill="#ff6600">Feedpoint</text>

    <!-- Bottom Sleeve -->
    <line x1="160" y1="260" x2="160" y2="480"
          stroke="#444" stroke-width="10"/>
    <text x="170" y="380" font-size="16" fill="#444">Coax Shield Sleeve</text>

    <!-- PVC Pipe -->
    <rect x="140" y="40" width="40" height="440"
          fill="none" stroke="#999" stroke-width="3"/>
    <text x="190" y="60" font-size="16" fill="#999">PVC Pipe</text>

    <!-- Choke Coil -->
    <g stroke="#aa00aa" stroke-width="4" fill="none">
        <path d="M 120 480
                 C 140 500, 180 500, 200 480
                 C 220 460, 180 460, 160 480
                 C 140 500, 180 500, 200 480
                 C 220 460, 180 460, 160 480" />
    </g>
    <text x="80" y="520" font-size="16" fill="#aa00aa">Choke Coil</text>

    <!-- Coax Feedline -->
    <line x1="160" y1="480" x2="160" y2="650"
          stroke="#000" stroke-width="8"/>
    <text x="170" y="620" font-size="16" fill="#000">Coax Feedline</text>

</svg>
`;
