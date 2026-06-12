import { antennaRegistry } from "./antenna-registry.js";

export async function loadAntenna(name) {
  const entry = antennaRegistry[name];
  if (!entry) {
    throw new Error(`Unknown antenna: ${name}`);
  }

  const [module, json, diagram] = await Promise.all([
    entry.module(),
    entry.json(),
    entry.diagram()
  ]);

  return {
    name,
    module: module.default || module,
    json: json.default || json,
    diagram: diagram.default || diagram
  };
}
