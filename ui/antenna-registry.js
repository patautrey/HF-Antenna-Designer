export const antennaRegistry = {
  flowerpot: {
    label: "Flowerpot (T2LT)",
    module: () => import("../modules/module-flowerpot.js"),
    json: null,
    params: { frequencyMHz: 7.1 },
    diagram: () => import("../ui/diagrams/flowerpot-diagram.js")
  },

  invertedV: {
    label: "Inverted V",
    module: () => import("../modules/module-inverted-v.js"),
    json: "./content/antennas/inverted-v.json",
    params: { frequencyMHz: 7.1 },
    diagram: null
  }
};
