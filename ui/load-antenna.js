// /ui/load-antenna.js

import { antennaRegistry } from "./antenna-registry.js";

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

async function loadAntenna(id) {
  const entry = antennaRegistry[id];
  if (!entry) {
    deckSection.textContent = "Error: antenna not found.";
    return;
  }

  const module = entry;
  paramsSection.innerHTML = `
    <h2>${module.name}</h2>
    <p>${module.description}</p>
  `;

  const deck = module.generateDeck(module.paramsSchema);
  deckSection.innerHTML = `
    <h3>NEC Input Deck</h3>
    <pre>${deck}</pre>
  `;
}

select.addEventListener("change", e => loadAntenna(e.target.value));
populateDropdown();
