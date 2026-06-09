/* ---------------------------------------------------------
   HF Workbench — Flowerpot Coaxial Multiband Designer (T2LT)
   - Classic coaxial sleeve vertical (no radials)
   - Computes radiator + sleeve lengths for multiple bands
   - Harmonic operation support
   - Geometry engine for wavelength + fractional lengths
--------------------------------------------------------- */

import { requireFrequency, requirePositive, toNumber } from "../validators.js";
import { infoBox, warnBox } from "../dom.js";
import { findBand } from "../constants.js";
import { GeometryEngine } from "../engines/geometry-engine.js";

export default function initFlowerpotMultiband(root) {
    const container = document.querySelector("#content") || root;
    if (!container) return;

    container.innerHTML = `
        <section class="tool">
            <h2>Flowerpot Coaxial — Multiband Designer</h2>

            <h3>Primary Band</h3>
            <div class="field-grid">

                <label>Primary frequency (MHz)
                    <input id="fpm-freq" type="number" step="0.01" value="146.52">
                </label>

                <label>Radiator length (m)
                    <input id="fpm-rad" type="number" step="0.01" value="0.49">
                </label>

                <label>Sleeve length (m)
                    <input id="fpm-sleeve" type="number" step="0.01" value="0.49">
                </label>

                <label>Base height (m)
                    <input id="fpm-height" type="number" step="0.1" value="2.0">
                </label>

            </div>

            <h3>Additional Bands</h3>
            <div class="field-grid">

                <label>Band 2 (MHz)
                    <input id="fpm-b2" type="number" step="0.01" value="223.5">
                </label>

                <label>Band 3 (MHz)
                    <input id="fpm-b3" type="number" step="0.01" value="446.0">
                </label>

                <label>Band 4 (MHz)
                    <input id="fpm-b4" type="number" step="0.01" value="">
                </label>

            </div>

            <button id="fpm-compute" style="margin-top:1rem;">Compute Multiband Design</button>

            <div id="fpm-summary" class="summary" style="margin-top:1rem;"></div>

        </section>
    `;

    const freqInput = document.getElementById("fpm-freq");
    const radInput = document.getElementById("fpm-rad");
    const sleeveInput = document.getElementById("fpm-sleeve");
    const heightInput = document.getElementById("fpm-height");

    const b2Input = document.getElementById("fpm-b2");
    const b3Input = document.getElementById("fpm-b3");
    const b4Input = document.getElementById("fpm-b4");

    const summaryDiv = document.getElementById("fpm-summary");
    const button = document.getElementById("fpm-compute");

    button.addEventListener("click", () => {

        const errors = [];

        const freq = toNumber(freqInput.value);
        const rad = toNumber(radInput.value);
        const sleeve = toNumber(sleeveInput.value);
        const height = toNumber(heightInput.value);

        const b2 = toNumber(b2Input.value);
        const b3 = toNumber(b3Input.value);
        const b4 = toNumber(b4Input.value);

        requireFrequency(freq, errors);
        requirePositive(rad, "Radiator length", errors);
        requirePositive(sleeve, "Sleeve length", errors);
        requirePositive(height, "Base height", errors);

        const bands = [freq, b2, b3, b4].filter(x => x > 0);
        if (!bands.length) errors.push("At least one band must be specified.");

        if (errors.length) {
            summaryDiv.innerHTML = warnBox(errors.join("<br>"));
            return;
        }

        const primaryBand = findBand(freq);

        const primaryGeom = GeometryEngine.computeGeometry({
            freqMHz: freq,
            heightM: height,
            spanM: rad + sleeve
        });

        const wavelengthPrimary = (300 / freq);

        const bandData = bands.map(f => {
            const wl = 300 / f;
            return {
                freq: f,
                band: findBand(f).name,
                wavelength: wl,
                radiator: wl / 4,
                sleeve: wl / 4,
                total: wl / 2
            };
        });

        const bandLines = bandData.map(b => `
            <li>
                <strong>${b.freq.toFixed(2)} MHz (${b.band})</strong><br>
                Radiator: ${b.radiator.toFixed(3)} m<br>
                Sleeve: ${b.sleeve.toFixed(3)} m<br>
                Total span: ${b.total.toFixed(3)} m
            </li>
        `).join("");

        const notes = [
            "The Flowerpot (T2LT) operates well on odd harmonics.",
            "Each band requires its own radiator + sleeve pair for optimal SWR.",
            "A common feedpoint and choke can serve all bands.",
            "Lengths may require trimming depending on coax velocity factor.",
            "Bands far apart in frequency may require separate sleeves."
        ];

        summaryDiv.innerHTML = `
            ${infoBox(`
                <strong>Primary band:</strong> ${primaryBand.name}<br>
                <strong>Primary wavelength:</strong> ${wavelengthPrimary.toFixed(3)} m<br>
                <strong>Base height:</strong> ${height.toFixed(2)} m
            `)}

            <h4>Multiband Geometry</h4>
            <ul>${bandLines}</ul>

            <h4>Notes</h4>
            <ul>${notes.map(x => `<li>${x}</li>`).join("")}</ul>
        `;
    });
}
