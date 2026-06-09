/* ---------------------------------------------------------
   HF Workbench — Flowerpot Coaxial Build Sheet (T2LT)
   - Classic coaxial sleeve vertical (no radials)
   - Generates cut list + materials + construction notes
   - Uses GeometryEngine for wavelength + fractional lengths
--------------------------------------------------------- */

import { requireFrequency, requirePositive, toNumber } from "../validators.js";
import { infoBox, warnBox } from "../dom.js";
import { findBand } from "../constants.js";
import { GeometryEngine } from "../engines/geometry-engine.js";

export default function initFlowerpotBuildSheet(root) {
    const container = document.querySelector("#content") || root;
    if (!container) return;

    container.innerHTML = `
        <section class="tool">
            <h2>Flowerpot Coaxial — Build Sheet</h2>

            <h3>Dimensions</h3>
            <div class="field-grid">

                <label>Frequency (MHz)
                    <input id="fpb-freq" type="number" step="0.01" value="146.52">
                </label>

                <label>Radiator length (m)
                    <input id="fpb-rad" type="number" step="0.01" value="0.49">
                </label>

                <label>Sleeve length (m)
                    <input id="fpb-sleeve" type="number" step="0.01" value="0.49">
                </label>

                <label>Base height (m)
                    <input id="fpb-height" type="number" step="0.1" value="2.0">
                </label>

                <label>Coax type
                    <select id="fpb-coax">
                        <option value="RG-58">RG-58</option>
                        <option value="RG-8X">RG-8X</option>
                        <option value="RG-213">RG-213</option>
                        <option value="LMR-240">LMR-240</option>
                        <option value="LMR-400">LMR-400</option>
                    </select>
                </label>

            </div>

            <button id="fpb-compute" style="margin-top:1rem;">Generate Build Sheet</button>

            <div id="fpb-summary" class="summary" style="margin-top:1rem;"></div>

        </section>
    `;

    const freqInput = document.getElementById("fpb-freq");
    const radInput = document.getElementById("fpb-rad");
    const sleeveInput = document.getElementById("fpb-sleeve");
    const heightInput = document.getElementById("fpb-height");
    const coaxInput = document.getElementById("fpb-coax");

    const summaryDiv = document.getElementById("fpb-summary");
    const button = document.getElementById("fpb-compute");

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

        const coaxType = coaxInput.value;

        const cutList = [
            `Cut radiator to: ${rad.toFixed(2)} m`,
            `Cut sleeve to: ${sleeve.toFixed(2)} m`,
            `Total coax length required: ${(rad + sleeve + 0.5).toFixed(2)} m (includes 0.5 m working allowance)`,
            `Choke placement: At feedpoint (bottom of sleeve)`,
            `Base height: ${height.toFixed(2)} m`
        ];

        const materials = [
            `${coaxType} coax — ${(rad + sleeve + 0.5).toFixed(2)} m`,
            `Heatshrink tubing (for choke + sleeve junction)`,
            `Zip ties or tape for strain relief`,
            `Optional: PVC support mast (20–25 mm OD)`,
            `Optional: Weatherproofing tape`
        ];

        const notes = [
            `The Flowerpot (T2LT) uses the inner conductor as the radiator.`,
            `The outer braid forms the sleeve (counterpoise).`,
            `A 1:1 choke is required at the feedpoint to prevent feedline radiation.`,
            `Trim radiator and sleeve lengths for best SWR.`,
            `PVC support mast improves stability but is not required.`,
            `Sleeve and radiator lengths may vary slightly with coax velocity factor.`
        ];

        summaryDiv.innerHTML = `
            ${infoBox(`
                <strong>Band:</strong> ${band.name}<br>
                <strong>Total length:</strong> ${(rad + sleeve).toFixed(2)} m<br>
                <strong>Wavelength:</strong> ${wavelength.toFixed(3)} m
            `)}

            <h4>Cut List</h4>
            <ul>${cutList.map(x => `<li>${x}</li>`).join("")}</ul>

            <h4>Materials</h4>
            <ul>${materials.map(x => `<li>${x}</li>`).join("")}</ul>

            <h4>Construction Notes</h4>
            <ul>${notes.map(x => `<li>${x}</li>`).join("")}</ul>
        `;
    });
}
