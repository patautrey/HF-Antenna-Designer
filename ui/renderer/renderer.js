// HF-Antenna-Designer/ui/renderer/renderer.js
// Full NEC-style dashboard renderer (Tailwind + HeadlessUI + Amber theme)

import { createSection } from "./sections.js";
import { metricsTable, geometryTable, radialTable, boostTable } from "./tables.js";
import { renderAzimuthPattern, renderElevationPattern, render3DPattern } from "./plots.js";
import { fmtMHz, fmtMeters, fmtFeetInches, safe } from "./utils.js";

// ------------------------------------------------------------
// Hero Summary (always visible)
// ------------------------------------------------------------

function heroSummary(result, config) {
    return `
    <div class="bg-amber-100 border border-amber-300 rounded-xl p-5 shadow mb-6">
        <h2 class="text-2xl font-bold text-amber-800 mb-2">${safe(result.metadata.name)}</h2>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-amber-900">

            <div>
                <div class="font-semibold">Frequency</div>
                <div>${fmtMHz(config.frequency)}</div>
            </div>

            <div>
                <div class="font-semibold">Wavelength</div>
                <div>${fmtMeters(result.metadata.wavelength)}</div>
            </div>

            <div>
                <div class="font-semibold">Configuration</div>
                <div>${safe(result.metadata.configuration)}</div>
            </div>

            <div>
                <div class="font-semibold">DX Turbo</div>
                <div>${result.metadata.dxTurbo ? "Enabled" : "Disabled"}</div>
            </div>

            <div>
                <div class="font-semibold">Seaside Mode</div>
                <div>${result.metadata.seaside ? "Enabled" : "Normal Ground"}</div>
            </div>

            <div>
                <div class="font-semibold">Elements</div>
                <div>${result.metadata.elementCount}</div>
            </div>

        </div>
    </div>
    `;
}

// ------------------------------------------------------------
// Full Dashboard Renderer
// ------------------------------------------------------------

export function renderDashboard(result, config) {

    // -----------------------------
    // Section 1 — Antenna Configuration
    // -----------------------------
    const configHTML = `
        <table class="w-full text-sm">
            <tr><td class="font-medium">Frequency</td><td>${fmtMHz(config.frequency)}</td></tr>
            <tr><td class="font-medium">Coax Type</td><td>${safe(config.coaxType)}</td></tr>
            <tr><td class="font-medium">PVC OD</td><td>${safe(config.pvcOD)} mm</td></tr>
            <tr><td class="font-medium">Mounting Mode</td><td>${safe(config.pvcMode)}</td></tr>
            <tr><td class="font-medium">Target Choke Reactance</td><td>${safe(config.targetReactance)} Ω</td></tr>
        </table>
    `;

    // -----------------------------
    // Section 2 — Key Performance Metrics
    // -----------------------------
    const metricsHTML = metricsTable(result);

    // -----------------------------
    // Section 3 — Geometry
    // -----------------------------
    const geometryHTML = geometryTable(result.geometry.elements) + `
        <div class="mt-4 text-sm text-amber-800">
            <div><b>Total Boom Length:</b> ${fmtMeters(result.geometry.totalBoom)}</div>
            <div><b>Total Wire Length:</b> ${fmtMeters(result.geometry.totalWire)}</div>
        </div>
    `;

    // -----------------------------
    // Section 4 — Radial System
    // -----------------------------
    const radialsHTML = radialTable(result.radials);

    // -----------------------------
    // Section 5 — Radiation Patterns
    // -----------------------------
    const patternsHTML = `
        <div class="h-64" id="az_plot"></div>
        <div class="h-64 mt-6" id="el_plot"></div>
        <div class="h-72 mt-6" id="pattern3d"></div>
    `;

    // -----------------------------
    // Section 6 — Performance Tips
    // -----------------------------
    const tipsHTML = `
        <ul class="list-disc ml-6 text-sm text-amber-900 leading-relaxed">
            <li>Add a reflector to improve F/B ratio.</li>
            <li>Add directors to increase forward gain.</li>
            <li>Increase radial count for better efficiency.</li>
            <li>Elevate radials for reduced ground loss.</li>
            <li>Use DX Turbo for low-angle optimization.</li>
            <li>Seaside operation provides strong environmental gain.</li>
        </ul>
    `;

    // -----------------------------
    // Section 7 — Export Tools
    // -----------------------------
    const exportHTML = `
        <button class="px-4 py-2 bg-amber-600 text-white rounded shadow hover:bg-amber-700"
                onclick="navigator.clipboard.writeText(JSON.stringify(${JSON.stringify(result)}, null, 2))">
            Copy Full Summary
        </button>
    `;

    // ------------------------------------------------------------
    // Assemble Full Dashboard
    // ------------------------------------------------------------

    return `
        ${heroSummary(result, config)}

        ${createSection("Antenna Configuration", configHTML)}
        ${createSection("Key Performance Metrics", metricsHTML)}
        ${createSection("Element Geometry & Boom Layout", geometryHTML)}
        ${createSection("Ground System & Radials", radialsHTML)}
        ${createSection("Radiation Patterns", patternsHTML)}
        ${createSection("Performance Tips & Notes", tipsHTML)}
        ${createSection("Export / Copy Summary", exportHTML)}
    `;
}

// ------------------------------------------------------------
// After HTML is inserted, call this to render plots
// ------------------------------------------------------------

export function renderDashboardPlots(result) {
    if (result.pattern.azimuth)
        renderAzimuthPattern("az_plot", result.pattern.azimuth);

    if (result.pattern.elevation)
        renderElevationPattern("el_plot", result.pattern.elevation);

    if (result.pattern.pattern3D)
        render3DPattern("pattern3d", result.pattern.pattern3D);
}
