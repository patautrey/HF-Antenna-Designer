// /ui/load-antenna.js

import { antennaRegistry } from "./antenna-registry.js";
import { visualizeAntenna } from "./visualize-antenna.js";
import { parseNecOutput } from "./parse-nec-output.js";

const select = document.getElementById("antennaSelect");
const paramsSection = document.getElementById("antennaParams");
const deckSection = document.getElementById("necDeck");

function populateDropdown() {
  Object.keys(antennaRegistry).forEach(key => {
    const opt = document.createElement("option");
    opt.value = key;
    opt.textContent = antennaRegistry[key].name;
    select.appendChild(opt);
  });
}

function renderParamsForm(params, antennaId) {
  paramsSection.innerHTML = `
    <h2>${antennaRegistry[antennaId].name}</h2>
    <p>${antennaRegistry[antennaId].description}</p>
    <form id="paramForm"></form>
  `;

  const form = document.getElementById("paramForm");

  Object.keys(params).forEach(key => {
    const label = document.createElement("label");
    label.textContent = key;

    const input = document.createElement("input");
    input.type = "number";
    input.step = "any";
    input.value = params[key];
    input.name = key;

    form.appendChild(label);
    form.appendChild(input);
  });

  const button = document.createElement("button");
  button.type = "submit";   // <-- FIXES DEAD BUTTON
  button.textContent = "Generate NEC Deck";
  form.appendChild(button);

  form.addEventListener("submit", e => {
    e.preventDefault();

    const newParams = {};
    Object.keys(params).forEach(key => {
      newParams[key] = parseFloat(form[key].value);
    });

    loadAntenna(antennaId, newParams);
  });
}

function loadAntenna(id, overrideParams = null) {
  const entry = antennaRegistry[id];
  const params = overrideParams || entry.paramsSchema;

  renderParamsForm(params, id);

  const deck = entry.generateDeck(params);

  deckSection.innerHTML = `
    <h3>NEC Input Deck</h3>
    <pre>${deck}</pre>
    <h3>Antenna Geometry</h3>
  `;

  const viz = visualizeAntenna(deck);
  deckSection.appendChild(viz);

  // --- RESULTS PANEL ---
  const resultsDiv = document.createElement("div");
  resultsDiv.id = "resultsPanel";
  resultsDiv.innerHTML = `
    <h3>Simulation Results</h3>
    <p>Upload a NEC output file (.out) to view gain, impedance, and SWR.</p>
    <input type="file" id="necFileInput" accept=".out,.txt,.nec">
    <div id="parsedResults"></div>
  `;
  deckSection.appendChild(resultsDiv);

  document.getElementById("necFileInput").addEventListener("change", async e => {
    const file = e.target.files[0];
    if (!file) return;

    const text = await file.text();
    const results = parseNecOutput(text);

    document.getElementById("parsedResults").innerHTML = `
      <p><strong>Gain:</strong> ${results.gain ?? "Not found"}</p>
      <p><strong>Impedance:</strong> ${results.impedance ?? "Not found"}</p>
      <p><strong>SWR:</strong> ${results.swr ?? "Not found"}</p>
    `;
  });
}

select.addEventListener("change", e => loadAntenna(e.target.value));
populateDropdown();
