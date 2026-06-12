import { antennaRegistry } from "./antenna-registry.js";

export async function loadAntenna(name) {
  const entry = antennaRegistry[name];
  if (!entry) {
    throw new Error(`Unknown antenna: ${name}`);
  }

  const modulePromise = entry.module();
  const jsonPromise = entry.json ? entry.json() : Promise.resolve(null);
  const diagramPromise = entry.diagram ? entry.diagram() : Promise.resolve(null);

  const [module, json, diagram] = await Promise.all([
    modulePromise,
    jsonPromise,
    diagramPromise
  ]);

  return {
    name,
    module: module.default || module,
    json: json ? (json.default || json) : null,
    diagram: diagram ? (diagram.default || diagram) : null
  };
}
