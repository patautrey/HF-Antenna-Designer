/* ---------------------------------------------------------
   HF Workbench — Marconi Sloper (Slanted Vertical)
   - Geometry panel
   - Unified boost panel (two-column .boost-grid)
   - Sloping radiator + base height + slope angle
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

function baseSloperGain(frac) {
    if (frac < 0.40) return 1.0;
    if (frac < 0.60) return 1.4;
    if (frac < 0.80) return 1.8;
    return 2.1;
}

export default function initMarconiSloper(root) {
    const container = document.querySelector("#content") || root;
    if (!container) return;

    container.innerHTML = `
        <section class="tool">
            <h2>Marconi Sloper</h2>

            <h3>Geometry</h3>
            <div class="field-grid">

                <label>Frequency (MHz)
                    <input id="msl-freq" type="number" step="0.01" value="3.8">
                </label>

                <label>Radiator length (m)
                    <input id="msl-length" type="number" step="0.1" value="20">
                </label>

                <label>Base height (m)
                    <input id="msl-height" type="number" step="0.5" value="2">
                </label>

                <label>Slope angle (degrees)
                    <input id="msl-angle" type="number" step="1" value="45">
                </label>

            </div>

            <h3>Boost</h3>
            <div class="field-grid boost-grid">

                <label>Time of day
                    <select id="msl-tod">
                        <option value="day">Day</option>
                        <option value="night">Night</option>
                        <option value="dawn">Dawn</option>
                        <option value="dusk">Dusk</option>
                    </select>
                </label>

                <label><input id="msl-seaside" type="checkbox"> Seaside (+10 dB)</label>
                <label><input id="msl-groundscreen" type="checkbox"> Ground Screen / Faraday Cloth</label>
                <label><input id="msl-elevated" type="checkbox"> Elevated Base / Supports</label>

                <label>Feedline family
                    <select id="msl-feed-family">
                        <option value="coax">Coax</option>
                        <option value="ladder">Ladder line</option>
                    </select>
                </label>

                <label>Feedline type
                    <select id="msl-feed-type">
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
                    <input id="msl-feed-length" type="number" step="5" value="75">
                </label>

            </div>

            <button id="msl-compute" style="margin-top:1rem;">Compute Marconi Sloper</button>

            <div id="msl-summary" class="summary" style="margin-top:1rem;"></div>

        </section>
    `;

    const freqInput = document.getElementById("msl-freq");
    const lengthInput = document.getElementById("msl-length");
    const heightInput = document.getElementById("msl-height");
    const angleInput = document.getElementById("msl-angle");

    const todInput = document.getElementById("msl-tod");
    const seasideInput = document.getElementById("msl-seaside");
    const groundScreenInput = document.getElementById("msl-groundscreen");
    const elevatedInput = document.getElementById("msl-elevated");

    const feedFamilyInput = document.getElementById("msl-feed-family");
    const feedTypeInput = document.getElementById("msl-feed-type");
    const feedLenInput = document.getElementById("msl-feed-length");

    const summaryDiv = document.getElementById("msl-summary");
    const button = document.getElementById("msl-compute");

    button.addEventListener("click", () => {

        const errors = [];

        const freq = toNumber(freqInput.value);
        const length = toNumber(lengthInput.value);
        const height = toNumber(heightInput.value);
        const angle = toNumber(angleInput.value);

        requireFrequency(freq, errors);
        requirePositive(length, "Radiator length", errors);
        requirePositive(height, "Base height", errors);
        requirePositive(angle, "Slope angle", errors);

        if (angle < 10 || angle > 80) {
            errors.push("Slope angle should be between 10° and 80° for realistic sloper geometry.");
        }

        if (errors.length) {
            summaryDiv.innerHTML = warnBox(errors.join("<br>"));
            return;
        }

        const band = findBand(freq);

        const effectiveSpan = length;

        const geom = GeometryEngine.computeGeometry({
            freqMHz: freq,
            heightM: height,
            spanM: effectiveSpan
        });

        const baseGain = baseSloperGain(geom.frac);

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
        const finalToa = Math.max(12, Math.min(60, geom.toa + boost.toaShift));

        const geomLines = [
            `Radiator length: ${length.toFixed(2)} m`,
            `Base height: ${height.toFixed(2)} m`,
            `Slope angle: ${angle.toFixed(0)}°`,
            `Effective electrical span: ${effectiveSpan.toFixed(2)} m`,
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

        const transformerHtml = TransformerEngine.getTransformerNote("marconiSloper", feedFamily);

        log("MarconiSloper", {
            freq,
            length,
            height,
            angle,
            effectiveSpan,
            geom,
            baseGain,
            boost,
            totalGain,
            finalToa
        });

        summaryDiv.innerHTML = infoBox(`
            <p><strong>Operating frequency:</strong> ${freq.toFixed(2)} MHz (${band?.label ?? "Unknown band"})</p>

            <p><strong>Electrical height:</strong>
                ${geom.effectiveHeight.toFixed(2)} m
                (${(geom.frac * 100).toFixed(1)}% of λ)
            </p>

            <p><strong>Base Sloper Gain:</strong> ${baseGain.toFixed(1)} dBi</p>

            <p><strong>Geometry details:</strong><br>${geomLines}</p>

            <p><strong>Boost breakdown:</strong><br>${boostLines}</p>

            <p><strong>Total estimated gain:</strong> ${totalGain.toFixed(1)} dBi</p>

            <p><strong>Estimated TOA:</strong> ${finalToa.toFixed(0)}°</p>

            ${transformerHtml}
        `);
    });
}
