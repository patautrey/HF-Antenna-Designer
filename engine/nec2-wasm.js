let necModule = null;

export async function loadNEC() {
  if (!necModule) {
    necModule = await import("./nec2-wasm-core.js");
  }
  return necModule;
}

export async function runNEC(deck) {
  const nec = await loadNEC();
  const output = nec.run(deck);
  return output;
}
