/* ---------------------------------------------------------
   HF Workbench — NVIS Reflector Engine
   Computes reflector spacing, height, gain, and TOA shift
   with safe math (no NaN) and friendly units.
--------------------------------------------------------- */

import { log } from "../log.js";

/* Simple wavelength in meters */
function wavelengthMeters(freqMHz) {
    if (!freqMHz || freqMHz <= 0) return 1; // safe fallback
    return 300 / freqMHz;
}

/* Convert meters to feet and feet+inches string */
function metersToFeet(m) {
    const ft = m * 3.28084;
    return ft;
}

function feetToFeetInches(ft) {
    const whole = Math.floor(ft);
    const inches = Math.round((ft - whole) * 12);
    if (inches === 12) {
        return `${whole + 1} ft 0 in`;
    }
    return `${whole} ft ${inches} in`;
}

/**
 * Compute NVIS reflector geometry and gain.
 *
 * @param {number} freqMHz
 * @param {number} heightM      Radiator height (m)
 * @param {number} radialCount
 * @param {number} radialLenM
 * @param {number} baseToaDeg   Base TOA from radiator (deg)
 * @returns {{
 *   spacingLambda: number,
 *   spacingM: number,
 *   spacingFt: number,
 *   spacingFeetInches: string,
 *   heightM: number,
 *   heightFt: number,
 *   heightFeetInches: string,
 *   gainDb: number,
 *   toaDeg: number,
 *   summary: string
 * }}
 */
export function computeNVISReflector(freqMHz, heightM, radialCount, radialLenM, baseToaDeg) {
    const safeFreq = (!freqMHz || freqMHz <= 0) ? 7.1 : freqMHz;
    const lambda = wavelengthMeters(safeFreq);

    const safeHeight = (!heightM || heightM <= 0) ? lambda * 0.2 : heightM;
    const frac = safeHeight / lambda;

    const safeRadials = (!radialCount || radialCount < 1) ? 4 : radialCount;
    const safeRadialLen = (!radialLenM || radialLenM <= 0) ? lambda * 0.25 : radialLenM;

    // Reflector spacing: around 0.15 λ for NVIS-ish behavior
    let spacingLambda = 0.15;
    if (frac < 0.2) spacingLambda = 0.12;
    if (frac > 0.3) spacingLambda = 0.18;

    const spacingM = spacingLambda * lambda;
    const spacingFt = metersToFeet(spacingM);
    const spacingFeetInches = feetToFeetInches(spacingFt);

    // Reflector height: somewhat below radiator height
    let reflHeightM = safeHeight * 0.6;
    if (reflHeightM < lambda * 0.05) reflHeightM = lambda * 0.05;
    const reflHeightFt = metersToFeet(reflHeightM);
    const reflHeightFeetInches = feetToFeetInches(reflHeightFt);

    // Reflector gain: depends on radials and spacing
    const radialFactor = Math.log10(Math.max(1, safeRadials)) * 1.0;
    const spacingFactor = 1.5 - Math.abs(spacingLambda - 0.15) * 10; // peak near 0.15 λ
    let gainDb = radialFactor + spacingFactor;
    if (gainDb < 0.5) gainDb = 0.5;
    if (gainDb > 4.0) gainDb = 4.0;

    // TOA shift: reflector nudges TOA upward a bit
    const baseToa = (typeof baseToaDeg === "number" && !Number.isNaN(baseToaDeg))
        ? baseToaDeg
        : Math.min(80, Math.max(30, 60 + (0.25 - frac) * 80));

    let toaDeg = baseToa + 6; // reflector raises TOA slightly
    if (toaDeg < 30) toaDeg = 30;
    if (toaDeg > 85) toaDeg = 85;

    const summary = `
        Reflector spacing ≈ ${spacingLambda.toFixed(2)} λ
        (${spacingM.toFixed(2)} m, ${spacingFt.toFixed(1)} ft / ${spacingFeetInches}),
        reflector height ≈ ${reflHeightM.toFixed(2)} m
        (${reflHeightFt.toFixed(1)} ft / ${reflHeightFeetInches}),
        reflector gain ≈ +${gainDb.toFixed(1)} dB,
        TOA with reflector ≈ ${toaDeg.toFixed(0)}°.
    `;

    return {
        spacingLambda,
        spacingM,
        spacingFt,
        spacingFeetInches,
        heightM: reflHeightM,
        heightFt: reflHeightFt,
        heightFeetInches: reflHeightFeetInches,
        gainDb,
        toaDeg,
        summary
    };
}

export function logNVISReflector(label, info) {
    if (!info) return;
    log("NVIS Reflector", {
        label,
        spacingLambda: info.spacingLambda,
        spacingM: info.spacingM,
        spacingFt: info.spacingFt,
        heightM: info.heightM,
        heightFt: info.heightFt,
        gainDb: info.gainDb,
        toaDeg: info.toaDeg
    });
}
