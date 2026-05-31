/* ---------------------------------------------------------
   HF Workbench — 2‑Element Vertical Array
   (Two verticals with user‑defined spacing + phasing)
   - Geometry panel
   - Unified boost panel (two-column .boost-grid)
   - Vertical height + spacing + phasing mode
   - Feedline family + type + length
   - Transformer Requirements (1:1 choke recommended)
--------------------------------------------------------- */

import { requireFrequency, requirePositive, toNumber } from "../validators.js";
import { infoBox, warnBox } from "../dom.js";
import { findBand } from "../constants.js";
import { log } from "../log.js";
import { GeometryEngine } from "../engines/geometry-engine.js";
import { BoostEngine } from "../engines/boost-engine.js";
import { TransformerEngine } from "../engines/transformer-engine.js";

function baseVerticalArrayGain(frac, spacing, mode) {
    // Approximate gain model for 2‑element vertical arrays
    let base = 2.2; // single vertical baseline

    if (spacing < 0.15) base += 0.5;
    else if (spacing < 0.25) base += 1.2;
    else if (spacing < 0.35) base += 1.8;
    else base += 2.2;

    if (mode === "endfire") base += 1.0;
    if (mode === "broadside") base += 0.5;

    return base;
}

export default function initVerticalArray2el(root) {
    const container = document.querySelector("#content") || root;
    if (!container) return;

    container.innerHTML = `
        <section class="tool">
            <h2>2‑Element Vertical Array</h2>

            <h3>Geometry</h3>
            <div class="field-grid">

                <label>Operating frequency (MHz)
                    <input id="va-freq" type="number" step="0.01" value="7.1">
                </label>

                <label>Vertical height (m)
                    <input id="va-height" type="number" step="0.1" value="10">
                </label>

                <label>Element spacing (m)
                    <input id="va-spacing" type="number" step="0.1" value="10">
                </label>

                <label>Phasing mode
                    <select id="va-mode">
                        <option value="endfire">End‑fire (DX)</option>
                        <option value="broadside">Broadside</option>
                        <option value="inphase">In‑phase (omni)</option>
                    </select>
                </label>

                <label>Radial count (each)
                    <input id="va-radials" type="number" step="1" value="4">
                </label>

                <label>Radial length (m)
                    <input id="va-radial-length" type="number" step="0.1" value="10">
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
                <label><input id="va-elevated" type="checkbox"> Elevated Supports</label>

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

            <button id="va-compute" style="margin-top:1rem;">Compute 2‑Element Vertical Array</button>

            <div id="va-summary" class="summary" style="margin-top:1rem;"></div>

        </section>
    `;

    const freqInput = document.getElementById("va-freq");
    const heightInput = document.getElementById("va-height");
    const spacingInput = document.getElementById("va-spacing");
    const modeInput = document.getElementById("va-mode");
    const radialsInput = document.getElementById("va-radials");
    const radialLengthInput = document.getElementById("va-radial-length");

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
        const height = toNumber(heightInput.value);
        const spacing = toNumber(spacingInput.value);
        const mode = modeInput.value;
        const radials = toNumber(radialsInput.value);
        const radialLength = toNumber(radialLengthInput.value);

        requireFrequency(freq, errors);
        requirePositive(height, "Vertical height", errors);
        requirePositive(spacing, "Element spacing", errors);
        requirePositive(radials, "Radial count", errors);
        requirePositive(radialLength, "Radial length", errors);

        if (radials < 1) errors.push("Each vertical must have at least one radial.");

        if (errors.length) {
            summaryDiv.innerHTML = warnBox(errors.join("<br>"));
            return;
        }

        const band = findBand(freq);

        const spacingWL = spacing / (300 / freq); // spacing in wavelengths
        const avgHeight = height / 2;

        const geom = GeometryEngine.computeGeometry({
            freqMHz: freq,
            heightM: avgHeight,
            spanM: height
        });

        const baseGain = baseVerticalArrayGain(geom.frac, spacingWL, mode);

        const feedFamily = feedFamilyInput.value === "ladder" ? "ladder" : "coax";

        const boost = BoostEngine.computeBoost({
            reflectorCount: mode === "endfire" ? 1 : 0,
            directorCount: mode === "endfire" ? 1 : 0,
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

        let toaBase = 18;
        if (mode === "endfire") toaBase = 12;
        if (mode === "broadside") toaBase = 20;

        const finalToa = Math.max(8, Math.min(35, toaBase + (boost.toaShift || 0)));

        const geomLines = [
            `Vertical height: ${height.toFixed(1)} m`,
            `Element spacing: ${spacing.toFixed(1)} m (${spacingWL.toFixed(2)} λ)`,
            `Phasing mode: ${mode}`,
            `Radials per element: ${radials} × ${radialLength.toFixed(1)} m`,
            `Average current height: ${avgHeight.toFixed(1)} m`,
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

        const transformerHtml = TransformerEngine.getTransformerNote("verticalArray2el", feedFamily);

        log("VerticalArray2el", {
            freq,
            height,
            spacing,
            spacingWL,
            mode,
            radials,
            radialLength,
            avgHeight,
            geom,
            baseGain,
            boost,
            totalGain,
            finalToa
        });

        summaryDiv.innerHTML = infoBox(`
            <p><strong>Operating frequency:</strong> ${freq.toFixed(2)} MHz (${band?.label ?? "Unknown band"})</p>

            <p><strong>Base 2‑Element Vertical Array Gain:</strong> ${baseGain.toFixed(1)} dBi</p>

            <p><strong>Geometry details:</strong><br>${geomLines}</p>

            <p><strong>Boost breakdown:</strong><br>${boostLines}</p>

            <p><strong>Total estimated gain:</strong> ${totalGain.toFixed(1)} dBi</p>

            <p><strong>Estimated TOA:</strong> ${finalToa.toFixed(0)}°</p>

            ${transformerHtml}
        `);
    });
}
