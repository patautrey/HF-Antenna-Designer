export function renderNECEditor(container, initialDeck, onRun) {
  container.innerHTML = `
    <h3>NEC Input Deck</h3>
    <textarea id="necEditor" style="width:100%;height:300px;font-family:monospace;">
${initialDeck}
    </textarea>
    <button id="runNEC">Run Simulation</button>
    <pre id="necErrors" style="color:red;"></pre>
  `;

  document.getElementById("runNEC").onclick = () => {
    const deck = document.getElementById("necEditor").value;
    onRun(deck);
  };
}
