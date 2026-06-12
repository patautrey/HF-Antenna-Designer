export const antennaRegistry = {
  flowerpot: {
    label: "Flowerpot (T2LT)",
    module: () => import("../modules/module-flowerpot.js"),
    json: null,
    diagram: () => import("../ui/diagrams/flowerpot-diagram.js")
  },

  invertedV: {
    label: "Inverted V",
    module: () => import("../modules/module-inverted-v.js"),
    json: "./content/antennas/inverted-v.json",
    diagram: null
  }
};
