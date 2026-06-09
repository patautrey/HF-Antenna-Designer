/* ---------------------------------------------------------
   HF Workbench — Flowerpot Coaxial Performance Analyzer (T2LT)
   - Classic coaxial sleeve vertical (no radials)
   - Computes gain, TOA, efficiency, DX score
   - Includes BoostEngine (seaside +10 dB, TOD, ground screen)
   - Includes feedline loss modeling
--------------------------------------------------------- */

import { requireFrequency, requirePositive, toNumber } from "../validators.js";
import { infoBox, warnBox } from "../dom.js";
import { findBand } from "../constants.js";
import { GeometryEngine } from "../engines/geometry-engine.js";
import { BoostEngine } from "../engines/boost-engine.js";
import { TransformerEngine } from "../engines/transformer-engine.js";

export default function initFlowerpotPerformance(root) {
    const container = document.querySelector("#content") || root;
    if (!container) return;

    container.innerHTML = `
        <section class="tool">
            <h2>Flowerpot Coaxial — Performance Analyzer</h2>

            <h3>Geometry</h3>
            <div class="field-grid">

                <label>Frequency (MHz)
                    <input id="fpp-freq" type="number" step="0.01" value="146.52">
                </label>

                <label>Radiator length (m)
                    <input id="fpp-rad" type="number" step="0.01" value="0.49">
                </label>

                <label>Sleeve length (m)
                    <input id="fpp-sleeve" type="number" step="0.01" value="0.49">
                </label>

                <label>Base height (m)
                    <input id="fpp-height" type="number" step="0.1" value="2.0">
                </label>

            </div>

            <h3>Boost</h3>
            <div class="field-grid boost-grid">

                <label>Time of day
                    <select id="fpp-tod">
                        <option value="day">Day</option>
                        <option value="night">Night</option>
                        <option value="dawn">Dawn</option>
                        <option value="dusk">Dusk</option>
                    </select>
                </label>

                <label><input id="fpp-seaside" type="checkbox"> Seaside (+10 dB)</label>
                <label><input id="fpp-groundscreen" type="checkbox"> Ground Screen / Faraday Cloth</label>

                <label>Feedline family
                    <select id="fpp-feed-family">
                        <option value="coax">Coax</option>
                        <option value="ladder">Ladder line</option>
                    </select>
                </label>

                <label>Feedline type
                    <select id="fpp-feed-type">
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
                    <input id="fpp-feed-length" type="number" step="5" value="50">
                </label>

            </div>

            <button id="fpp-compute" style="margin-top:1rem;">Analyze Performance</button>

            <div id="fpp-summary" class="summary" style="margin-top:1rem;"></div>

        </section>
    `;

    const freqInput = document.getElementById("fpp-freq");
    const radInput = document.getElementById("fpp-rad");
    const sleeveInput = document.getElementById("fpp-sleeve");
    const heightInput = document.getElementById("fpp-height");

    const todInput = document.getElementById("fpp-tod");
    const seasideInput = document.getElementById("fpp-seaside");
    const groundScreenInput = document.getElementById("fpp-groundscreen");

    const feedFamilyInput = document.getElementById("fpp-feed-family");
    const feedTypeInput = document.getElementById("fpp-feed-type");
    const feedLenInput = document.getElementById("fpp-feed-length");

    const summaryDiv = document.getElementById("fpp-summary");
    const button = document.getElementById("fpp-compute");

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

        const totalGain = baseGain + geom.totalGeomGainDelta + boost.totalBoost;
        const finalToa = Math.max(8, Math.min(55, geom.toa + boost.toaShift));

        const efficiency = Math.max(40, Math.min(98, 85 + geom.totalGeomGainDelta * 3 - boost.feedlineLossDb * 2));

        const dxScore = Math.round(
            (totalGain * 4) +
            (100 - finalToa) +
            (efficiency / 2) +
            (seasideInput.checked ? 20 : 0)
        );

        const perfLines = [
            `Base gain: ${baseGain.toFixed(2)} dBi`,
            `Geometry delta: ${geom.totalGeomGainDelta.toFixed(2)} dB`,
            `Boost total: ${boost.totalBoost.toFixed(2)} dB`,
            `Feedline loss: ${boost.feedlineLossDb.toFixed(2)} dB`,
            `Final gain: ${totalGain.toFixed(2)} dBi`,
            `Takeoff angle: ${finalToa.toFixed(1)}°`,
            `Estimated efficiency: ${efficiency.toFixed(1)}%`,
            `DX score: ${dxScore}`
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
                <strong>Final gain:</strong> ${totalGain.toFixed(2)} dBi<br>
                <strong>Takeoff angle:</strong> ${finalToa.toFixed(1)}°<br>
                <strong>DX score:</strong> ${dxScore}
            `)}

            <h4>Performance</h4>
            <ul>${perfLines.map(x => `<li>${x}</li>`).join("")}</ul>

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
