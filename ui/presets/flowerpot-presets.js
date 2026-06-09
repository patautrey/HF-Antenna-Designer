/* ============================================================
   Flowerpot (T2LT) Antenna — Band Presets
   ============================================================ */

export const FlowerpotPresets = {

    "2m": {
        label: "2m (146 MHz)",
        frequency: 146,
        coaxType: "RG58",
        pvcOD: 25,
        pvcMode: "outside",
        targetReactance: 500
    },

    "70cm": {
        label: "70cm (446 MHz)",
        frequency: 446,
        coaxType: "RG174",
        pvcOD: 20,
        pvcMode: "outside",
        targetReactance: 500
    },

    "6m": {
        label: "6m (52 MHz)",
        frequency: 52,
        coaxType: "RG8X",
        pvcOD: 32,
        pvcMode: "outside",
        targetReactance: 500
    },

    "10m": {
        label: "10m (28.5 MHz)",
        frequency: 28.5,
        coaxType: "RG8X",
        pvcOD: 32,
        pvcMode: "outside",
        targetReactance: 500
    },

    "gmrs": {
        label: "GMRS (462 MHz)",
        frequency: 462,
        coaxType: "RG174",
        pvcOD: 20,
        pvcMode: "outside",
        targetReactance: 500
    },

    "cb": {
        label: "CB (27 MHz)",
        frequency: 27,
        coaxType: "RG8X",
        pvcOD: 32,
        pvcMode: "outside",
        targetReactance: 500
    }
};
