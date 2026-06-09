/* ---------------------------------------------------------
   HF Workbench — Flowerpot Coaxial Field Planner (T2LT)
   - Classic coaxial sleeve vertical (no radials)
   - Computes field strength, coverage radius, ERP
   - Includes BoostEngine (seaside +10 dB, TOD, ground screen)
   - Includes feedline loss modeling
   - Uses GeometryEngine for TOA + gain shaping
--------------------------------------------------------- */

import { requireFrequency, requirePositive, toNumber } from "../validators.js";
import { infoBox, warnBox } from "../dom.js";
import { findBand } from "../constants.js";
import { GeometryEngine } from "../engines/geometry-engine.js";
import { BoostEngine } from "../engines/boost-engine.js";
import { TransformerEngine } from "../engines/transformer-engine.js";

export default function initFlowerpotField(root) {
    const container = document.querySelector("#content") || root;
    if (!container) return;

    container.innerHTML = `
        <section class="tool">
            <h2>Flowerpot Coaxial — Field Planner</h2>

            <h3>Geometry</h3>
            <div class="field-grid">

                <label>Frequency (MHz)
                    <input id="fpf-freq" type="number" step="0.01" value="146.52">
                </label>

                <label>Radiator length (m)
                    <input id="fpf-rad" type="number" step="0.01" value="0.49">
                </label>

                <label>Sleeve length (m)
                    <input id="fpf-sleeve" type="number" step="0.01" value="0.49">
                </label>

                <label>Base height (m)
                    <input id="fpf-height" type="number" step="0.1" value="2.0">
                </label>

            </div>

            <h3>Boost</h3>
            <div class="field-grid boost-grid">

                <label>Time of day
                    <select id="fpf-tod">
                        <option value="day">Day</option>
                        <option value="night">Night</option>
                        <option value="dawn">Dawn</option>
                        <option value="dusk">Dusk</option>
                    </select>
                </label>

                <label><input id="fpf-seaside" type="checkbox"> Seaside (+10 dB)</label>
                <label><input id="fpf-groundscreen" type="checkbox"> Ground Screen / Faraday Cloth</label>

                <label>Feedline family
                    <select id="fpf-feed-family">
                        <option value="coax">Coax</option>
                        <option value="ladder">Ladder line</option>
                    </select>
                </label>

                <label>Feedline type
                    <select id="fpf-feed-type">
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
                    <input id="fpf-feed-length" type="number" step="5" value="50">
                </label>

            </div>

            <h3>Transmit Power</h3>
            <div class="field-grid">

                <label>Power (W)
                    <input id="fpf-power" type="number" step="1" value="50">
                </label>

            </div>

            <button id="fpf-compute" style="margin-top:1rem;">Compute Field Coverage</button>

            <div id="fpf-summary" class="summary" style="margin-top:1rem;"></div>

        </section>
    `;

    const freqInput = document.getElementById("fpf-freq");
    const radInput = document.getElementById("fpf-rad");
    const sleeveInput = document.getElementById("fpf-sleeve");
    const heightInput = document.getElementById("fpf-height");

    const todInput = document.getElementById("fpf-tod");
    const seasideInput = document.getElementById("fpf-seaside");
    const groundScreenInput = document.getElementById("fpf-groundscreen");

    const feedFamilyInput = document.getElementById("fpf-feed-family");
    const feedTypeInput = document.getElementById("fpf-feed-type");
    const feedLenInput = document.getElementById("fpf-feed-length");

    const powerInput = document.getElementById("fpf-power");

    const summaryDiv = document.getElementById("fpf-summary");
    const button = document.getElementById("fpf-compute");

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
        requirePositive(powerW, "Power", errors);

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

        const feedlineLoss = boost.feedlineLossDb;
        const erpW = powerW * Math.pow(10, (totalGain - feedlineLoss) / 10);

        const fsAt1km = 106.9 + 20 * Math.log10(freq) + 20 * Math.log10(1);
        const eirpDbm = 10 * Math.log10(erpW * 1000);
        const fieldStrength = eirpDbm - fsAt1km;

        const coverageKm = Math.max(1, Math.min(80, (totalGain * 1.2) + (powerW / 10)));

        const fieldLines = [
            `Transmit power: ${powerW.toFixed(1)} W`,
            `Feedline loss: ${feedlineLoss.toFixed(2)} dB`,
            `Final gain: ${totalGain.toFixed(2)} dBi`,
            `ERP: ${erpW.toFixed(1)} W`,
            `Field strength @ 1 km: ${fieldStrength.toFixed(1)} dBµV/m`,
            `Estimated coverage radius: ${coverageKm.toFixed(1)} km`,
            `Takeoff angle: ${finalToa.toFixed(1)}°`
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
                <strong>ERP:</strong> ${erpW.toFixed(1)} W<br>
                <strong>Coverage radius:</strong> ${coverageKm.toFixed(1)} km
            `)}

            <h4>Field Performance</h4>
            <ul>${fieldLines.map(x => `<li>${x}</li>`).join("")}</ul>

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
