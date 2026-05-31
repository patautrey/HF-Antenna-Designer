/* ---------------------------------------------------------
   HF Workbench — Directional Sloping Longwire
   (Long sloping wire with directional bias)
   - Geometry panel
   - Unified boost panel (two-column .boost-grid)
   - Longwire length + slope + azimuth direction
   - Feedline family + type + length
   - Transformer Requirements (9:1 unun recommended)
--------------------------------------------------------- */

import { requireFrequency, requirePositive, toNumber } from "../validators.js";
import { infoBox, warnBox } from "../dom.js";
import { findBand } from "../constants.js";
import { log } from "../log.js";
import { GeometryEngine } from "../engines/geometry-engine.js";
import { BoostEngine } from "../engines/boost-engine.js";
import { TransformerEngine } from "../engines/transformer-engine.js";

function baseDirectionalSloperGain(frac) {
    if (frac < 0.40) return 0.6;
    if (frac < 0.60) return 1.0;
    if (frac < 0.80) return 1.3;
    return 1.6;
}

export default function initDirectionalSlopingLongwire(root) {
    const container = document.querySelector("#content") || root;
    if (!container) return;

    container.innerHTML = `
        <section class="tool">
            <h2>Directional Sloping Longwire</h2>

            <h3>Geometry</h3>
            <div class="field-grid">

                <label>Operating frequency (MHz)
                    <input id="dsl-freq" type="number" step="0.01" value="7.1">
                </label>

                <label>Wire length (m)
                    <input id="dsl-length" type="number" step="0.5" value="42">
                </label>

                <label>High end height (m)
                    <input id="dsl-high" type="number" step="0.5" value="14">
                </label>

                <label>Low end height (m)
                    <input id="dsl-low" type="number" step="0.5" value="2">
                </label>

                <label>Azimuth direction (degrees)
                    <input id="dsl-az" type="number" step="1" value="90">
                </label>

            </div>

            <h3>Boost</h3>
            <div class="field-grid boost-grid">

                <label>Time of day
                    <select id="dsl-tod">
                        <option value="day">Day</option>
                        <option value="night">Night</option>
                        <option value="dawn">Dawn</option>
                        <option value="dusk">Dusk</option>
                    </select>
                </label>

                <label><input id="dsl-seaside" type="checkbox"> Seaside (+10 dB)</label>
                <label><input id="dsl-groundscreen" type="checkbox"> Ground Screen / Faraday Cloth</label>
                <label><input id="dsl-elevated" type="checkbox"> Elevated Supports</label>

                <label>Feedline family
                    <select id="dsl-feed-family">
                        <option value="coax">Coax</option>
                        <option value="ladder">Ladder line</option>
                    </select>
                </label>

                <label>Feedline type
                    <select id="dsl-feed-type">
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
                    <input id="dsl-feed-length" type="number" step="5" value="75">
                </label>

            </div>

            <button id="dsl-compute" style="margin-top:1rem;">Compute Directional Sloping Longwire</button>

            <div id="dsl-summary" class="summary" style="margin-top:1rem;"></div>

        </section>
    `;

    const freqInput = document.getElementById("dsl-freq");
    const lengthInput = document.getElementById("dsl-length");
    const highInput = document.getElementById("dsl-high");
    const lowInput = document.getElementById("dsl-low");
    const azInput = document.getElementById("dsl-az");

    const todInput = document.getElementById("dsl-tod");
    const seasideInput = document.getElementById("dsl-seaside");
    const groundScreenInput = document.getElementById("dsl-groundscreen");
    const elevatedInput = document.getElementById("dsl-elevated");

    const feedFamilyInput = document.getElementById("dsl-feed-family");
    const feedTypeInput = document.getElementById("dsl-feed-type");
    const feedLenInput = document.getElementById("dsl-feed-length");

    const summaryDiv = document.getElementById("dsl-summary");
    const button = document.getElementById("dsl-compute");

    button.addEventListener("click", () => {

        const errors = [];

        const freq = toNumber(freqInput.value);
        const length = toNumber(lengthInput.value);
        const high = toNumber(highInput.value);
        const low = toNumber(lowInput.value);
        const az = toNumber(azInput.value);

        requireFrequency(freq, errors);
        requirePositive(length, "Wire length", errors);
        requirePositive(high, "High end height", errors);
        requirePositive(low, "Low end height", errors);
        requirePositive(az, "Azimuth direction", errors);

        if (high <= low) {
            errors.push("High end height must be greater than low end height.");
        }

        if (az < 0 || az >= 360) {
            errors.push("Azimuth must be between 0° and 359°.");
        }

        if (errors.length) {
            summaryDiv.innerHTML = warnBox(errors.join("<br>"));
            return;
        }

        const band = findBand(freq);
        const avgHeight = (high + low) / 2;

        const geom = GeometryEngine.computeGeometry({
            freqMHz: freq,
            heightM: avgHeight,
            spanM: length
        });

        const baseGain = baseDirectionalSloperGain(geom.frac);

        const feedFamily = feedFamilyInput.value === "ladder" ? "ladder" : "coax";

        const boost = BoostEngine.computeBoost({
            reflectorCount: 1,
            directorCount: 1,
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

        const finalToa = Math.max(10, Math.min(55, geom.toa + boost.toaShift));

        const geomLines = [
            `Wire length: ${length.toFixed(1)} m`,
            `High end height: ${high.toFixed(1)} m`,
            `Low end height: ${low.toFixed(1)} m`,
            `Average height: ${avgHeight.toFixed(1)} m`,
            `Azimuth direction: ${az.toFixed(0)}°`,
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

        const transformerHtml = TransformerEngine.getTransformerNote("directionalSlopingLongwire", feedFamily);

        log("DirectionalSlopingLongwire", {
            freq,
            length,
            high,
            low,
            az,
            avgHeight,
            geom,
            baseGain,
            boost,
            totalGain,
            finalToa
        });

        summaryDiv.innerHTML = infoBox(`
            <p><strong>Operating frequency:</strong> ${freq.toFixed(2)} MHz (${band?.label ?? "Unknown band"})</p>

            <p><strong>Base Directional Sloper Gain:</strong> ${baseGain.toFixed(1)} dBi</p>

            <p><strong>Geometry details:</strong><br>${geomLines}</p>

            <p><strong>Boost breakdown:</strong><br>${boostLines}</p>

            <p><strong>Total estimated gain:</strong> ${totalGain.toFixed(1)} dBi</p>

            <p><strong>Estimated TOA:</strong> ${finalToa.toFixed(0)}°</p>

            ${transformerHtml}
        `);
    });
}
