export const antennaRegistry = {
  flowerpot: {
    label: "Flowerpot (T2LT)",
    module: () => import("../modules/module-flowerpot.js"),
    json: () => import("../content/antennas/flowerpot.json", { assert: { type: "json" } }),
    diagram: () => import("../ui/diagrams/flowerpot-diagram.js")
  },

  invertedV: {
    label: "Inverted V",
    module: () => import("../modules/module-inverted-v.js"),
    json: () => import("../content/antennas/inverted-v.json", { assert: { type: "json" } }),
    diagram: () => import("../ui/diagrams/inverted-v-diagram.js")
  },

  verticalYagi3: {
    label: "Vertical Yagi (3‑Element)",
    module: () => import("../modules/module-vertical-yagi3.js"),
    json: () => import("../content/antennas/vertical-yagi3.json", { assert: { type: "json" } }),
    diagram: () => import("../ui/diagrams/vertical-yagi3-diagram.js")
  },

  dipole: {
    label: "Dipole",
    module: () => import("../modules/module-dipole.js"),
    json: () => import("../content/antennas/dipole.json", { assert: { type: "json" } }),
    diagram: () => import("../ui/diagrams/dipole-diagram.js")
  },

  endFed: {
    label: "End‑Fed",
    module: () => import("../modules/module-endfed.js"),
    json: () => import("../content/antennas/endfed.json", { assert: { type: "json" } }),
    diagram: () => import("../ui/diagrams/endfed-diagram.js")
  },

  loop: {
    label: "Loop",
    module: () => import("../modules/module-loop.js"),
    json: () => import("../content/antennas/loop.json", { assert: { type: "json" } }),
    diagram: () => import("../ui/diagrams/loop-diagram.js")
  },

  quad: {
    label: "Quad",
    module: () => import("../modules/module-quad.js"),
    json: () => import("../content/antennas/quad.json", { assert: { type: "json" } }),
    diagram: () => import("../ui/diagrams/quad-diagram.js")
  },

  moxon: {
    label: "Moxon",
    module: () => import("../modules/module-moxon.js"),
    json: () => import("../content/antennas/moxon.json", { assert: { type: "json" } }),
    diagram: () => import("../ui/diagrams/moxon-diagram.js")
  }
};
