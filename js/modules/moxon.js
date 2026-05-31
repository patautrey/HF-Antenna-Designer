/* ---------------------------------------------------------
   HF Workbench — Moxon Rectangle
   - Geometry panel
   - Unified boost panel (two-column .boost-grid)
   - Element lengths + spacing
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

function baseMoxonGain(frac) {
    if (frac < 0.40) return 4.0;
    if (frac < 0.60) return 4.8;
    if (frac < 0.80) return 5.2;
    return 5.4;
}

export default function initMoxon(root) {
    const container = document.querySelector("#content") || root;
    if (!container) return;

    container.innerHTML = `
        <section class="tool">
            <h2>Moxon Rectangle</h2>

            <h3>Geometry</h3>
            <div class="field-grid">

                <label>Frequency (MHz)
                    <input id="mx-freq" type="number" step="0.01" value="14.2">
                </label>

                <label>Driven element length (m)
                    <input id="mx-driven" type="number" step="0.1" value="10.1">
                </label>

                <label>Reflector length (m)
                    <input id="mx-reflector" type="number" step="0.1" value="10.6">
                </label>

                <label>Tip spacing (m)
                    <input id="mx-tip" type="number" step="0.05" value="0.2">
                </label>

                <label>Element spacing (m)
                    <input id="mx-spacing" type="number" step="0.05" value="0.3">
                </label>

                <label>Height (m)
                    <input id="mx-height" type="number" step="0.5" value="10">
                </label>

            </div>

            <h3>Boost</h3>
            <div class="field-grid boost-grid">

                <label>Time of day
                    <select id="mx-tod">
                        <option value="day">Day</option>
                        <option value="night">Night</option>
                        <option value="dawn">Dawn</option>
                        <option value="dusk">Dusk</option>
                    </select>
                </label>

                <label><input id="mx-seaside" type="checkbox"> Seaside (+10 dB)</label>
                <label><input id="mx-groundscreen" type="checkbox"> Ground Screen / Faraday Cloth</label>
                <label><input id="mx-elevated" type="checkbox"> Elevated Supports</label>

                <label>Feedline family
                    <select id="mx-feed-family">
                        <option value="coax">Coax</option>
                        <option value="ladder">Ladder line</option>
                    </select>
                </label>

                <label>Feedline type
                    <select id="mx-feed-type">
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
                    <input id="mx-feed-length" type="number" step="5" value="75">
                </label>

            </div>

            <button id="mx-compute" style="margin-top:1rem;">Compute Moxon</button>

            <div id="mx-summary" class="summary" style="margin-top:1rem;"></div>

        </section>
    `;

    const freqInput = document.getElementById("mx-freq");
    const drivenInput = document.getElementById("mx-driven");
    const reflInput = document.getElementById("mx-reflector");
    const tipInput = document.getElementById("mx-tip");
    const spacingInput = document.getElementById("mx-spacing");
    const heightInput = document.getElementById("mx-height");

    const todInput = document.getElementById("mx-tod");
    const seasideInput = document.getElementById("mx-seaside");
    const groundScreenInput = document.getElementById("mx-groundscreen");
    const elevatedInput = document.getElementById("mx-elevated");

    const feedFamilyInput = document.getElementById("mx-feed-family");
    const feedTypeInput = document.getElementById("mx-feed-type");
    const feedLenInput = document.getElementById("mx-feed-length");

    const summaryDiv = document.getElementById("mx-summary");
    const button = document.getElementById("mx-compute");

    button.addEventListener("click", () => {

        const errors = [];

        const freq = toNumber(freqInput.value);
        const driven = toNumber(drivenInput.value);
        const refl = toNumber(reflInput.value);
        const tip = toNumber(tipInput.value);
        const spacing = toNumber(spacingInput.value);
        const height = toNumber(heightInput.value);

        requireFrequency(freq, errors);
        requirePositive(driven, "Driven element length", errors);
        requirePositive(refl, "Reflector length", errors);
        requirePositive(tip, "Tip spacing", errors);
        requirePositive(spacing, "Element spacing", errors);
        requirePositive(height, "Height", errors);

        if (errors.length) {
            summaryDiv.innerHTML = warnBox(errors.join("<br>"));
            return;
        }

        const band = findBand(freq);

        const geom = GeometryEngine.computeGeometry({
            freqMHz: freq,
            heightM: height,
            spanM: driven
        });

        const baseGain = baseMoxonGain(geom.frac);

        const feedFamily = feedFamilyInput.value === "ladder" ? "ladder" : "coax";

        const boost = BoostEngine.computeBoost({
            reflectorCount: 1,
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
        const finalToa = Math.max(10, Math.min(60, geom.toa + boost.toaShift));

        const geomLines = [
            `Driven element: ${driven.toFixed(2)} m`,
            `Reflector: ${refl.toFixed(2)} m`,
            `Tip spacing: ${tip.toFixed(2)} m`,
            `Element spacing: ${spacing.toFixed(2)} m`,
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

        const transformerHtml = TransformerEngine.getTransformerNote("moxon", feedFamily);

        log("Moxon", {
            freq,
            driven,
            refl,
            tip,
            spacing,
            height,
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

            <p><strong>Base Moxon Gain:</strong> ${baseGain.toFixed(1)} dBi</p>

            <p><strong>Geometry details:</strong><br>${geomLines}</p>

            <p><strong>Boost breakdown:</strong><br>${boostLines}</p>

            <p><strong>Total estimated gain:</strong> ${totalGain.toFixed(1)} dBi</p>

            <p><strong>Estimated TOA:</strong> ${finalToa.toFixed(0)}°</p>

            ${transformerHtml}
        `);
    });
}
