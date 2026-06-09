/* ---------------------------------------------------------
   HF Workbench — Flowerpot Coaxial (T2LT)
   - Classic coaxial sleeve vertical (no radials)
   - Geometry panel
   - Unified boost panel (two-column .boost-grid)
   - Feedline family + type + length
   - Transformer Requirements (1:1 choke)
   - Seaside boost = +10 dB
--------------------------------------------------------- */

import { requireFrequency, requirePositive, toNumber } from "../validators.js";
import { infoBox, warnBox } from "../dom.js";
import { findBand } from "../constants.js";
import { log } from "../log.js";
import { GeometryEngine } from "../engines/geometry-engine.js";
import { BoostEngine } from "../engines/boost-engine.js";
import { TransformerEngine } from "../engines/transformer-engine.js";

export default function initFlowerpotCoaxial(root) {
    const container = document.querySelector("#content") || root;
    if (!container) return;

    container.innerHTML = `
        <section class="tool">
            <h2>Flowerpot Coaxial (T2LT)</h2>

            <h3>Geometry</h3>
            <div class="field-grid">

                <label>Frequency (MHz)
                    <input id="fp-freq" type="number" step="0.01" value="146.52">
                </label>

                <label>Radiator length (m)
                    <input id="fp-rad" type="number" step="0.01" value="0.49">
                </label>

                <label>Sleeve length (m)
                    <input id="fp-sleeve" type="number" step="0.01" value="0.49">
                </label>

                <label>Base height (m)
                    <input id="fp-height" type="number" step="0.1" value="2.0">
                </label>

            </div>

            <h3>Boost</h3>
            <div class="field-grid boost-grid">

                <label>Time of day
                    <select id="fp-tod">
                        <option value="day">Day</option>
                        <option value="night">Night</option>
                        <option value="dawn">Dawn</option>
                        <option value="dusk">Dusk</option>
                    </select>
                </label>

                <label><input id="fp-seaside" type="checkbox"> Seaside (+10 dB)</label>
                <label><input id="fp-groundscreen" type="checkbox"> Ground Screen / Faraday Cloth</label>

                <label>Feedline family
                    <select id="fp-feed-family">
                        <option value="coax">Coax</option>
                        <option value="ladder">Ladder line</option>
                    </select>
                </label>

                <label>Feedline type
                    <select id="fp-feed-type">
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
                    <input id="fp-feed-length" type="number" step="5" value="50">
                </label>

            </div>

            <button id="fp-compute" style="margin-top:1rem;">Compute Flowerpot Coaxial</button>

            <div id="fp-summary" class="summary" style="margin-top:1rem;"></div>

        </section>
    `;

    const freqInput = document.getElementById("fp-freq");
    const radInput = document.getElementById("fp-rad");
    const sleeveInput = document.getElementById("fp-sleeve");
    const heightInput = document.getElementById("fp-height");

    const todInput = document.getElementById("fp-tod");
    const seasideInput = document.getElementById("fp-seaside");
    const groundScreenInput = document.getElementById("fp-groundscreen");

    const feedFamilyInput = document.getElementById("fp-feed-family");
    const feedTypeInput = document.getElementById("fp-feed-type");
    const feedLenInput = document.getElementById("fp-feed-length");

    const summaryDiv = document.getElementById("fp-summary");
    const button = document.getElementById("fp-compute");

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

        // Base gain for a coaxial sleeve vertical (Flowerpot)
        const baseGain = 2.1; // typical 1/2-wave vertical gain

        const feedFamily = feedFamilyInput.value === "ladder" ? "ladder" : "coax";

        const boost = BoostEngine.computeBoost({
            reflectorCount: 0,
            directorCount: 0,
            timeOfDay: todInput.value,
            seaside: seasideInput.checked,
            groundScreen: groundScreenInput.checked,
            elevatedRadials: false, // Classic Flowerpot has no radials
            nvisReflector: false,
            feedlineFamily: feedFamily,
            feedlineType: feedTypeInput.value,
            feedlineLengthFt: toNumber(feedLenInput.value),
            dxTurboPatternBonus: false
        });

        const totalGain = baseGain + geom.totalGeomGainDelta + boost.totalBoost;
        const finalToa = Math.max(8, Math.min(55, geom.toa + boost.toaShift));

        const geomLines = [
            `Radiator length: ${rad.toFixed(2)} m`,
            `Sleeve length: ${sleeve.toFixed(2)} m`,
            `Total span: ${(rad + sleeve).toFixed(2)} m`,
            `Base height: ${height.toFixed(2)} m`,
            ...(geom.components.length ? geom.components : [])
        ];

        const boostLines = [
            `Seaside: ${seasideInput.checked ? "Yes (+10 dB)" : "No"}`,
            `Ground screen: ${groundScreenInput.checked ? "Yes" : "No"}`,
            `Time of day: ${todInput.value}`,
            `Feedline: ${feedFamilyInput.value} (${feedTypeInput.value}), ${feedLenInput.value} ft`
        ];

        const transformer = TransformerEngine.computeTransformer({
            feedlineFamily: feedFamily,
            feedlineType: feedTypeInput.value,
            feedlineLengthFt: toNumber(feedLenInput.value),
            targetImpedance: 50
        });

        summaryDiv.innerHTML = `
            ${infoBox(`
                <strong>Band:</strong> ${band.name}<br>
                <strong>Base gain:</strong> ${baseGain.toFixed(2)} dBi<br>
                <strong>Total gain:</strong> ${totalGain.toFixed(2)} dBi<br>
                <strong>Takeoff angle:</strong> ${finalToa.toFixed(1)}°
            `)}

            <h4>Geometry</h4>
            <ul>${geomLines.map(x => `<li>${x}</li>`).join("")}</ul>

            <h4>Boost</h4>
            <ul>${boostLines.map(x => `<li>${x}</li>`).join("")}</ul>

            <h4>Transformer / Choke</h4>
            <ul>
                <li>Recommended: 1:1 choke balun at feedpoint</li>
                <li>${transformer.summary}</li>
            </ul>
        `;
    });
}
