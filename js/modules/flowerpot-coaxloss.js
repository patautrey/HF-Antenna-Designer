/* ---------------------------------------------------------
   HF Workbench — Flowerpot Coaxial Feedline Loss Calculator (T2LT)
   - Classic coaxial sleeve vertical (no radials)
   - Computes feedline loss, delivered power, ERP
   - Includes BoostEngine for consistent modeling
   - Uses GeometryEngine for gain + TOA context
--------------------------------------------------------- */

import { requireFrequency, requirePositive, toNumber } from "../validators.js";
import { infoBox, warnBox } from "../dom.js";
import { findBand } from "../constants.js";
import { GeometryEngine } from "../engines/geometry-engine.js";
import { BoostEngine } from "../engines/boost-engine.js";
import { TransformerEngine } from "../engines/transformer-engine.js";

export default function initFlowerpotCoaxLoss(root) {
    const container = document.querySelector("#content") || root;
    if (!container) return;

    container.innerHTML = `
        <section class="tool">
            <h2>Flowerpot Coaxial — Feedline Loss Calculator</h2>

            <h3>Geometry</h3>
            <div class="field-grid">

                <label>Frequency (MHz)
                    <input id="fpl-freq" type="number" step="0.01" value="146.52">
                </label>

                <label>Radiator length (m)
                    <input id="fpl-rad" type="number" step="0.01" value="0.49">
                </label>

                <label>Sleeve length (m)
                    <input id="fpl-sleeve" type="number" step="0.01" value="0.49">
                </label>

                <label>Base height (m)
                    <input id="fpl-height" type="number" step="0.1" value="2.0">
                </label>

            </div>

            <h3>Feedline</h3>
            <div class="field-grid">

                <label>Feedline family
                    <select id="fpl-feed-family">
                        <option value="coax">Coax</option>
                        <option value="ladder">Ladder line</option>
                    </select>
                </label>

                <label>Feedline type
                    <select id="fpl-feed-type">
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
                    <input id="fpl-feed-length" type="number" step="5" value="50">
                </label>

                <label>Transmit power (W)
                    <input id="fpl-power" type="number" step="1" value="50">
                </label>

            </div>

            <h3>Boost</h3>
            <div class="field-grid boost-grid">

                <label>Time of day
                    <select id="fpl-tod">
                        <option value="day">Day</option>
                        <option value="night">Night</option>
                        <option value="dawn">Dawn</option>
                        <option value="dusk">Dusk</option>
                    </select>
                </label>

                <label><input id="fpl-seaside" type="checkbox"> Seaside (+10 dB)</label>
                <label><input id="fpl-groundscreen" type="checkbox"> Ground Screen / Faraday Cloth</label>

            </div>

            <button id="fpl-compute" style="margin-top:1rem;">Compute Feedline Loss</button>

            <div id="fpl-summary" class="summary" style="margin-top:1rem;"></div>

        </section>
    `;

    const freqInput = document.getElementById("fpl-freq");
    const radInput = document.getElementById("fpl-rad");
    const sleeveInput = document.getElementById("fpl-sleeve");
    const heightInput = document.getElementById("fpl-height");

    const feedFamilyInput = document.getElementById("fpl-feed-family");
    const feedTypeInput = document.getElementById("fpl-feed-type");
    const feedLenInput = document.getElementById("fpl-feed-length");

    const powerInput = document.getElementById("fpl-power");

    const todInput = document.getElementById("fpl-tod");
    const seasideInput = document.getElementById("fpl-seaside");
    const groundScreenInput = document.getElementById("fpl-groundscreen");

    const summaryDiv = document.getElementById("fpl-summary");
    const button = document.getElementById("fpl-compute");

    button.addEventListener("click", () => {

        const errors = [];

        const freq = toNumber(freqInput.value);
        const rad = toNumber(radInput.value);
        const sleeve = toNumber(sleeveInput.value);
        const height = toNumber(heightInput.value);

        const powerW = toNumber(powerInput.value);

        requireFrequency(freq, errors);
        requirePositive(rad, "Radiator length", errors);
        requirePositive(sleeve, "Sleeve length", errors);
        requirePositive(height, "Base height", errors);
        requirePositive(powerW, "Transmit power", errors);

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

        const baseGain = 2.1;

        const feedFamily = feedFamilyInput.value === "ladder" ? "ladder" : "coax";

        const boost = BoostEngine.computeBoost({
            reflectorCount: 0,
            directorCount: 0,
            timeOfDay: todInput.value,
            seaside: seasideInput.checked,
            groundScreen: groundScreenInput.checked,
            elevatedRadials: false,
            nvisReflector: false,
            feedlineFamily: feedFamily,
            feedlineType: feedTypeInput.value,
            feedlineLengthFt: toNumber(feedLenInput.value),
            dxTurboPatternBonus: false
        });

        const transformer = TransformerEngine.computeTransformer({
            feedlineFamily: feedFamily,
            feedlineType: feedTypeInput.value,
            feedlineLengthFt: toNumber(feedLenInput.value),
            targetImpedance: 50
        });

        const feedlineLoss = boost.feedlineLossDb;
        const deliveredPower = powerW * Math.pow(10, -feedlineLoss / 10);

        const totalGain = baseGain + geom.totalGeomGainDelta + boost.totalBoost;
        const erpW = deliveredPower * Math.pow(10, totalGain / 10);

        const lossLines = [
            `Feedline loss: ${feedlineLoss.toFixed(2)} dB`,
            `Transmit power: ${powerW.toFixed(1)} W`,
            `Power delivered to antenna: ${deliveredPower.toFixed(2)} W`,
            `Final gain: ${totalGain.toFixed(2)} dBi`,
            `ERP: ${erpW.toFixed(2)} W`
        ];

        const boostLines = [
            `Seaside: ${seasideInput.checked ? "Yes (+10 dB)" : "No"}`,
            `Ground screen: ${groundScreenInput.checked ? "Yes" : "No"}`,
            `Time of day: ${todInput.value}`,
            `Feedline: ${feedFamilyInput.value} (${feedTypeInput.value}), ${feedLenInput.value} ft`
        ];

        summaryDiv.innerHTML = `
            ${infoBox(`
                <strong>Band:</strong> ${band.name}<br>
                <strong>Feedline loss:</strong> ${feedlineLoss.toFixed(2)} dB<br>
                <strong>Delivered power:</strong> ${deliveredPower.toFixed(2)} W<br>
                <strong>ERP:</strong> ${erpW.toFixed(2)} W
            `)}

            <h4>Feedline Loss</h4>
            <ul>${lossLines.map(x => `<li>${x}</li>`).join("")}</ul>

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
