// /ui/load-antenna.js

import { antennaRegistry } from "./antenna-registry.js";

export async function loadAntenna(id) {
  const entry = antennaRegistry[id];

  if (!entry) {
    throw new Error(`Antenna '${id}' not found in registry`);
  }

  // NEW: entry IS the module object
  const module = entry;

  return {
    name: module.name,
    description: module.description,
    paramsSchema: module.paramsSchema,
    generateDeck: module.generateDeck,
    modelingNotes: module.modelingNotes || ""
  };
}
