/* ---------------------------------------------------------
   HF Workbench — Fan Dipole
   - Geometry panel
   - Unified boost panel (two-column .boost-grid)
   - Multiple legs (2–6)
   - Feedline family + type + length
   - Transformer Requirements (1:1 current balun)
--------------------------------------------------------- */

import { requireFrequency, requirePositive, toNumber } from "../validators.js";
import { infoBox, warnBox } from "../dom.js";
import { findBand } from "../constants.js";
import { log } from "../log.js";
import { GeometryEngine } from "../engines/geometry-engine.js";
import { BoostEngine } from "../engines/boost-engine.js";
import { TransformerEngine } from "../engines/transformer-engine.js";

function baseFanDipoleGain(frac) {
    if (frac < 0.40) return 1.8;
    if (frac < 0.60) return 2.2;
    if (frac < 0.80) return 2.5;
    return 2.8;
}

export default function initFanDipole(root) {
    const container = document.querySelector("#content") || root;
    if (!container) return;

    container.innerHTML = `
        <section class="tool">
            <h2>Fan Dipole</h2>

            <h3>Geometry</h3>
            <div class="field-grid">
                <label>Primary frequency (MHz)
                    <input id="fd-freq" type="number" step="0.01" value="7.1">
                </label>

                <label>Number of legs (2–6)
                    <input id="fd-legs" type="number" min="2" max="6" step="1" value="3">
                </label>

                <label>Average height (m)
                    <input id="fd-height" type="number" step="0.5" value="10">
                </label>

                <label>Leg length 1 (m)
                    <input id="fd-leg1" type="number" step="0.5" value="20">
                </label>
                <label>Leg length 2 (m)
                    <input id="fd-leg2" type="number" step="0.5" value="10">
                </label>
                <label>Leg length 3 (m)
                    <input id="fd-leg3" type="number" step="0.5" value="7">
                </label>

                <label>Leg length 4 (m)
                    <input id="fd-leg4" type="number" step="0.5" value="0">
                </label>
                <label>Leg length 5 (m)
                    <input id="fd-leg5" type="number" step="0.5" value="0">
                </label>
                <label>Leg length 6 (m)
                    <input id="fd-leg6" type="number" step="0.5" value="0">
                </label>
            </div>

            <h3>Boost</h3>
            <div class="field-grid boost-grid">
                <label>Time of day
                    <select id="fd-tod">
                        <option value="day">Day</option>
                        <option value="night">Night</option>
                        <option value="dawn">Dawn</option>
                        <option value="dusk">Dusk</option>
                    </select>
                </label>

                <label><input id="fd-seaside" type="checkbox"> Seaside (+10 dB)</label>
                <label><input id="fd-groundscreen" type="checkbox"> Ground Screen / Faraday Cloth</label>
                <label><input id="fd-elevated" type="checkbox"> Elevated Feed / Supports</label>

                <label>Feedline family
                    <select id="fd-feed-family">
                        <option value="coax">Coax</option>
                        <option value="ladder">Ladder line</option>
                    </select>
                </label>

                <label>Feedline type
                    <select id="fd-feed-type">
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
                    <input id="fd-feed-length" type="number" step="5" value="75">
                </label>
            </div>

            <button id="fd-compute" style="margin-top:1rem;">Compute Fan Dipole</button>

            <div id="fd-summary" class="summary" style="margin-top:1rem;"></div>
        </section>
    `;

    const freqInput = document.getElementById("fd-freq");
    const legsInput = document.getElementById("fd-legs");
    const heightInput = document.getElementById("fd-height");

    const legInputs = [
        document.getElementById("fd-leg1"),
        document.getElementById("fd-leg2"),
        document.getElementById("fd-leg3"),
        document.getElementById("fd-leg4"),
        document.getElementById("fd-leg5"),
        document.getElementById("fd-leg6")
    ];

    const todInput = document.getElementById("fd-tod");
    const seasideInput = document.getElementById("fd-seaside");
    const groundScreenInput = document.getElementById("fd-groundscreen");
    const elevatedInput = document.getElementById("fd-elevated");

    const feedFamilyInput = document.getElementById("fd-feed-family");
    const feedTypeInput = document.getElementById("fd-feed-type");
    const feedLenInput = document.getElementById("fd-feed-length");

    const summaryDiv = document.getElementById("fd-summary");
    const button = document.getElementById("fd-compute");

    button.addEventListener("click", () => {
        const errors = [];

        const freq = toNumber(freqInput.value);
        const legs = toNumber(legsInput.value);
        const height = toNumber(heightInput.value);

        requireFrequency(freq, errors);
        requirePositive(height, "Average height", errors);

        if (legs < 2 || legs > 6) {
            errors.push("Number of legs must be between 2 and 6.");
        }

        const legLengths = legInputs.map(i => toNumber(i.value)).filter(v => v > 0);

        if (legLengths.length < 2) {
            errors.push("At least two leg lengths must be non-zero.");
        }

        if (errors.length) {
            summaryDiv.innerHTML = warnBox(errors.join("<br>"));
            return;
        }

        const band = findBand(freq);

        const longest = Math.max(...legLengths);

        const geom = GeometryEngine.computeGeometry({
            freqMHz: freq,
            heightM: height,
            spanM: longest * 2
        });

        const baseGain = baseFanDipoleGain(geom.frac);

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
        const finalToa = Math.max(25, Math.min(85, geom.toa + boost.toaShift));

        const geomLines = [
            `Leg count: ${legs}`,
            `Leg lengths: ${legLengths.join(", ")} m`,
            `Longest leg: ${longest.toFixed(1)} m`,
            ...(geom.components.length ? geom.components.map(c => c.note ?? "") : [])
        ].join("<br>");

        const boostLines = boost.components.length
            ? boost.components.map(d => {
                const parts = [];
                if (d.boost) parts.push(`${d.boost.toFixed(1)} dB from ${d.label}`);
                else parts.push(d.label);
                if (d.toaShift) parts.push(`TOA shift ${d.toaShift > 0 ? "+" : ""}${d.toaShift}°`);
                return parts.join(" — ");
            }).join("<br>")
            : "No boost options enabled.";

        const transformerHtml = TransformerEngine.getTransformerNote("fanDipole", feedFamily);

        log("FanDipole", {
            freq,
            legs,
            legLengths,
            height,
            geom,
            baseGain,
            boost,
            totalGain,
            finalToa
        });

        summaryDiv.innerHTML = infoBox(`
            <p><strong>Primary frequency:</strong> ${freq.toFixed(2)} MHz (${band?.label ?? "Unknown band"})</p>

            <p><strong>Electrical height:</strong> 
                ${geom.effectiveHeight.toFixed(2)} m 
                (${(geom.frac * 100).toFixed(1)}% of λ)
            </p>

            <p><strong>Base Fan Dipole Gain:</strong> ${baseGain.toFixed(1)} dBi</p>

            <p><strong>Geometry details:</strong><br>${geomLines}</p>

            <p><strong>Boost breakdown:</strong><br>${boostLines}</p>

            <p><strong>Total estimated gain:</strong> ${totalGain.toFixed(1)} dBi</p>

            <p><strong>Estimated TOA:</strong> ${finalToa.toFixed(0)}°</p>

            ${transformerHtml}
        `);
    });
}
