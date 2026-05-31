/* ---------------------------------------------------------
   HF Workbench — 1/4‑Wave Vertical
   (Classic ground‑mounted or elevated vertical radiator)
   - Geometry panel
   - Unified boost panel (two-column .boost-grid)
   - Vertical height + radial system + mounting type
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

function baseQuarterWaveGain(frac) {
    // Typical 1/4‑wave vertical gain profile
    if (frac < 0.40) return 1.8;
    if (frac < 0.60) return 2.2;
    if (frac < 0.80) return 2.6;
    return 2.9;
}

export default function initQuarterWaveVertical(root) {
    const container = document.querySelector("#content") || root;
    if (!container) return;

    container.innerHTML = `
        <section class="tool">
            <h2>1/4‑Wave Vertical</h2>

            <h3>Geometry</h3>
            <div class="field-grid">

                <label>Operating frequency (MHz)
                    <input id="qv-freq" type="number" step="0.01" value="7.1">
                </label>

                <label>Vertical height (m)
                    <input id="qv-height" type="number" step="0.1" value="10">
                </label>

                <label>Radial count
                    <input id="qv-radials" type="number" step="1" value="4">
                </label>

                <label>Radial length (m)
                    <input id="qv-radial-length" type="number" step="0.1" value="10">
                </label>

                <label>Mounting
                    <select id="qv-mount">
                        <option value="ground">Ground‑mounted</option>
                        <option value="elevated">Elevated</option>
                    </select>
                </label>

            </div>

            <h3>Boost</h3>
            <div class="field-grid boost-grid">

                <label>Time of day
                    <select id="qv-tod">
                        <option value="day">Day</option>
                        <option value="night">Night</option>
                        <option value="dawn">Dawn</option>
                        <option value="dusk">Dusk</option>
                    </select>
                </label>

                <label><input id="qv-seaside" type="checkbox"> Seaside (+10 dB)</label>
                <label><input id="qv-groundscreen" type="checkbox"> Ground Screen / Faraday Cloth</label>
                <label><input id="qv-elevated" type="checkbox"> Elevated Supports</label>

                <label>Feedline family
                    <select id="qv-feed-family">
                        <option value="coax">Coax</option>
                        <option value="ladder">Ladder line</option>
                    </select>
                </label>

                <label>Feedline type
                    <select id="qv-feed-type">
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
                    <input id="qv-feed-length" type="number" step="5" value="75">
                </label>

            </div>

            <button id="qv-compute" style="margin-top:1rem;">Compute 1/4‑Wave Vertical</button>

            <div id="qv-summary" class="summary" style="margin-top:1rem;"></div>

        </section>
    `;

    const freqInput = document.getElementById("qv-freq");
    const heightInput = document.getElementById("qv-height");
    const radialsInput = document.getElementById("qv-radials");
    const radialLengthInput = document.getElementById("qv-radial-length");
    const mountInput = document.getElementById("qv-mount");

    const todInput = document.getElementById("qv-tod");
    const seasideInput = document.getElementById("qv-seaside");
    const groundScreenInput = document.getElementById("qv-groundscreen");
    const elevatedInput = document.getElementById("qv-elevated");

    const feedFamilyInput = document.getElementById("qv-feed-family");
    const feedTypeInput = document.getElementById("qv-feed-type");
    const feedLenInput = document.getElementById("qv-feed-length");

    const summaryDiv = document.getElementById("qv-summary");
    const button = document.getElementById("qv-compute");

    button.addEventListener("click", () => {

        const errors = [];

        const freq = toNumber(freqInput.value);
        const height = toNumber(heightInput.value);
        const radials = toNumber(radialsInput.value);
        const radialLength = toNumber(radialLengthInput.value);
        const mount = mountInput.value;

        requireFrequency(freq, errors);
        requirePositive(height, "Vertical height", errors);
        requirePositive(radials, "Radial count", errors);
        requirePositive(radialLength, "Radial length", errors);

        if (radials < 1) errors.push("At least one radial is required.");

        if (errors.length) {
            summaryDiv.innerHTML = warnBox(errors.join("<br>"));
            return;
        }

        const band = findBand(freq);

        const avgHeight = mount === "ground" ? height / 2 : height;

        const geom = GeometryEngine.computeGeometry({
            freqMHz: freq,
            heightM: avgHeight,
            spanM: height
        });

        const baseGain = baseQuarterWaveGain(geom.frac);

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

        const finalToa = Math.max(8, Math.min(28, geom.toa + boost.toaShift));

        const geomLines = [
            `Vertical height: ${height.toFixed(1)} m`,
            `Radials: ${radials} × ${radialLength.toFixed(1)} m`,
            `Mounting: ${mount}`,
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

        const transformerHtml = TransformerEngine.getTransformerNote("quarterWaveVertical", feedFamily);

        log("QuarterWaveVertical", {
            freq,
            height,
            radials,
            radialLength,
            mount,
            avgHeight,
            geom,
            baseGain,
            boost,
            totalGain,
            finalToa
        });

        summaryDiv.innerHTML = infoBox(`
            <p><strong>Operating frequency:</strong> ${freq.toFixed(2)} MHz (${band?.label ?? "Unknown band"})</p>

            <p><strong>Base 1/4‑Wave Vertical Gain:</strong> ${baseGain.toFixed(1)} dBi</p>

            <p><strong>Geometry details:</strong><br>${geomLines}</p>

            <p><strong>Boost breakdown:</strong><br>${boostLines}</p>

            <p><strong>Total estimated gain:</strong> ${totalGain.toFixed(1)} dBi</p>

            <p><strong>Estimated TOA:</strong> ${finalToa.toFixed(0)}°</p>

            ${transformerHtml}
        `);
    });
}
