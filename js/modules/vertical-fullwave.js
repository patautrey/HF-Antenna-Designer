/* ---------------------------------------------------------
   HF Workbench — Full‑Wave Vertical (1λ)
   - Geometry panel
   - Unified boost panel (two-column .boost-grid)
   - Optional top‑loading / capacity hat
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

function baseFullwaveVerticalGain(frac) {
    if (frac < 0.40) return 3.0;
    if (frac < 0.60) return 3.6;
    if (frac < 0.80) return 4.0;
    return 4.2;
}

export default function initVerticalFullwave(root) {
    const container = document.querySelector("#content") || root;
    if (!container) return;

    container.innerHTML = `
        <section class="tool">
            <h2>Full‑Wave Vertical (1λ)</h2>

            <h3>Geometry</h3>
            <div class="field-grid">

                <label>Frequency (MHz)
                    <input id="vf-freq" type="number" step="0.01" value="14.2">
                </label>

                <label>Radiator length (m)
                    <input id="vf-length" type="number" step="0.1" value="20.2">
                </label>

                <label>Base height (m)
                    <input id="vf-height" type="number" step="0.5" value="2">
                </label>

                <label>Top‑loading / capacity hat (m)
                    <input id="vf-topload" type="number" step="0.1" value="0">
                </label>

            </div>

            <h3>Boost</h3>
            <div class="field-grid boost-grid">

                <label>Time of day
                    <select id="vf-tod">
                        <option value="day">Day</option>
                        <option value="night">Night</option>
                        <option value="dawn">Dawn</option>
                        <option value="dusk">Dusk</option>
                    </select>
                </label>

                <label><input id="vf-seaside" type="checkbox"> Seaside (+10 dB)</label>
                <label><input id="vf-groundscreen" type="checkbox"> Ground Screen / Faraday Cloth</label>
                <label><input id="vf-elevated" type="checkbox"> Elevated Base / Supports</label>

                <label>Feedline family
                    <select id="vf-feed-family">
                        <option value="coax">Coax</option>
                        <option value="ladder">Ladder line</option>
                    </select>
                </label>

                <label>Feedline type
                    <select id="vf-feed-type">
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
                    <input id="vf-feed-length" type="number" step="5" value="75">
                </label>

            </div>

            <button id="vf-compute" style="margin-top:1rem;">Compute Full‑Wave Vertical</button>

            <div id="vf-summary" class="summary" style="margin-top:1rem;"></div>

        </section>
    `;

    const freqInput = document.getElementById("vf-freq");
    const lengthInput = document.getElementById("vf-length");
    const heightInput = document.getElementById("vf-height");
    const toploadInput = document.getElementById("vf-topload");

    const todInput = document.getElementById("vf-tod");
    const seasideInput = document.getElementById("vf-seaside");
    const groundScreenInput = document.getElementById("vf-groundscreen");
    const elevatedInput = document.getElementById("vf-elevated");

    const feedFamilyInput = document.getElementById("vf-feed-family");
    const feedTypeInput = document.getElementById("vf-feed-type");
    const feedLenInput = document.getElementById("vf-feed-length");

    const summaryDiv = document.getElementById("vf-summary");
    const button = document.getElementById("vf-compute");

    button.addEventListener("click", () => {

        const errors = [];

        const freq = toNumber(freqInput.value);
        const length = toNumber(lengthInput.value);
        const height = toNumber(heightInput.value);
        const topload = toNumber(toploadInput.value);

        requireFrequency(freq, errors);
        requirePositive(length, "Radiator length", errors);
        requirePositive(height, "Base height", errors);
        if (topload < 0) errors.push("Top‑loading must be zero or positive.");

        if (errors.length) {
            summaryDiv.innerHTML = warnBox(errors.join("<br>"));
            return;
        }

        const band = findBand(freq);

        const effectiveSpan = length + topload;

        const geom = GeometryEngine.computeGeometry({
            freqMHz: freq,
            heightM: height,
            spanM: effectiveSpan
        });

        const baseGain = baseFullwaveVerticalGain(geom.frac);

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
        const finalToa = Math.max(6, Math.min(50, geom.toa + boost.toaShift));

        const geomLines = [
            `Radiator length: ${length.toFixed(2)} m`,
            `Top‑loading: ${topload.toFixed(2)} m`,
            `Effective span: ${effectiveSpan.toFixed(2)} m`,
            `Base height: ${height.toFixed(2)} m`,
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

        const transformerHtml = TransformerEngine.getTransformerNote("verticalFullwave", feedFamily);

        log("VerticalFullwave", {
            freq,
            length,
            height,
            topload,
            effectiveSpan,
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

            <p><strong>Base
