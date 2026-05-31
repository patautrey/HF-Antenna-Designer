/* ---------------------------------------------------------
   HF Workbench — Yagi-Uda Beam
   - Geometry panel
   - Unified boost panel (two-column .boost-grid)
   - Multi‑element support (2–6 elements)
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

function baseYagiGain(elementCount, frac) {
    const base = elementCount <= 2 ? 4.5 :
                 elementCount === 3 ? 6.0 :
                 elementCount === 4 ? 7.0 :
                 elementCount === 5 ? 7.8 : 8.3;

    const heightAdj =
        frac < 0.40 ? -0.4 :
        frac < 0.60 ? 0.0 :
        frac < 0.80 ? 0.2 : 0.3;

    return base + heightAdj;
}

export default function initYagi(root) {
    const container = document.querySelector("#content") || root;
    if (!container) return;

    container.innerHTML = `
        <section class="tool">
            <h2>Yagi-Uda Beam</h2>

            <h3>Geometry</h3>
            <div class="field-grid">

                <label>Frequency (MHz)
                    <input id="yg-freq" type="number" step="0.01" value="14.2">
                </label>

                <label>Element count (2–6)
                    <input id="yg-count" type="number" min="2" max="6" step="1" value="3">
                </label>

                <label>Driven element length (m)
                    <input id="yg-driven" type="number" step="0.1" value="10.1">
                </label>

                <label>Reflector length (m)
                    <input id="yg-reflector" type="number" step="0.1" value="10.6">
                </label>

                <label>Director length (m)
                    <input id="yg-director" type="number" step="0.1" value="9.7">
                </label>

                <label>Element spacing (m)
                    <input id="yg-spacing" type="number" step="0.05" value="0.3">
                </label>

                <label>Height (m)
                    <input id="yg-height" type="number" step="0.5" value="10">
                </label>

            </div>

            <h3>Boost</h3>
            <div class="field-grid boost-grid">

                <label>Time of day
                    <select id="yg-tod">
                        <option value="day">Day</option>
                        <option value="night">Night</option>
                        <option value="dawn">Dawn</option>
                        <option value="dusk">Dusk</option>
                    </select>
                </label>

                <label><input id="yg-seaside" type="checkbox"> Seaside (+10 dB)</label>
                <label><input id="yg-groundscreen" type="checkbox"> Ground Screen / Faraday Cloth</label>
                <label><input id="yg-elevated" type="checkbox"> Elevated Supports</label>

                <label>Feedline family
                    <select id="yg-feed-family">
                        <option value="coax">Coax</option>
                        <option value="ladder">Ladder line</option>
                    </select>
                </label>

                <label>Feedline type
                    <select id="yg-feed-type">
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
                    <input id="yg-feed-length" type="number" step="5" value="75">
                </label>

            </div>

            <button id="yg-compute" style="margin-top:1rem;">Compute Yagi</button>

            <div id="yg-summary" class="summary" style="margin-top:1rem;"></div>

        </section>
    `;

    const freqInput = document.getElementById("yg-freq");
    const countInput = document.getElementById("yg-count");
    const drivenInput = document.getElementById("yg-driven");
    const reflInput = document.getElementById("yg-reflector");
    const dirInput = document.getElementById("yg-director");
    const spacingInput = document.getElementById("yg-spacing");
    const heightInput = document.getElementById("yg-height");

    const todInput = document.getElementById("yg-tod");
    const seasideInput = document.getElementById("yg-seaside");
    const groundScreenInput = document.getElementById("yg-groundscreen");
    const elevatedInput = document.getElementById("yg-elevated");

    const feedFamilyInput = document.getElementById("yg-feed-family");
    const feedTypeInput = document.getElementById("yg-feed-type");
    const feedLenInput = document.getElementById("yg-feed-length");

    const summaryDiv = document.getElementById("yg-summary");
    const button = document.getElementById("yg-compute");

    button.addEventListener("click", () => {

        const errors = [];

        const freq = toNumber(freqInput.value);
        const count = toNumber(countInput.value);
        const driven = toNumber(drivenInput.value);
        const refl = toNumber(reflInput.value);
        const dir = toNumber(dirInput.value);
        const spacing = toNumber(spacingInput.value);
        const height = toNumber(heightInput.value);

        requireFrequency(freq, errors);
        requirePositive(driven, "Driven element length", errors);
        requirePositive(refl, "Reflector length", errors);
        requirePositive(dir, "Director length", errors);
        requirePositive(spacing, "Element spacing", errors);
        requirePositive(height, "Height", errors);

        if (count < 2 || count > 6) {
            errors.push("Element count must be between 2 and 6.");
        }

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

        const baseGain = baseYagiGain(count, geom.frac);

        const feedFamily = feedFamilyInput.value === "ladder" ? "ladder" : "coax";

        const boost = BoostEngine.computeBoost({
            reflectorCount: 1,
            directorCount: count - 2,
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
        const finalToa = Math.max(8, Math.min(45, geom.toa + boost.toaShift));

        const geomLines = [
            `Driven: ${driven.toFixed(2)} m`,
            `Reflector: ${refl.toFixed(2)} m`,
            `Director: ${dir.toFixed(2)} m`,
            `Element spacing: ${spacing.toFixed(2)} m`,
            `Element count: ${count}`,
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

        const transformerHtml = TransformerEngine.getTransformerNote("yagi", feedFamily);

        log("Yagi", {
            freq,
            count,
            driven,
            refl,
            dir,
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

            <p><strong>Base Yagi Gain:</strong> ${baseGain.toFixed(1)} dBi</p>

            <p><strong>Geometry details:</strong><br>${geomLines}</p>

            <p><strong>Boost breakdown:</strong><br>${boostLines}</p>

            <p><strong>Total estimated gain:</strong> ${totalGain.toFixed(1)} dBi</p>

            <p><strong>Estimated TOA:</strong> ${finalToa.toFixed(0)}°</p>

            ${transformerHtml}
        `);
    });
}
