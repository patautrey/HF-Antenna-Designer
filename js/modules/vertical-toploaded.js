/* ---------------------------------------------------------
   HF Workbench — Top‑Loaded Vertical (Shortened Vertical)
   - Geometry panel
   - Unified boost panel (two-column .boost-grid)
   - Loading coil OR capacity hat
   - Feedline family + type + length
   - Transformer Requirements (matching network + 1:1 choke)
--------------------------------------------------------- */

import { requireFrequency, requirePositive, toNumber } from "../validators.js";
import { infoBox, warnBox } from "../dom.js";
import { findBand } from "../constants.js";
import { log } from "../log.js";
import { GeometryEngine } from "../engines/geometry-engine.js";
import { BoostEngine } from "../engines/boost-engine.js";
import { TransformerEngine } from "../engines/transformer-engine.js";

function baseTopLoadedGain(frac) {
    if (frac < 0.40) return 1.2;
    if (frac < 0.60) return 1.6;
    if (frac < 0.80) return 1.9;
    return 2.1;
}

export default function initVerticalTopLoaded(root) {
    const container = document.querySelector("#content") || root;
    if (!container) return;

    container.innerHTML = `
        <section class="tool">
            <h2>Top‑Loaded Vertical</h2>

            <h3>Geometry</h3>
            <div class="field-grid">

                <label>Frequency (MHz)
                    <input id="vt-freq" type="number" step="0.01" value="7.1">
                </label>

                <label>Physical radiator length (m)
                    <input id="vt-length" type="number" step="0.1" value="8.0">
                </label>

                <label>Base height (m)
                    <input id="vt-height" type="number" step="0.5" value="2">
                </label>

                <label>Top‑loading type
                    <select id="vt-loadtype">
                        <option value="coil">Loading coil</option>
                        <option value="hat">Capacity hat</option>
                    </select>
                </label>

                <label>Loading value (µH or m)
                    <input id="vt-loadval" type="number" step="0.1" value="5">
                </label>

            </div>

            <h3>Boost</h3>
            <div class="field-grid boost-grid">

                <label>Time of day
                    <select id="vt-tod">
                        <option value="day">Day</option>
                        <option value="night">Night</option>
                        <option value="dawn">Dawn</option>
                        <option value="dusk">Dusk</option>
                    </select>
                </label>

                <label><input id="vt-seaside" type="checkbox"> Seaside (+10 dB)</label>
                <label><input id="vt-groundscreen" type="checkbox"> Ground Screen / Faraday Cloth</label>
                <label><input id="vt-elevated" type="checkbox"> Elevated Base / Supports</label>

                <label>Feedline family
                    <select id="vt-feed-family">
                        <option value="coax">Coax</option>
                        <option value="ladder">Ladder line</option>
                    </select>
                </label>

                <label>Feedline type
                    <select id="vt-feed-type">
                        <option value="RG-213">RG-213</option>
                        <option value="LMR-400">LMR-400</option>
                        <option value="RG-8X">RG-8X</option>
                        <option value="RG-58">RG-58</option>
                        <option value="450Ω">450Ω window line</option>
                        <option value="300Ω">300Ω twin-lead</option>
                        <option value="600Ω">600Ω open wire</option>
                    </select>
                </label>

                <label>Feedline length (ft)
                    <input id="vt-feed-length" type="number" step="5" value="75">
                </label>

            </div>

            <button id="vt-compute" style="margin-top:1rem;">Compute Top‑Loaded Vertical</button>

            <div id="vt-summary" class="summary" style="margin-top:1rem;"></div>

        </section>
    `;

    const freqInput = document.getElementById("vt-freq");
    const lengthInput = document.getElementById("vt-length");
    const heightInput = document.getElementById("vt-height");
    const loadTypeInput = document.getElementById("vt-loadtype");
    const loadValInput = document.getElementById("vt-loadval");

    const todInput = document.getElementById("vt-tod");
    const seasideInput = document.getElementById("vt-seaside");
    const groundScreenInput = document.getElementById("vt-groundscreen");
    const elevatedInput = document.getElementById("vt-elevated");

    const feedFamilyInput = document.getElementById("vt-feed-family");
    const feedTypeInput = document.getElementById("vt-feed-type");
    const feedLenInput = document.getElementById("vt-feed-length");

    const summaryDiv = document.getElementById("vt-summary");
    const button = document.getElementById("vt-compute");

    button.addEventListener("click", () => {

        const errors = [];

        const freq = toNumber(freqInput.value);
        const length = toNumber(lengthInput.value);
        const height = toNumber(heightInput.value);
        const loadType = loadTypeInput.value;
        const loadVal = toNumber(loadValInput.value);

        requireFrequency(freq, errors);
        requirePositive(length, "Radiator length", errors);
        requirePositive(height, "Base height", errors);
        requirePositive(loadVal, "Loading value", errors);

        if (errors.length) {
            summaryDiv.innerHTML = warnBox(errors.join("<br>"));
            return;
        }

        const band = findBand(freq);

        // Effective electrical length boost from loading
        const effectiveSpan =
            loadType === "coil"
                ? length * 1.15
                : length + loadVal;

        const geom = GeometryEngine.computeGeometry({
            freqMHz: freq,
            heightM: height,
            spanM: effectiveSpan
        });

        const baseGain = baseTopLoadedGain(geom.frac);

        const feedFamily = feedFamilyInput.value === "ladder" ? "ladder" : "coax";

        const boost = BoostEngine.computeBoost({
            reflectorCount: 0,
            directorCount: 0,
            timeOfDay: todInput.value,
            seaside: seasideInput.checked,
            groundScreen: groundScreenInput.checked,
            elevatedRadials: elevatedInput.checked,
            nvisReflector: false,
            feedlineFamily: feedFamily,
            feedlineType: feedTypeInput.value,
            feedlineLengthFt: toNumber(feedLenInput.value),
            dxTurboPatternBonus
