import { antennaRegistry } from "./antenna-registry.js";

export async function loadAntenna(name) {
  const entry = antennaRegistry[name];
  if (!entry) throw new Error(`Unknown antenna: ${name}`);

  // Load module
  const modulePromise = entry.module();

  // Load JSON via fetch
  const jsonPromise = entry.json
    ? fetch(entry.json).then(r => r.json()).catch(() => null)
    : Promise.resolve(null);

  // Load diagram
  const diagramPromise = entry.diagram ? entry.diagram() : Promise.resolve(null);

  const [module, json, diagram] = await Promise.all([
    modulePromise,
    jsonPromise,
    diagramPromise
  ]);

  // Run calculation
  const output =
    module && module.default
      ? module.default(entry.params || {})
      : null;

  return {
    name,
    json,
    diagram: diagram ? (diagram.default || diagram) : null,
    output
  };
}
