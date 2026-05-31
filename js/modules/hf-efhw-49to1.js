/* ---------------------------------------------------------
   HF Workbench — EFHW (49:1 End‑Fed Half‑Wave)
   - Geometry panel
   - Unified boost panel (two-column .boost-grid)
   - Wire length + band + height + sloping option
   - Feedline family + type + length
   - Transformer Requirements (49:1 EFHW transformer + choke)
--------------------------------------------------------- */

import { requireFrequency, requirePositive, toNumber } from "../validators.js";
import { infoBox, warnBox } from "../dom.js";
import { findBand } from "../constants.js";
import { log } from "../log.js";
import { GeometryEngine } from "../engines/geometry-engine.js";
import { BoostEngine } from "../engines/boost-engine.js";
import { TransformerEngine } from "../engines/transformer-engine.js";

function baseEFHWGain(frac) {
    // EFHW behaves like an end-fed dipole / extended wire
    if (frac < 0.40) return 1.5;
    if (frac < 0.60) return 2.0;
    if (frac < 0.80) return 2.4;
    return 2.7;
}

export default function initEFHW49to1(root) {
    const container = document.querySelector("#content") || root;
    if (!container) return;

    container.innerHTML = `
        <section class="tool">
            <h2>EFHW (49:1 End‑Fed Half‑Wave)</h2>

            <h3>Geometry</h3>
            <div class="field-grid">

                <label>Operating frequency (MHz)
                    <input id="efhw-freq" type="number" step="0.01" value="7.1">
                </label>

                <label>Wire length (m)
                    <input id="efhw-length" type="number" step="0.1" value="20.0">
                </label>

                <label>Feedpoint height (m)
                    <input id="efhw-feedheight" type="number" step="0.1" value="3.0">
                </label>

                <label>Far end height (m)
                    <input id="efhw-farheight" type="number" step="0.1" value="8.0">
                </label>

                <label>Configuration
                    <select id="efhw-config">
                        <option value="sloper">Sloper</option>
                        <option value="invertedL">Inverted‑L</option>
                        <option value="horizontal">Mostly horizontal</option>
                    </select>
                </label>

            </div>

            <h3>Boost</h3>
            <div class="field-grid boost-grid">

                <label>Time of day
                    <select id="efhw-tod">
                        <option value="day">Day</option>
                        <option value="night">Night</option>
                        <option value="dawn">Dawn</option>
                        <option value="dusk">Dusk</option>
                    </select>
                </label>

                <label><input id="efhw-seaside" type="checkbox"> Seaside (+10 dB)</label>
                <label><input id="efhw-groundscreen" type="checkbox"> Ground Screen / Faraday Cloth</label>
                <label><input id="efhw-elevated" type="checkbox"> Elevated Supports</label>

                <label>Feedline family
                    <select id="efhw-feed-family">
                        <option value="coax">Coax</option>
                        <option value="ladder">Ladder line</option>
                    </select>
                </label>

                <label>Feedline type
                    <select id="efhw-feed-type">
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
                    <input id="efhw-feed-length" type="number" step="5" value="75">
                </label>

            </div>

            <button id="efhw-compute" style="margin-top:1rem;">Compute EFHW (49:1)</button>

            <div id="efhw-summary" class="summary" style="margin-top:1rem;"></div>

        </section>
    `;

    const freqInput = document.getElementById("efhw-freq");
    const lengthInput = document.getElementById("efhw-length");
    const feedHeightInput = document.getElementById("efhw-feedheight");
    const farHeightInput = document.getElementById("efhw-farheight");
    const configInput = document.getElementById("efhw-config");

    const todInput = document.getElementById("efhw-tod");
    const seasideInput = document.getElementById("efhw-seaside");
    const groundScreenInput = document.getElementById("efhw-groundscreen");
    const elevatedInput = document.getElementById("efhw-elevated");

    const feedFamilyInput = document.getElementById("efhw-feed-family");
    const feedTypeInput = document.getElementById("efhw-feed-type");
    const feedLenInput = document.getElementById("efhw-feed-length");

    const summaryDiv = document.getElementById("efhw-summary");
    const button = document.getElementById("efhw-compute");

    button.addEventListener("click", () => {

        const errors = [];

        const freq = toNumber(freqInput.value);
        const length = toNumber(lengthInput.value);
        const feedHeight = toNumber(feedHeightInput.value);
        const farHeight = toNumber(farHeightInput.value);
        const config = configInput.value;

        requireFrequency(freq, errors);
        requirePositive(length, "Wire length", errors);
        requirePositive(feedHeight, "Feedpoint height", errors);
        requirePositive(farHeight, "Far end height", errors);

        if (errors.length) {
            summaryDiv.innerHTML = warnBox(errors.join("<br>"));
            return;
        }

        const band = findBand(freq);

        const avgHeight = (feedHeight + farHeight) / 2;

        const geom = GeometryEngine.computeGeometry({
            freqMHz: freq,
            heightM: avgHeight,
            spanM: length
        });

        const baseGain = baseEFHWGain(geom.frac);

        const feedFamily = feedFamilyInput.value === "ladder" ? "ladder" : "coax";

        const boost = BoostEngine.computeBoost({
            reflectorCount: 0,
            directorCount: 0,
            timeOfDay: todInput.value,
            seaside: seasideInput.checked,
            groundScreen: groundScreenInput.checked,
            elevatedRadials: elevatedInput.checked,
            nvisReflector: config === "horizontal",
            feedlineFamily: feedFamily,
            feedlineType: feedTypeInput.value,
            feedlineLengthFt: toNumber(feedLenInput.value),
            dxTurboPatternBonus: false
        });

        const totalGain = baseGain + geom.totalGeomGainDelta + boost.totalBoost;

        let toaBase;
        if (config === "sloper") toaBase = 18;
        else if (config === "invertedL") toaBase = 25;
        else toaBase = 45;

        const finalToa = Math.max(10, Math.min(80, toaBase + (boost.toaShift || 0)));

        const geomLines = [
            `Wire length: ${length.toFixed(1)} m`,
            `Feedpoint height: ${feedHeight.toFixed(1)} m`,
            `Far end height: ${farHeight.toFixed(1)} m`,
            `Configuration: ${config}`,
            `Average height: ${avgHeight.toFixed(1)} m`,
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

        const transformerHtml = TransformerEngine.getTransformerNote("efhw49to1", feedFamily);

        log("EFHW49to1", {
            freq,
            length,
            feedHeight,
            farHeight,
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

            <p><strong>Base EFHW Gain:</strong> ${baseGain.toFixed(1)} dBi</p>

            <p><strong>Geometry details:</strong><br>${geomLines}</p>

            <p><strong>Boost breakdown:</strong><br>${boostLines}</p>

            <p><strong>Total estimated gain:</strong> ${totalGain.toFixed(1)} dBi</p>

            <p><strong>Estimated TOA:</strong> ${finalToa.toFixed(0)}°</p>

            ${transformerHtml}
        `);
    });
}
