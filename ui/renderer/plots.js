// HF-Antenna-Designer/ui/renderer/plots.js
// Plotly.js radiation pattern rendering (Azimuth, Elevation, 3D)

import { normalizePatternArray } from "./utils.js";

// ------------------------------------------------------------
// Amber / Orange Theme Colors
// ------------------------------------------------------------

const amberLine = "rgb(245, 158, 11)";      // amber-500
const amberFill = "rgba(245, 158, 11, 0.25)";
const amberGrid = "rgba(245, 158, 11, 0.15)";
const amberText = "rgb(120, 53, 15)";       // amber-800

// ------------------------------------------------------------
// Azimuth Pattern (H-plane)
// ------------------------------------------------------------

export function renderAzimuthPattern(containerId, pattern) {
    const data = normalizePatternArray(pattern);

    const trace = {
        type: "scatterpolar",
        mode: "lines",
        r: data.map(p => p.gain),
        theta: data.map(p => p.angle),
        line: { color: amberLine, width: 3 },
        fill: "toself",
        fillcolor: amberFill,
        hovertemplate: "Angle: %{theta}°<br>Gain: %{r} dBi<extra></extra>"
    };

    const layout = {
        title: {
            text: "Azimuth Pattern (H‑plane)",
            font: { color: amberText, size: 18 }
        },
        polar: {
            radialaxis: {
                showline: true,
                gridcolor: amberGrid,
                tickfont: { color: amberText }
            },
            angularaxis: {
                gridcolor: amberGrid,
                tickfont: { color: amberText }
            }
        },
        margin: { t: 40, b: 20, l: 20, r: 20 },
        paper_bgcolor: "white",
        plot_bgcolor: "white"
    };

    Plotly.newPlot(containerId, [trace], layout, { responsive: true });
}

// ------------------------------------------------------------
// Elevation Pattern (E-plane)
// ------------------------------------------------------------

export function renderElevationPattern(containerId, pattern) {
    const data = normalizePatternArray(pattern);

    const trace = {
        type: "scatterpolar",
        mode: "lines",
        r: data.map(p => p.gain),
        theta: data.map(p => p.angle),
        line: { color: amberLine, width: 3 },
        fill: "toself",
        fillcolor: amberFill,
        hovertemplate: "Angle: %{theta}°<br>Gain: %{r} dBi<extra></extra>"
    };

    const layout = {
        title: {
            text: "Elevation Pattern (E‑plane)",
            font: { color: amberText, size: 18 }
        },
        polar: {
            radialaxis: {
                showline: true,
                gridcolor: amberGrid,
                tickfont: { color: amberText }
            },
            angularaxis: {
                gridcolor: amberGrid,
                tickfont: { color: amberText }
            }
        },
        margin: { t: 40, b: 20, l: 20, r: 20 },
        paper_bgcolor: "white",
        plot_bgcolor: "white"
    };

    Plotly.newPlot(containerId, [trace], layout, { responsive: true });
}

// ------------------------------------------------------------
// Optional 3D Pattern (Realistic Ground-Reflected Gain)
// ------------------------------------------------------------

export function render3DPattern(containerId, pattern3D) {
    if (!pattern3D || !pattern3D.points) return;

    const pts = pattern3D.points;

    const trace = {
        type: "mesh3d",
        x: pts.map(p => p.x),
        y: pts.map(p => p.y),
        z: pts.map(p => p.z),
        intensity: pts.map(p => p.gain),
        colorscale: [
            [0, "rgb(254, 243, 199)"],   // amber-100
            [0.5, "rgb(245, 158, 11)"],  // amber-500
            [1, "rgb(120, 53, 15)"]      // amber-800
        ],
        showscale: true,
        opacity: 0.9
    };

    const layout = {
        title: {
            text: "3D Radiation Pattern (Ground‑Reflected Gain)",
            font: { color: amberText, size: 18 }
        },
        scene: {
            xaxis: { backgroundcolor: "white", gridcolor: amberGrid },
            yaxis: { backgroundcolor: "white", gridcolor: amberGrid },
            zaxis: { backgroundcolor: "white", gridcolor: amberGrid }
        },
        margin: { t: 40, b: 20, l: 20, r: 20 },
        paper_bgcolor: "white"
    };

    Plotly.newPlot(containerId, [trace], layout, { responsive: true });
}
