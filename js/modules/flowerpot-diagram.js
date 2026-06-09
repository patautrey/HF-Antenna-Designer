/* ---------------------------------------------------------
   HF Workbench — Flowerpot Coaxial Diagram (T2LT)
   - Classic coaxial sleeve vertical (no radials)
   - Dimensional diagram generator
   - Geometry engine for wavelength + fractional length
   - Summary panel with construction notes
--------------------------------------------------------- */

import { requireFrequency, requirePositive, toNumber } from "../validators.js";
import { infoBox, warnBox } from "../dom.js";
import { findBand } from "../constants.js";
import { GeometryEngine } from "../engines/geometry-engine.js";

export default function initFlowerpotDiagram(root) {
    const container = document.querySelector("#content") || root;
    if (!container) return;

    container.innerHTML = `
        <section class="tool">
            <h2>Flowerpot Coaxial — Diagram</h2>

            <h3>Dimensions</h3>
            <div class="field-grid">

                <label>Frequency (MHz)
                    <input id="fpd-freq" type="number" step="0.01" value="146.52">
                </label>

                <label>Radiator length (m)
                    <input id="fpd-rad" type="number" step="0.01" value="0.49">
                </label>

                <label>Sleeve length (m)
                    <input id="fpd-sleeve" type="number" step="0.01" value="0.49">
                </label>

                <label>Base height (m)
                    <input id="fpd-height" type="number" step="0.1" value="2.0">
                </label>

            </div>

            <button id="fpd-compute" style="margin-top:1rem;">Generate Diagram</button>

            <div id="fpd-summary" class="summary" style="margin-top:1rem;"></div>

        </section>
    `;

    const freqInput = document.getElementById("fpd-freq");
    const radInput = document.getElementById("fpd-rad");
    const sleeveInput = document.getElementById("fpd-sleeve");
    const heightInput = document.getElementById("fpd-height");

    const summaryDiv = document.getElementById("fpd-summary");
    const button = document.getElementById("fpd-compute");

    button.addEventListener("click", () => {

        const errors = [];

        const freq = toNumber(freqInput.value);
        const rad = toNumber(radInput.value);
        const sleeve = toNumber(sleeveInput.value);
        const height = toNumber(heightInput.value);

        requireFrequency(freq, errors);
        requirePositive(rad, "Radiator length", errors);
        requirePositive(sleeve, "Sleeve length", errors);
        requirePositive(height, "Base height", errors);

        if (errors.length) {
            summaryDiv.innerHTML = warnBox(errors.join("<br>"));
            return;
        }

        const band = findBand(freq);

        const geom = GeometryEngine.computeGeometry({
            freqMHz: freq,
            heightM: height,
            spanM: rad + sleeve
        });

        const wavelength = (300 / freq);
        const radiatorFrac = rad / wavelength;
        const sleeveFrac = sleeve / wavelength;

        const diagramLines = [
            `Frequency: ${freq.toFixed(2)} MHz`,
            `Wavelength: ${wavelength.toFixed(3)} m`,
            `Radiator length: ${rad.toFixed(2)} m (${(radiatorFrac * 100).toFixed(1)}% λ)`,
            `Sleeve length: ${sleeve.toFixed(2)} m (${(sleeveFrac * 100).toFixed(1)}% λ)`,
            `Total span: ${(rad + sleeve).toFixed(2)} m`,
            `Base height: ${height.toFixed(2)} m`,
            `Feedpoint: Bottom of sleeve`,
            `Choke: At feedpoint (1:1 current choke)`
        ];

        const notes = [
            `The Flowerpot (T2LT) is a coaxial sleeve vertical.`,
            `The inner conductor forms the radiator.`,
            `The outer braid forms the sleeve (counterpoise).`,
            `A choke is required at the feedpoint to prevent feedline radiation.`,
            `No radials are used in the classic design.`,
            `Sleeve and radiator lengths may require trimming for best SWR.`
        ];

        summaryDiv.innerHTML = `
            ${infoBox(`
                <strong>Band:</strong> ${band.name}<br>
                <strong>Total length:</strong> ${(rad + sleeve).toFixed(2)} m<br>
                <strong>Wavelength:</strong> ${wavelength.toFixed(3)} m
            `)}

            <h4>Diagram Data</h4>
            <ul>${diagramLines.map(x => `<li>${x}</li>`).join("")}</ul>

            <h4>Construction Notes</h4>
            <ul>${notes.map(x => `<li>${x}</li>`).join("")}</ul>
        `;
    });
}
