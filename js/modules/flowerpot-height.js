/* ---------------------------------------------------------
   HF Workbench — Flowerpot Coaxial Height Optimizer (T2LT)
   - Classic coaxial sleeve vertical (no radials)
   - Computes gain, TOA, DX score vs. height
   - Includes BoostEngine (seaside +10 dB, TOD, ground screen)
   - Includes feedline loss modeling
   - Uses GeometryEngine for height-dependent TOA + gain shaping
--------------------------------------------------------- */

import { requireFrequency, requirePositive, toNumber } from "../validators.js";
import { infoBox, warnBox } from "../dom.js";
import { findBand } from "../constants.js";
import { GeometryEngine } from "../engines/geometry-engine.js";
import { BoostEngine } from "../engines/boost-engine.js";
import { TransformerEngine } from "../engines/transformer-engine.js";

export default function initFlowerpotHeight(root) {
    const container = document.querySelector("#content") || root;
    if (!container) return;

    container.innerHTML = `
        <section class="tool">
            <h2>Flowerpot Coaxial — Height Optimizer</h2>

            <h3>Geometry</h3>
            <div class="field-grid">

                <label>Frequency (MHz)
                    <input id="fph-freq" type="number" step="0.01" value="146.52">
                </label>

                <label>Radiator length (m)
                    <input id="fph-rad" type="number" step="0.01" value="0.49">
                </label>

                <label>Sleeve length (m)
                    <input id="fph-sleeve" type="number" step="0.01" value="0.49">
                </label>

                <label>Minimum height (m)
                    <input id="fph-hmin" type="number" step="0.1" value="1.0">
                </label>

                <label>Maximum height (m)
                    <input id="fph-hmax" type="number" step="0.1" value="10.0">
                </label>

                <label>Height step (m)
                    <input id="fph-hstep" type="number" step="0.1" value="1.0">
                </label>

            </div>

            <h3>Boost</h3>
            <div class="field-grid boost-grid">

                <label>Time of day
                    <select id="fph-tod">
                        <option value="day">Day</option>
                        <option value="night">Night</option>
                        <option value="dawn">Dawn</option>
                        <option value="dusk">Dusk</option>
                    </select>
                </label>

                <label><input id="fph-seaside" type="checkbox"> Seaside (+10 dB)</label>
                <label><input id="fph-groundscreen" type="checkbox"> Ground Screen / Faraday Cloth</label>

                <label>Feedline family
                    <select id="fph-feed-family">
                        <option value="coax">Coax</option>
                        <option value="ladder">Ladder line</option>
                    </select>
                </label>

                <label>Feedline type
                    <select id="fph-feed-type">
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
                    <input id="fph-feed-length" type="number" step="5" value="50">
                </label>

            </div>

            <button id="fph-compute" style="margin-top:1rem;">Compute Height Optimization</button>

            <div id="fph-summary" class="summary" style="margin-top:1rem;"></div>

        </section>
    `;

    const freqInput = document.getElementById("fph-freq");
    const radInput = document.getElementById("fph-rad");
    const sleeveInput = document.getElementById("fph-sleeve");

    const hminInput = document.getElementById("fph-hmin");
    const hmaxInput = document.getElementById("fph-hmax");
    const hstepInput = document.getElementById("fph-hstep");

    const todInput = document.getElementById("fph-tod");
    const seasideInput = document.getElementById("fph-seaside");
    const groundScreenInput = document.getElementById("fph-groundscreen");

    const feedFamilyInput = document.getElementById("fph-feed-family");
    const feedTypeInput = document.getElementById("fph-feed-type");
    const feedLenInput = document.getElementById("fph-feed-length");

    const summaryDiv = document.getElementById("fph-summary");
    const button = document.getElementById("fph-compute");

    button.addEventListener("click", () => {

        const errors = [];

        const freq = toNumber(freqInput.value);
        const rad = toNumber(radInput.value);
        const sleeve = toNumber(sleeveInput.value);

        const hmin = toNumber(hminInput.value);
        const hmax = toNumber(hmaxInput.value);
        const hstep = toNumber(hstepInput.value);

        requireFrequency(freq, errors);
        requirePositive(rad, "Radiator length", errors);
        requirePositive(sleeve, "Sleeve length", errors);
        requirePositive(hmin, "Minimum height", errors);
        requirePositive(hmax, "Maximum height", errors);
        requirePositive(hstep, "Height step", errors);

        if (hmax <= hmin) errors.push("Maximum height must be greater than minimum height.");
        if (hstep <= 0) errors.push("Height step must be positive.");

        if (errors.length) {
            summaryDiv.innerHTML = warnBox(errors.join("<br>"));
            return;
        }

        const band = findBand(freq);

        const feedFamily = feedFamilyInput.value === "ladder" ? "ladder" : "coax";

        const results = [];

        for (let h = hmin; h <= hmax + 0.0001; h += hstep) {

            const geom = GeometryEngine.computeGeometry({
                freqMHz: freq,
                heightM: h,
                spanM: rad + sleeve
            });

            const baseGain = 2.1;

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

            const totalGain = baseGain + geom.totalGeomGainDelta + boost.totalBoost;
            const finalToa = Math.max(8, Math.min(55, geom.toa + boost.toaShift));

            const efficiency = Math.max(40, Math.min(98, 85 + geom.totalGeomGainDelta * 3 - boost.feedlineLossDb * 2));

            const dxScore = Math.round(
                (totalGain * 4) +
                (100 - finalToa) +
                (efficiency / 2) +
                (seasideInput.checked ? 20 : 0)
            );

            results.push({
                height: h,
                gain: totalGain,
                toa: finalToa,
                efficiency,
                dxScore
            });
        }

        const best = results.reduce((a, b) => (b.dxScore > a.dxScore ? b : a), results[0]);

        const lines = results.map(r => `
            <li>
                <strong>${r.height.toFixed(1)} m</strong> —
                Gain: ${r.gain.toFixed(2)} dBi,
                TOA: ${r.toa.toFixed(1)}°,
                Efficiency: ${r.efficiency.toFixed(1)}%,
                DX score: ${r.dxScore}
            </li>
        `).join("");

        summaryDiv.innerHTML = `
            ${infoBox(`
                <strong>Band:</strong> ${band.name}<br>
                <strong>Best height:</strong> ${best.height.toFixed(1)} m<br>
                <strong>DX score:</strong> ${best.dxScore}
            `)}

            <h4>Height Sweep</h4>
            <ul>${lines}</ul>
        `;
    });
}

