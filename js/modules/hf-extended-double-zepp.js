/* ---------------------------------------------------------
   HF Workbench — Extended Double Zepp (EDZ)
   (≈1.25 λ center-fed wire with strong broadside gain)
   - Geometry panel
   - Unified boost panel (two-column .boost-grid)
   - Total length + height + end height + configuration
   - Feedline family + type + length
   - Transformer Requirements (ladder line recommended; 1:1 choke at shack)
--------------------------------------------------------- */

import { requireFrequency, requirePositive, toNumber } from "../validators.js";
import { infoBox, warnBox } from "../dom.js";
import { findBand } from "../constants.js";
import { log } from "../log.js";
import { GeometryEngine } from "../engines/geometry-engine.js";
import { BoostEngine } from "../engines/boost-engine.js";
import { TransformerEngine } from "../engines/transformer-engine.js";

function baseEDZGain(frac) {
    // EDZ has strong broadside gain due to 1.25 λ length
    if (frac < 0.40) return 3.5;
    if (frac < 0.60) return 4.2;
    if (frac < 0.80) return 4.8;
    return 5.2;
}

export default function initExtendedDoubleZepp(root) {
    const container = document.querySelector("#content") || root;
    if (!container) return;

    container.innerHTML = `
        <section class="tool">
            <h2>Extended Double Zepp (EDZ)</h2>

            <h3>Geometry</h3>
            <div class="field-grid">

                <label>Total wire length (m)
                    <input id="edz-length" type="number" step="0.1" value="52">
                </label>

                <label>Operating frequency (MHz)
                    <input id="edz-freq" type="number" step="0.01" value="7.1">
                </label>

                <label>Center height (m)
                    <input id="edz-height" type="number" step="0.1" value="12">
                </label>

                <label>End height (m)
                    <input id="edz-endheight" type="number" step="0.1" value="6">
                </label>

                <label>Configuration
                    <select id="edz-config">
                        <option value="flat">Flat / horizontal</option>
                        <option value="invertedV">Inverted‑V</option>
                        <option value="sloper">Sloper</option>
                    </select>
                </label>

            </div>

            <h3>Boost</h3>
            <div class="field-grid boost-grid">

                <label>Time of day
                    <select id="edz-tod">
                        <option value="day">Day</option>
                        <option value="night">Night</option>
                        <option value="dawn">Dawn</option>
                        <option value="dusk">Dusk</option>
                    </select>
                </label>

                <label><input id="edz-seaside" type="checkbox"> Seaside (+10 dB)</label>
                <label><input id="edz-groundscreen" type="checkbox"> Ground Screen / Faraday Cloth</label>
                <label><input id="edz-elevated" type="checkbox"> Elevated Supports</label>

                <label>Feedline family
                    <select id="edz-feed-family">
                        <option value="ladder">Ladder line (recommended)</option>
                        <option value="coax">Coax</option>
                    </select>
                </label>

                <label>Feedline type
                    <select id="edz-feed-type">
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
                    <input id="edz-feed-length" type="number" step="5" value="75">
                </label>

            </div>

            <button id="edz-compute" style="margin-top:1rem;">Compute Extended Double Zepp</button>

            <div id="edz-summary" class="summary" style="margin-top:1rem;"></div>

        </section>
    `;

    const lengthInput = document.getElementById("edz-length");
    const freqInput = document.getElementById("edz-freq");
    const heightInput = document.getElementById("edz-height");
    const endHeightInput = document.getElementById("edz-endheight");
    const configInput = document.getElementById("edz-config");

    const todInput = document.getElementById("edz-tod");
    const seasideInput = document.getElementById("edz-seaside");
    const groundScreenInput = document.getElementById("edz-groundscreen");
    const elevatedInput = document.getElementById("edz-elevated");

    const feedFamilyInput = document.getElementById("edz-feed-family");
    const feedTypeInput = document.getElementById("edz-feed-type");
    const feedLenInput = document.getElementById("edz-feed-length");

    const summaryDiv = document.getElementById("edz-summary");
    const button = document.getElementById("edz-compute");

    button.addEventListener("click", () => {

        const errors = [];

        const length = toNumber(lengthInput.value);
        const freq = toNumber(freqInput.value);
        const height = toNumber(heightInput.value);
        const endHeight = toNumber(endHeightInput.value);
        const config = configInput.value;

        requirePositive(length, "Total wire length", errors);
        requireFrequency(freq, errors);
        requirePositive(height, "Center height", errors);
        requirePositive(endHeight, "End height", errors);

        if (length < 1) errors.push("Length must be > 1 m.");

        if (errors.length) {
            summaryDiv.innerHTML = warnBox(errors.join("<br>"));
            return;
        }

        const band = findBand(freq);
        const avgHeight = (height + endHeight) / 2;

        const geom = GeometryEngine.computeGeometry({
            freqMHz: freq,
            heightM: avgHeight,
            spanM: length
        });

        const baseGain = baseEDZGain(geom.frac);

        const feedFamily = feedFamilyInput.value === "ladder" ? "ladder" : "coax";

        const boost = BoostEngine.computeBoost({
            reflectorCount: 0,
            directorCount: 0,
            timeOfDay: todInput.value,
            seaside: seasideInput.checked,
            groundScreen: groundScreenInput.checked,
            elevatedRadials: elevatedInput.checked,
            nvisReflector: config === "flat",
            feedlineFamily: feedFamily,
            feedlineType: feedTypeInput.value,
            feedlineLengthFt: toNumber(feedLenInput.value),
            dxTurboPatternBonus: false
        });

        const totalGain = baseGain + geom.totalGeomGainDelta + boost.totalBoost;

        let toaBase = 28;
        if (config === "invertedV") toaBase = 38;
        if (config === "sloper") toaBase = 22;

        const finalToa = Math.max(12, Math.min(70, toaBase + (boost.toaShift || 0)));

        const geomLines = [
            `Total length: ${length.toFixed(1)} m (≈1.25 λ recommended)`,
            `Center height: ${height.toFixed(1)} m`,
            `End height: ${endHeight.toFixed(1)} m`,
            `Configuration: ${config}`,
            `Average height: ${avgHeight.toFixed(1)} m`,
            `EDZ produces strong broadside gain and narrow lobes.`,
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

        const transformerHtml = TransformerEngine.getTransformerNote("extendedDoubleZepp", feedFamily);

        log("ExtendedDoubleZepp", {
            length,
            freq,
            height,
            endHeight,
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

            <p><strong>Base EDZ Gain:</strong> ${baseGain.toFixed(1)} dBi</p>

            <p><strong>Geometry details:</strong><br>${geomLines}</p>

            <p><strong>Boost breakdown:</strong><br>${boostLines}</p>

            <p><strong>Total estimated gain:</strong> ${totalGain.toFixed(1)} dBi</p>

            <p><strong>Estimated TOA:</strong> ${finalToa.toFixed(0)}°</p>

            ${transformerHtml}
        `);
    });
}
