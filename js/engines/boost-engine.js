/* ---------------------------------------------------------
   HF Workbench — BoostEngine
   Handles non-geometry gain/TOA/path modifiers:
   reflectors, directors, time of day, seaside,
   ground screen / Faraday cloth, elevated radials,
   feedline type/length, NVIS reflector, etc.
--------------------------------------------------------- */

export const BoostEngine = {
    computeBoost(params) {
        const {
            // Reflectors / directors
            reflectorCount = 0,   // 0–2
            directorCount = 0,    // 0–3

            // Time of day
            timeOfDay = "day",    // "day" | "night" | "dawn" | "dusk"

            // Environment
            seaside = false,
            groundScreen = false,
            elevatedRadials = false,
            nvisReflector = false,

            // Feedline
            feedlineFamily = "coax", // "coax" | "ladder"
            feedlineType = null,     // e.g. "LMR-400", "RG-8X", "450Ω"
            feedlineLengthFt = 50,

            // DX Turbo already handled in GeometryEngine; here we only
            // allow a small "pattern" bonus if desired
            dxTurboPatternBonus = false
        } = params;

        const components = [];
        let totalBoost = 0;
        let toaShift = 0;
        let pathBias = null; // "east", "west", or null

        // --- Reflectors ---
        if (reflectorCount > 0) {
            const n = Math.max(0, Math.min(2, reflectorCount));
            const boost = 1.2 * n; // ~1.2 dB per reflector
            totalBoost += boost;
            components.push({
                type: "reflector",
                count: n,
                boost,
                label: `${n} reflector${n > 1 ? "s" : ""}`
            });
        }

        // --- Directors ---
        if (directorCount > 0) {
            const n = Math.max(0, Math.min(3, directorCount));
            const boost = 1.0 + 0.7 * (n - 1); // ~1.0, 1.7, 2.4 dB
            totalBoost += boost;
            components.push({
                type: "director",
                count: n,
                boost,
                label: `${n} director${n > 1 ? "s" : ""}`
            });
        }

        // --- Time of day ---
        if (timeOfDay === "day") {
            toaShift += +5; // more NVIS-ish
            components.push({
                type: "timeOfDay",
                mode: "day",
                boost: 0,
                toaShift: +5,
                label: "Daytime (D-layer absorption, NVIS favored)"
            });
        } else if (timeOfDay === "night") {
            toaShift += -5;
            totalBoost += 0.3;
            components.push({
                type: "timeOfDay",
                mode: "night",
                boost: 0.3,
                toaShift: -5,
                label: "Night (D-layer collapse, DX favored)"
            });
        } else if (timeOfDay === "dawn") {
            toaShift += -3;
            totalBoost += 0.4;
            pathBias = "east";
            components.push({
                type: "timeOfDay",
                mode: "dawn",
                boost: 0.4,
                toaShift: -3,
                pathBias,
                label: "Dawn (east-path enhancement)"
            });
        } else if (timeOfDay === "dusk") {
            toaShift += -2;
            totalBoost += 0.5;
            pathBias = "west";
            components.push({
                type: "timeOfDay",
                mode: "dusk",
                boost: 0.5,
                toaShift: -2,
                pathBias,
                label: "Dusk (west-path enhancement)"
            });
        }

        // --- Seaside ---
        if (seaside) {
            const boost = 2.0;
            totalBoost += boost;
            toaShift += -3;
            components.push({
                type: "seaside",
                boost,
                toaShift: -3,
                label: "Seaside (saltwater horizon gain)"
            });
        }

        // --- Ground screen / Faraday cloth ---
        if (groundScreen) {
            const boost = 1.2;
            totalBoost += boost;
            components.push({
                type: "groundScreen",
                boost,
                label: "Ground Screen / Faraday Cloth"
            });
        }

        // --- Elevated radials ---
        if (elevatedRadials) {
            const boost = 0.8;
            totalBoost += boost;
            components.push({
                type: "elevatedRadials",
                boost,
                label: "Elevated Radials"
            });
        }

        // --- NVIS reflector (for NVIS verticals only) ---
        if (nvisReflector) {
            const boost = 1.0;
            totalBoost += boost;
            toaShift += +5;
            components.push({
                type: "nvisReflector",
                boost,
                toaShift: +5,
                label: "NVIS Reflector (overhead gain)"
            });
        }

        // --- Feedline (auto-selected family) ---
        if (feedlineFamily === "coax") {
            const { boost, label } = coaxBoost(feedlineType, feedlineLengthFt);
            totalBoost += boost;
            components.push({
                type: "feedline",
                family: "coax",
                boost,
                label
            });
        } else if (feedlineFamily === "ladder") {
            const { boost, label } = ladderBoost(feedlineType, feedlineLengthFt);
            totalBoost += boost;
            components.push({
                type: "feedline",
                family: "ladder",
                boost,
                label
            });
        }

        // --- DX Turbo pattern bonus (optional) ---
        if (dxTurboPatternBonus) {
            const boost = 0.3;
            totalBoost += boost;
            toaShift += -1;
            components.push({
                type: "dxTurboPattern",
                boost,
                toaShift: -1,
                label: "DX Turbo pattern optimization"
            });
        }

        return {
            totalBoost,
            toaShift,
            pathBias,
            components
        };
    }
};

/* ---------------------------------------------------------
   Helpers: feedline models
--------------------------------------------------------- */

function coaxBoost(type, lengthFt) {
    const len = Math.max(0, lengthFt || 50);

    // Approximate HF loss per 100 ft at ~14 MHz
    const table = {
        "LMR-400": 0.35,
        "LMR-240": 0.6,
        "RG-213": 0.7,
        "RG-8X": 1.0,
        "RG-58": 1.3
    };

    const labelType = type || "RG-213";
    const lossPer100 = table[labelType] ?? table["RG-213"];
    const loss = (lossPer100 * len) / 100;

    // Baseline = RG-213 at 50 ft
    const baselineLoss = (table["RG-213"] * 50) / 100;
    const delta = baselineLoss - loss; // positive = better than baseline

    const boost = delta; // treat reduced loss as positive dB

    const label = `Feedline: ${labelType} @ ${len} ft (≈${loss.toFixed(2)} dB loss)`;

    return { boost, label };
}

function ladderBoost(type, lengthFt) {
    const len = Math.max(0, lengthFt || 50);

    // Approximate HF loss per 100 ft at ~14 MHz
    const table = {
        "300Ω": 0.25,
        "450Ω": 0.18,
        "600Ω": 0.12
    };

    const labelType = type || "450Ω";
    const lossPer100 = table[labelType] ?? table["450Ω"];
    const loss = (lossPer100 * len) / 100;

    // Baseline = 450Ω at 50 ft
    const baselineLoss = (table["450Ω"] * 50) / 100;
    const delta = baselineLoss - loss;

    const boost = delta + 0.5; // ladder line gets a general efficiency bonus

    const label = `Feedline: ${labelType} ladder line @ ${len} ft (≈${loss.toFixed(2)} dB loss)`;

    return { boost, label };
}
