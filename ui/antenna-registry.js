import { generateInvertedVDeck } from "../modules/necgen-inverted-v.js";
import { generateFlowerpotDeck } from "../modules/necgen-flowerpot.js";
import { generateG5RVDeck } from "../modules/necgen-g5rv.js";
import { generateGroundPlaneDeck } from "../modules/necgen-groundplane.js";

export const antennaRegistry = {

  invertedV: {
    label: "Inverted V",
    paramsSchema: {
      frequencyMHz: { label: "Frequency (MHz)", type: "number", default: 7.1 },
      apexHeight: { label: "Apex Height (m)", type: "number", default: 10 },
      legLength: { label: "Leg Length (m)", type: "number", default: 10.556 },
      wireDiameter: { label: "Wire Diameter (m)", type: "number", default: 0.002 },
      angle: { label: "Included Angle (°)", type: "number", default: 120 }
    },
    generateDeck: generateInvertedVDeck
  },

  flowerpot: {
    label: "Flowerpot (T2LT)",
    paramsSchema: {
      frequencyMHz: { label: "Frequency (MHz)", type: "number", default: 27.2 },
      radiatorLength: { label: "Radiator Length (m)", type: "number", default: 3.637 },
      sleeveLength: { label: "Sleeve Length (m)", type: "number", default: 1.819 },
      height: { label: "Height Above Ground (m)", type: "number", default: 5 },
      wireDiameter: { label: "Wire Diameter (m)", type: "number", default: 0.008 }
    },
    generateDeck: generateFlowerpotDeck
  },

  g5rv: {
    label: "G5RV",
    paramsSchema: {
      frequencyMHz: { label: "Frequency (MHz)", type: "number", default: 14.2 },
      totalLength: { label: "Total Length (m)", type: "number", default: 31.1 },
      ladderLine: { label: "Ladder Line Length (m)", type: "number", default: 10.36 },
      height: { label: "Height Above Ground (m)", type: "number", default: 10 },
      wireDiameter: { label: "Wire Diameter (m)", type: "number", default: 0.002 }
    },
    generateDeck: generateG5RVDeck
  },

  groundPlane: {
    label: "1/4‑Wave Ground Plane",
    paramsSchema: {
      frequencyMHz: { label: "Frequency (MHz)", type: "number", default: 28.5 },
      radiatorLength: { label: "Radiator Length (m)", type: "number", default: 2.63 },
      radialLength: { label: "Radial Length (m)", type: "number", default: 2.63 },
      radialAngle: { label: "Radial Angle (°)", type: "number", default: 45 },
      height: { label: "Height Above Ground (m)", type: "number", default: 5 },
      wireDiameter: { label: "Wire Diameter (m)", type: "number", default: 0.002 }
    },
    generateDeck: generateGroundPlaneDeck
  }

};
