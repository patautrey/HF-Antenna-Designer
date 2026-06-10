// HF-Antenna-Designer/ui/renderer/tables.js
// Engineering-grade tables for NEC-style antenna dashboards

import {
    fmtDBi, fmtDB, fmtDegrees, fmtOhms, fmtSWR,
    fmtBandwidth, fmtPercent, fmtMeters, fmtFeetInches,
    safe
} from "./utils.js";

// ------------------------------------------------------------
// Key Performance Metrics Table
// ------------------------------------------------------------

export function metricsTable(result) {
    return `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

        <div class="bg-white border border-amber-300 rounded-lg p-4 shadow">
            <h4 class="text-amber-700 font-semibold mb-2">Gain & Pattern</h4>
            <table class="w-full text-sm">
                <tr><td class="font-medium">Forward Gain</td><td>${fmtDBi(result.gain.maxGain)}</td></tr>
                <tr><td class="font-medium">Seaside / DX Boost</td><td>${fmtDB(result.gain.environmentBoost)}</td></tr>
                <tr><td class="font-medium">Front-to-Back Ratio</td><td>${fmtDB(result.gain.fb)}</td></tr>
                <tr><td class="font-medium">Max TOA</td><td>${fmtDegrees(result.pattern.maxTOA)}</td></tr>
            </table>
        </div>

        <div class="bg-white border border-amber-300 rounded-lg p-4 shadow">
            <h4 class="text-amber-700 font-semibold mb-2">Impedance & SWR</h4>
            <table class="w-full text-sm">
                <tr><td class="font-medium">Feedpoint Impedance</td><td>${fmtOhms(result.impedance.R, result.impedance.X)}</td></tr>
                <tr><td class="font-medium">SWR @ f₀</td><td>${fmtSWR(result.swr.atFreq)}</td></tr>
                <tr><td class="font-medium">2:1 SWR Bandwidth</td><td>${fmtBandwidth(result.swr.bandwidth2to1)}</td></tr>
                <tr><td class="font-medium">3:1 SWR Bandwidth</td><td>${fmtBandwidth(result.swr.bandwidth3to1)}</td></tr>
            </table>
        </div>

        <div class="bg-white border border-amber-300 rounded-lg p-4 shadow">
            <h4 class="text-amber-700 font-semibold mb-2">Efficiency & Loss</h4>
            <table class="w-full text-sm">
                <tr><td class="font-medium">Radiation Resistance</td><td>${result.efficiency.radiationResistance.toFixed(1)} Ω</td></tr>
                <tr><td class="font-medium">Ground Loss Resistance</td><td>${result.efficiency.groundLoss.toFixed(1)} Ω</td></tr>
                <tr><td class="font-medium">Total Resistance</td><td>${result.efficiency.totalResistance.toFixed(1)} Ω</td></tr>
                <tr><td class="font-medium">Radiation Efficiency</td><td>${fmtPercent(result.efficiency.radiationEfficiency)}</td></tr>
                <tr><td class="font-medium">ERP</td><td>${result.efficiency.erp.toFixed(1)} W</td></tr>
            </table>
        </div>

    </div>
    `;
}

// ------------------------------------------------------------
// Element Geometry Table
// ------------------------------------------------------------

export function geometryTable(elements) {
    const rows = elements.map(el => {
        return `
        <tr>
            <td class="px-2 py-1">${safe(el.name)}</td>
            <td class="px-2 py-1">${safe(el.type)}</td>
            <td class="px-2 py-1">${fmtMeters(el.length)}</td>
            <td class="px-2 py-1">${fmtFeetInches(el.length)}</td>
            <td class="px-2 py-1">${fmtMeters(el.position)}</td>
        </tr>`;
    }).join("");

    return `
    <div class="overflow-x-auto">
        <table class="min-w-full text-sm border border-amber-300 rounded-lg">
            <thead class="bg-amber-100 text-amber-800">
                <tr>
                    <th class="px-2 py-1 text-left">Element</th>
                    <th class="px-2 py-1 text-left">Type</th>
                    <th class="px-2 py-1 text-left">Length (m)</th>
                    <th class="px-2 py-1 text-left">Length (ft/in)</th>
                    <th class="px-2 py-1 text-left">Position (m)</th>
                </tr>
            </thead>
            <tbody>
                ${rows}
            </tbody>
        </table>
    </div>
    `;
}

// ------------------------------------------------------------
// Radial System Table
// ------------------------------------------------------------

export function radialTable(radials) {
    return `
    <table class="w-full text-sm border border-amber-300 rounded-lg">
        <tr><td class="font-medium px-2 py-1">Radial Count</td><td>${safe(radials.count)}</td></tr>
        <tr><td class="font-medium px-2 py-1">Radial Length</td><td>${fmtMeters(radials.length)}</td></tr>
        <tr><td class="font-medium px-2 py-1">Elevated Radials</td><td>${radials.elevated ? "Yes" : "No"}</td></tr>
    </table>
    `;
}

// ------------------------------------------------------------
// Boost Summary Table
// ------------------------------------------------------------

export function boostTable(boosts) {
    return `
    <table class="w-full text-sm border border-amber-300 rounded-lg">
        <tr><td class="font-medium px-2 py-1">Reflector Boost</td><td>${fmtDB(boosts.reflector)}</td></tr>
        <tr><td class="font-medium px-2 py-1">Director Boost</td><td>${fmtDB(boosts.directors)}</td></tr>
        <tr><td class="font-medium px-2 py-1">Seaside Boost</td><td>${fmtDB(boosts.seaside)}</td></tr>
        <tr><td class="font-medium px-2 py-1">DX Turbo Boost</td><td>${fmtDB(boosts.dxTurbo)}</td></tr>
    </table>
    `;
}
