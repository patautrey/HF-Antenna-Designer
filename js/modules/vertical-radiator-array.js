/* ---------------------------------------------------------
   HF Workbench — Vertical Radiator Array (2–4 phased verticals)
   - Geometry panel
   - Unified boost panel (two-column .boost-grid)
   - Spacing + phasing options
   - Feedline family + type + length
   - Transformer Requirements (1:1 choke + phasing network notes)
--------------------------------------------------------- */

import { requireFrequency, requirePositive, toNumber } from "../validators.js";
import { infoBox, warnBox } from "../dom.js";
import { findBand } from "../constants.js";
import { log } from "../log.js";
import { GeometryEngine } from "../engines/geometry-engine.js";
import { BoostEngine } from "../engines/boost-engine.js";
import { TransformerEngine } from "../engines/transformer-engine.js";

function baseArrayGain(count, frac) {
    const base =
        count === 2 ? 3.0 :
        count === 3 ? 4.5 :
        count === 4 ? 5.5 : 3.0;

    const heightAdj =
        frac < 0.40 ? -0.3 :
        frac < 0.60 ? 0.0 :
        frac < 0.80 ? 0.2 : 0.3;

    return base + heightAdj;
}

export default function initVerticalRadiatorArray(root) {
    const container = document.querySelector("#content") || root;
    if (!container) return;

    container.innerHTML = `
        <section class="tool">
            <h2>Vertical Radiator Array</h2>

            <h3>Geometry</h3>
            <div class="field-grid">

                <label>Frequency (MHz)
                    <input id="va-freq" type="number" step="0.01" value="7.1">
                </label>

                <label>Radiator count (2–4)
                    <input id="va-count" type="number" min="2" max="4" step="1" value="2">
                </label>

                <label>Radiator height (m)
                    <input id="va-height" type="number" step="0.1" value="10">
                </label>

                <label>Spacing between radiators (m)
                    <input id="va-spacing" type="number" step="0.1" value="10">
                </label>

                <label>Phasing
                    <select id="va-phase">
                        <option value="inphase">In‑phase (broadside)</option>
                        <option value="endfire">End‑fire</option>
                        <option value="cardioid">Cardioid</option>
                    </select>
                </label>

            </div>

            <h3>Boost</h3>
            <div class="field-grid boost-grid">

                <label>Time of day
                    <select id="va-tod">
                        <option value="day">Day</option>
                        <option value="night">Night</option>
                        <option value="dawn">Dawn</option>
                        <option value="dusk">Dusk</option>
                    </select>
                </label>

                <label><input id="va-seaside" type="checkbox"> Seaside (+10 dB)</label>
                <label><input id="va-groundscreen" type="checkbox"> Ground Screen / Faraday Cloth</label>
                <label><input id="va-elevated" type="checkbox"> Elevated Bases</label>

                <label>Feedline family
                    <select id="va-feed-family">
                        <option value="coax">Coax</option>
                        <option value="ladder">Ladder line</option>
                    </select>
                </label>

                <label>Feedline type
                    <select id="va-feed-type">
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
                    <input id="va-feed-length" type="number" step="5" value="75">
                </label>

            </div>

            <button id="va-compute" style="margin-top:1rem;">Compute Vertical Array</button>

            <div id="va-summary" class="summary" style="margin-top:1rem;"></div>

        </section>
    `;

    const freqInput = document.getElementById("va-freq");
    const countInput = document.getElementById("va-count");
    const heightInput = document.getElementById("va-height");
    const spacingInput = document.getElementById("va-spacing");
    const phaseInput = document.getElementById("va-phase");

    const todInput = document.getElementById("va-tod");
    const seasideInput = document.getElementById("va-seaside");
    const groundScreenInput = document.getElementById("va-groundscreen");
    const elevatedInput = document.getElementById("va-elevated");

    const feedFamilyInput = document.getElementById("va-feed-family");
    const feedTypeInput = document.getElementById("va-feed-type");
    const feedLenInput = document.getElementById("va-feed-length");

    const summaryDiv = document.getElementById("va-summary");
    const button = document.getElementById("va-compute");

    button.addEventListener("click", () => {

        const errors = [];

        const freq = toNumber(freqInput.value);
        const count = toNumber(countInput.value);
        const height = toNumber(heightInput.value);
        const spacing = toNumber(spacingInput.value);
        const phase = phaseInput.value;

        requireFrequency(freq, errors);
        requirePositive(height, "Radiator height", errors);
        requirePositive(spacing, "Spacing", errors);

        if (count < 2 || count > 4) {
            errors.push("Radiator count must be between 2 and 4.");
        }

        if (errors.length) {
            summaryDiv.innerHTML = warnBox(errors.join("<br>"));
            return;
        }

        const band = findBand(freq);

        const geom = GeometryEngine.computeGeometry({
            freqMHz: freq,
            heightM: height,
            spanM: height
        });

        const baseGain = baseArrayGain(count, geom.frac);

        const feedFamily = feedFamilyInput.value === "ladder" ? "ladder" : "coax";

        const boost = BoostEngine.computeBoost({
            reflectorCount: phase === "cardioid" ? 1 : 0,
            directorCount: phase === "endfire" ? 1 : 0,
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

        const totalGain = baseGain + boost.totalBoost + geom.totalGeomGainDelta;

        const finalToa =
            phase === "endfire"
                ? Math.max(5, Math.min(35, geom.toa + boost.toaShift))
                : phase === "cardioid"
                    ? Math.max(20, Math.min(60, geom.toa + boost.toaShift))
                    : Math.max(10, Math.min(50, geom.toa + boost.toaShift));

        const geomLines = [
            `Radiator count: ${count}`,
            `Radiator height: ${height.toFixed(2)} m`,
            `Spacing: ${spacing.toFixed(2)} m`,
            `Phasing: ${phase}`,
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

        const transformerHtml = TransformerEngine.getTransformerNote("verticalArray", feedFamily);

        log("VerticalArray", {
            freq,
            count,
            height,
            spacing,
            phase,
            geom,
            baseGain,
            boost,
            totalGain,
            finalToa
        });

        summaryDiv.innerHTML = infoBox(`
            <p><strong>Design frequency:</strong> ${freq.toFixed(2)} MHz (${band?.label ?? "Unknown band"})</p>

            <p><strong>Electrical height:</strong>
                ${geom.effectiveHeight.toFixed(2)} m
                (${(geom.frac * 100).toFixed(1)}% of λ)
            </p>

            <p><strong>Base Array Gain:</strong> ${baseGain.toFixed(1)} dBi</p>

            <p><strong>Geometry details:</strong><br>${geomLines}</p>

            <p><strong>Boost breakdown:</strong><br>${boostLines}</p>

            <p><strong>Total estimated gain:</strong> ${totalGain.toFixed(1)} dBi</p>

            <p><strong>Estimated TOA:</strong> ${finalToa.toFixed(0)}°</p>

            ${transformerHtml}
        `);
    });
}
