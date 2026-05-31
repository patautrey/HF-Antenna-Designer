/* ---------------------------------------------------------
   HF Workbench — Sterba Curtain
   (Multi‑wire broadside curtain array for strong directional gain)
   - Geometry panel
   - Unified boost panel (two-column .boost-grid)
   - Total height + total width + number of bays + wire spacing
   - Feedline family + type + length
   - Transformer Requirements (1:1 choke recommended; phasing harness required)
--------------------------------------------------------- */

import { requireFrequency, requirePositive, toNumber } from "../validators.js";
import { infoBox, warnBox } from "../dom.js";
import { findBand } from "../constants.js";
import { log } from "../log.js";
import { GeometryEngine } from "../engines/geometry-engine.js";
import { BoostEngine } from "../engines/boost-engine.js";
import { TransformerEngine } from "../engines/transformer-engine.js";

function baseSterbaGain(frac, bays) {
    // Sterba Curtain gain increases with number of bays
    let base = 3.0; // single bay baseline
    if (bays === 2) base += 2.0;
    if (bays === 3) base += 3.2;
    if (bays >= 4) base += 4.0;
    return base;
}

export default function initSterbaCurtain(root) {
    const container = document.querySelector("#content") || root;
    if (!container) return;

    container.innerHTML = `
        <section class="tool">
            <h2>Sterba Curtain</h2>

            <h3>Geometry</h3>
            <div class="field-grid">

                <label>Total width (m)
                    <input id="st-width" type="number" step="0.1" value="40">
                </label>

                <label>Total height (m)
                    <input id="st-height" type="number" step="0.1" value="20">
                </label>

                <label>Operating frequency (MHz)
                    <input id="st-freq" type="number" step="0.01" value="7.1">
                </label>

                <label>Number of bays
                    <input id="st-bays" type="number" step="1" value="2">
                </label>

                <label>Wire spacing (m)
                    <input id="st-spacing" type="number" step="0.1" value="2">
                </label>

                <label>Configuration
                    <select id="st-config">
                        <option value="vertical">Vertical curtain</option>
                        <option value="tilted">Tilted</option>
                        <option value="sloped">Sloped</option>
                    </select>
                </label>

            </div>

            <h3>Boost</h3>
            <div class="field-grid boost-grid">

                <label>Time of day
                    <select id="st-tod">
                        <option value="day">Day</option>
                        <option value="night">Night</option>
                        <option value="dawn">Dawn</option>
                        <option value="dusk">Dusk</option>
                    </select>
                </label>

                <label><input id="st-seaside" type="checkbox"> Seaside (+10 dB)</label>
                <label><input id="st-groundscreen" type="checkbox"> Ground Screen / Faraday Cloth</label>
                <label><input id="st-elevated" type="checkbox"> Elevated Supports</label>

                <label>Feedline family
                    <select id="st-feed-family">
                        <option value="ladder">Ladder line (recommended)</option>
                        <option value="coax">Coax</option>
                    </select>
                </label>

                <label>Feedline type
                    <select id="st-feed-type">
                        <option value="450Ω">450Ω window line</option>
                        <option value="300Ω">300Ω twin-lead</option>
                        <option value="600Ω">600Ω open wire</option>
                        <option value="RG-213">RG-213</option>
                        <option value="LMR-400">LMR-400</option>
                        <option value="RG-8X">RG-8X</option>
                        <option value="RG-58">RG-58</option>
                    </select>
                </label>

                <label>Feedline length (ft)
                    <input id="st-feed-length" type="number" step="5" value="75">
                </label>

            </div>

            <button id="st-compute" style="margin-top:1rem;">Compute Sterba Curtain</button>

            <div id="st-summary" class="summary" style="margin-top:1rem;"></div>

        </section>
    `;

    const widthInput = document.getElementById("st-width");
    const heightInput = document.getElementById("st-height");
    const freqInput = document.getElementById("st-freq");
    const baysInput = document.getElementById("st-bays");
    const spacingInput = document.getElementById("st-spacing");
    const configInput = document.getElementById("st-config");

    const todInput = document.getElementById("st-tod");
    const seasideInput = document.getElementById("st-seaside");
    const groundScreenInput = document.getElementById("st-groundscreen");
    const elevatedInput = document.getElementById("st-elevated");

    const feedFamilyInput = document.getElementById("st-feed-family");
    const feedTypeInput = document.getElementById("st-feed-type");
    const feedLenInput = document.getElementById("st-feed-length");

    const summaryDiv = document.getElementById("st-summary");
    const button = document.getElementById("st-compute");

    button.addEventListener("click", () => {

        const errors = [];

        const width = toNumber(widthInput.value);
        const height = toNumber(heightInput.value);
        const freq = toNumber(freqInput.value);
        const bays = toNumber(baysInput.value);
        const spacing = toNumber(spacingInput.value);
        const config = configInput.value;

        requirePositive(width, "Total width", errors);
        requirePositive(height, "Total height", errors);
        requireFrequency(freq, errors);
        requirePositive(bays, "Number of bays", errors);
        requirePositive(spacing, "Wire spacing", errors);

        if (bays < 1) errors.push("Sterba Curtain must have at least one bay.");

        if (errors.length) {
            summaryDiv.innerHTML = warnBox(errors.join("<br>"));
            return;
        }

        const band = findBand(freq);

        const avgHeight = height / 2;

        const geom = GeometryEngine.computeGeometry({
            freqMHz: freq,
            heightM: avgHeight,
            spanM: width
        });

        const baseGain = baseSterbaGain(geom.frac, bays);

        const feedFamily = feedFamilyInput.value === "ladder" ? "ladder" : "coax";

        const boost = BoostEngine.computeBoost({
            reflectorCount: bays > 1 ? 1 : 0,
            directorCount: bays > 2 ? 1 : 0,
            timeOfDay: todInput.value,
            seaside: seasideInput.checked,
            groundScreen: groundScreenInput.checked,
            elevatedRadials: elevatedInput.checked,
            nvisReflector: config !== "vertical",
            feedlineFamily: feedFamily,
            feedlineType: feedTypeInput.value,
            feedlineLengthFt: toNumber(feedLenInput.value),
            dxTurboPatternBonus: true
        });

        const totalGain = baseGain + geom.totalGeomGainDelta + boost.totalBoost;

        let toaBase = 18;
        if (config === "tilted") toaBase = 22;
        if (config === "sloped") toaBase = 25;

        const finalToa = Math.max(10, Math.min(40, toaBase + (boost.toaShift || 0)));

        const geomLines = [
            `Total width: ${width.toFixed(1)} m`,
            `Total height: ${height.toFixed(1)} m`,
            `Number of bays: ${bays}`,
            `Wire spacing: ${spacing.toFixed(1)} m`,
            `Configuration: ${config}`,
            `Sterba Curtains provide strong broadside gain and narrow patterns.`,
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

        const transformerHtml = TransformerEngine.getTransformerNote("sterbaCurtain", feedFamily);

        log("SterbaCurtain", {
            width,
            height,
            freq,
            bays,
            spacing,
            config,
            avgHeight,
            geom,
            baseGain,
            boost,
            totalGain,
            finalToa
        });

        summaryDiv.innerHTML = infoBox(`
            <p><strong>Operating frequency:</strong> ${freq.toFixed(2)} MHz (${band?.label ?? "Unknown band"})</p>

            <p><strong>Base Sterba Curtain Gain:</strong> ${baseGain.toFixed(1)} dBi</p>

            <p><strong>Geometry details:</strong><br>${geomLines}</p>

            <p><strong>Boost breakdown:</strong><br>${boostLines}</p>

            <p><strong>Total estimated gain:</strong> ${totalGain.toFixed(1)} dBi</p>

            <p><strong>Estimated TOA:</strong> ${finalToa.toFixed(0)}°</p>

            ${transformerHtml}
        `);
    });
}
