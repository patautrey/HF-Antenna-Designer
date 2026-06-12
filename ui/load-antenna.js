import { antennaRegistry } from "./antenna-registry.js";

export async function loadAntenna(name) {
  const entry = antennaRegistry[name];
  if (!entry) throw new Error(`Unknown antenna: ${name}`);

  // Load module
  const modulePromise = entry.module();

  // Load JSON via fetch instead of import()
  const jsonPromise = entry.json
    ? fetch(entry.json)
        .then(r => r.json())
        .catch(() => null)
    : Promise.resolve(null);

  // Load diagram
  const diagramPromise = entry.diagram ? entry.diagram() : Promise.resolve(null);

  const [module, json, diagram] = await Promise.all([
    modulePromise,
    jsonPromise,
    diagramPromise
  ]);

  return {
    name,
    module: module.default || module,
    json,
    diagram: diagram ? (diagram.default || diagram) : null
  };
}
