/* ---------------------------------------------------------
   HF Workbench — 5/8‑Wave Vertical
   - Geometry panel
   - Unified boost panel (two-column .boost-grid)
   - Radial system (optional)
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

function baseFiveEighthGain(frac) {
    if (frac < 0.40) return 2.5;
    if (frac < 0.60) return 3.0;
    if (frac < 0.80) return 3.4;
    return 3.6;
}

export default function initVerticalFiveEighth(root) {
    const container = document.querySelector("#content") || root;
    if (!container) return;

    container.innerHTML = `
        <section class="tool">
            <h2>5/8‑Wave Vertical</h2>

            <h3>Geometry</h3>
            <div class="field-grid">

                <label>Frequency (MHz)
                    <input id="v58-freq" type="number" step="0.01" value="14.2">
                </label>

                <label>Radiator length (m)
                    <input id="v58-length" type="number" step="0.1" value="12.5">
                </label>

                <label>Base height (m)
                    <input id="v58-height" type="number" step="0.5" value="2">
                </label>

                <label>Radial count (0–32)
                    <input id="v58-radials" type="number" min="0" max="32" step="1" value="4">
                </label>

                <label>Radial length (m)
                    <input id="v58-radlen" type="number" step="0.1" value="5.0">
                </label>

            </div>

            <h3>Boost</h3>
            <div class="field-grid boost-grid">

                <label>Time of day
                    <select id="v58-tod">
                        <option value="day">Day</option>
                        <option value="night">Night</option>
                        <option value="dawn">Dawn</option>
                        <option value="dusk">Dusk</option>
                    </select>
                </label>

                <label><input id="v58-seaside" type="checkbox"> Seaside (+10 dB)</label>
                <label><input id="v58-groundscreen" type="checkbox"> Ground Screen / Faraday Cloth</label>
                <label><input id="v58-elevated" type="checkbox"> Elevated Radials</label>

                <label>Feedline family
                    <select id="v58-feed-family">
                        <option value="coax">Coax</option>
                        <option value="ladder">Ladder line</option>
                    </select>
                </label>

                <label>Feedline type
                    <select id="v58-feed-type">
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
                    <input id="v58-feed-length" type="number" step="5" value="75">
                </label>

            </div>

            <button id="v58-compute" style="margin-top:1rem;">Compute 5/8‑Wave Vertical</button>

            <div id="v58-summary" class="summary" style="margin-top:1rem;"></div>

        </section>
    `;

    const freqInput = document.getElementById("v58-freq");
    const lengthInput = document.getElementById("v58-length");
    const heightInput = document.getElementById("v58-height");
    const radialsInput = document.getElementById("v58-radials");
    const radlenInput = document.getElementById("v58-radlen");

    const todInput = document.getElementById("v58-tod");
    const seasideInput = document.getElementById("v58-seaside");
    const groundScreenInput = document.getElementById("v58-groundscreen");
    const elevatedInput = document.getElementById("v58-elevated");

    const feedFamilyInput = document.getElementById("v58-feed-family");
    const feedTypeInput = document.getElementById("v58-feed-type");
    const feedLenInput = document.getElementById("v58-feed-length");

    const summaryDiv = document.getElementById("v58-summary");
    const button = document.getElementById("v58-compute");

    button.addEventListener("click", () => {

        const errors = [];

        const freq = toNumber(freqInput.value);
        const length = toNumber(lengthInput.value);
        const height = toNumber(heightInput.value);
        const radials = toNumber(radialsInput.value);
        const radlen = toNumber(radlenInput.value);

        requireFrequency(freq, errors);
        requirePositive(length, "Radiator length", errors);
        requirePositive(height, "Base height", errors);
        if (radials > 0) requirePositive(radlen, "Radial length", errors);

        if (radials < 0 || radials > 32) {
            errors.push("Radial count must be between 0 and 32.");
        }

        if (errors.length) {
            summaryDiv.innerHTML = warnBox(errors.join("<br>"));
            return;
        }

        const band = findBand(freq);

        const geom = GeometryEngine.computeGeometry({
            freqMHz: freq,
            heightM: height,
            spanM: length
        });

        const baseGain = baseFiveEighthGain(geom.frac);

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
            dxTurboPatternBonus: false
        });

        const totalGain = baseGain + geom.totalGeomGainDelta + boost.totalBoost;
        const finalToa = Math.max(8, Math.min(55, geom.toa + boost.toaShift));

        const geomLines = [
            `Radiator length: ${length.toFixed(2)} m`,
            `Base height: ${height.toFixed(2)} m`,
            `Radial count: ${radials}`,
            radials > 0 ? `Radial length: ${radlen.toFixed(2)} m` : `Radials: none`,
            ...(geom.components.length ? geom.components
