export const antennaRegistry = {
  // Flowerpot (has module + diagram, but NO JSON)
  flowerpot: {
    label: "Flowerpot (T2LT)",
    module: () => import("../modules/module-flowerpot.js"),
    json: null, // no JSON exists
    diagram: () => import("../ui/diagrams/flowerpot-diagram.js")
  },

  // Inverted V (has module + JSON)
  invertedV: {
    label: "Inverted V",
    module: () => import("../modules/module-inverted-v.js"),
    json: () => import("../content/antennas/inverted-v.json", { assert: { type: "json" } }),
    diagram: null // no diagram exists
  },

  // G5RV (has module + JSON)
  g5rv: {
    label: "G5RV",
    module: () => import("../modules/module-g5rv.js"),
    json: () => import("../content/antennas/g5rv.json", { assert: { type: "json" } }),
    diagram: null
  },

  // Ground Plane (has module + JSON)
  groundPlane: {
    label: "Ground Plane",
    module: () => import("../modules/module-ground-plane.js"),
    json: () => import("../content/antennas/ground-plane.json", { assert: { type: "json" } }),
    diagram: null
  },

  // Horizontal Loop (has module + JSON)
  horizontalLoop: {
    label: "Horizontal Loop",
    module: () => import("../modules/module-horizontal-loop.js"),
    json: () => import("../content/antennas/horizontal-loop.json", { assert: { type: "json" } }),
    diagram: null
  },

  // Magnetic Loop (has module + JSON)
  magneticLoop: {
    label: "Magnetic Loop",
    module: () => import("../modules/module-magnetic-loop.js"),
    json: () => import("../content/antennas/magnetic-loop.json", { assert: { type: "json" } }),
    diagram: null
  },

  // Hex Beam (has module + JSON)
  hexBeam: {
    label: "Hex Beam",
    module: () => import("../modules/module-hex-beam.js"),
    json: () => import("../content/antennas/hex-beam.json", { assert: { type: "json" } }),
    diagram: null
  },

  // Discone (has module + JSON)
  discone: {
    label: "Discone",
    module: () => import("../modules/module-discone.js"),
    json: () => import("../content/antennas/discone.json", { assert: { type: "json" } }),
    diagram: null
  }
};
