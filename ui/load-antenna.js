// /ui/load-antenna.js
import { antennaRegistry } from "./antenna-registry.js";
import { visualizeAntenna } from "./visualize-antenna.js";
import { parseNecOutput } from "./parse-nec-output.js";
import { plotSWR } from "./plot-swr.js";
import { renderAntenna3D } from "./antenna-3d.js";

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
  button.type = "submit";
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
    <pre id="necText">${deck}</pre>
    <button id="downloadNecBtn">Download NEC Deck</button>
    <button id="plotSWRBtn">Plot SWR Curve</button>
    <button id="view3DBtn">Show 3D View</button>
    <h3>Antenna Geometry</h3>
  `;

  const viz = visualizeAntenna(deck);
  deckSection.appendChild(viz);

  document.getElementById("downloadNecBtn").addEventListener("click", () => {
    const blob = new Blob([deck], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${id}.nec`;
    a.click();
    URL.revokeObjectURL(url);
  });

  const swrDiv = document.createElement("div");
  swrDiv.id = "swrPlot";
  deckSection.appendChild(swrDiv);
  document.getElementById("plotSWRBtn").addEventListener("click", () => {
    plotSWR(entry.generateDeck, params, swrDiv);
  });

  const viewer3D = document.createElement("div");
  viewer3D.id = "viewer3D";
  deckSection.appendChild(viewer3D);
  document.getElementById("view3DBtn").addEventListener("click", () => {
    renderAntenna3D(deck, viewer3D);
  });
}

select.addEventListener("change", e => loadAntenna(e.target.value));
populateDropdown();
