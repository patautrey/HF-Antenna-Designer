// HF-Antenna-Designer/ui/renderer/utils.js
// Universal formatting helpers for NEC-style antenna dashboards

// -----------------------------
// Number Formatting
// -----------------------------

export function fmtMHz(valueHz) {
    if (!valueHz && valueHz !== 0) return "";
    return (valueHz / 1e6).toFixed(3) + " MHz";
}

export function fmtKHz(valueHz) {
    if (!valueHz && valueHz !== 0) return "";
    return (valueHz / 1e3).toFixed(1) + " kHz";
}

export function fmtPercent(value) {
    if (value === undefined || value === null) return "";
    return value.toFixed(1) + " %";
}

export function fmtDB(value) {
    if (value === undefined || value === null) return "";
    return value.toFixed(1) + " dB";
}

export function fmtDBi(value) {
    if (value === undefined || value === null) return "";
    return value.toFixed(1) + " dBi";
}

export function fmtOhms(R, X) {
    if (R === undefined || X === undefined) return "";
    const sign = X >= 0 ? "+" : "−";
    return `${R.toFixed(1)} ${sign} j${Math.abs(X).toFixed(1)} Ω`;
}

export function fmtSWR(value) {
    if (!value && value !== 0) return "";
    return value.toFixed(2) + " : 1";
}

export function fmtDegrees(value) {
    if (!value && value !== 0) return "";
    return value.toFixed(1) + "°";
}

export function fmtMeters(value) {
    if (!value && value !== 0) return "";
    return value.toFixed(3) + " m";
}

export function fmtGainBoost(value) {
    if (!value && value !== 0) return "";
    if (value === 0) return "0 dB";
    const sign = value > 0 ? "+" : "−";
    return `${sign}${Math.abs(value).toFixed(1)} dB`;
}

// -----------------------------
// Length Conversion
// -----------------------------

export function metersToFeetInches(m) {
    if (!m && m !== 0) return { ft: 0, inch: 0 };

    const totalInches = m * 39.3701;
    const ft = Math.floor(totalInches / 12);
    const inch = totalInches % 12;

    return {
        ft,
        inch: inch.toFixed(1)
    };
}

export function fmtFeetInches(m) {
    const { ft, inch } = metersToFeetInches(m);
    return `${ft} ft ${inch} in`;
}

// -----------------------------
// Bandwidth Formatting
// -----------------------------

export function fmtBandwidth(valueHz) {
    if (!valueHz && valueHz !== 0) return "";
    if (valueHz >= 1e6) return (valueHz / 1e6).toFixed(3) + " MHz";
    return fmtKHz(valueHz);
}

// -----------------------------
// Pattern Helpers
// -----------------------------

export function normalizePatternArray(arr) {
    // Ensures pattern arrays are [{angle, gain}, ...]
    if (!Array.isArray(arr)) return [];
    return arr.map(p => ({
        angle: Number(p.angle),
        gain: Number(p.gain)
    }));
}

// -----------------------------
// Misc Helpers
// -----------------------------

export function fmtBool(value) {
    return value ? "Yes" : "No";
}

export function fmtList(arr) {
    if (!arr || arr.length === 0) return "—";
    return arr.join(", ");
}

export function safe(value, fallback = "—") {
    return value !== undefined && value !== null ? value : fallback;
}
