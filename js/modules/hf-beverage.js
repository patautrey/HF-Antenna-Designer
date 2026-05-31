/* ---------------------------------------------------------
   HF Workbench — Beverage Antenna (Receive‑Only Longwire)
   - Geometry panel
   - Unified boost panel (two-column .boost-grid)
   - Length + height + termination
   - Directional receive modeling
   - Transformer Requirements (Beverage transformer + ground rod notes)
--------------------------------------------------------- */

import { requireFrequency, requirePositive, toNumber } from "../validators.js";
import { infoBox, warnBox } from "../dom.js";
import { findBand } from "../constants.js";
import { log } from "../log.js";
import { GeometryEngine } from "../engines/geometry-engine.js";
import { BoostEngine } from "../engines/boost-engine.js";
import { TransformerEngine } from "../engines/transformer-engine.js";

function baseBeverageGain(lengthM) {
    if (lengthM < 80) return -5.0;
    if (lengthM < 150) return -3.0;
    if (lengthM < 250) return -1.5;
    return -0.5;
}

export default function initBeverage(root) {
    const container = document.querySelector("#content") || root;
    if (!container) return;

    container.innerHTML = `
        <section class="tool">
            <h2>Beverage Antenna (Receive‑Only)</h2>

            <h3>Geometry</h3>
            <div class="field-grid">

                <label>Operating frequency (MHz)
                    <input id="bv-freq" type="number" step="0.01" value="3.8">
                </label>

                <label>Wire length (m)
                    <input id="bv-length" type="number" step="1" value="200">
                </label>

                <label>Height above ground (m)
                    <input id="bv-height" type="number" step="0.1" value="2">
                </label>

                <label>Termination resistor (Ω)
                    <input id="bv-resistor" type="number" step="10" value="470">
                </label>

                <label>Direction
                    <select id="bv-direction">
                        <option value="forward">Forward (terminated)</option>
                        <option value="bidirectional">Bidirectional (unterminated)</option>
                    </select>
                </label>

            </div>

            <h3>Boost</h3>
            <div class="field-grid boost-grid">

                <label>Time of day
                    <select id="bv-tod">
                        <option value="day">Day</option>
                        <option value="night">Night</option>
                        <option value="dawn">Dawn</option>
                        <option value="dusk">Dusk</option>
                    </select>
                </label>

                <label><input id="bv-seaside" type="checkbox"> Seaside (+10 dB)</label>
                <label><input id="bv-groundscreen" type="checkbox"> Ground Screen / Faraday Cloth</label>
                <label><input id="bv-elevated" type="checkbox"> Elevated Supports</label>

                <label>Feedline family
                    <select id="bv-feed-family">
                        <option value="coax">Coax</option>
                        <option value="ladder">Ladder line</option>
                    </select>
                </label>

                <label>Feedline type
                    <select id="bv-feed-type">
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
                    <input id="bv-feed-length" type="number" step="5" value="150">
                </label>

            </div>

            <button id="bv-compute" style="margin-top:1rem;">Compute Beverage</button>

            <div id="bv-summary" class="summary" style="margin-top:1rem;"></div>

        </section>
    `;

    const freqInput = document.getElementById("bv-freq");
    const lengthInput = document.getElementById("bv-length");
    const heightInput = document.getElementById("bv-height");
    const resistorInput = document.getElementById("bv-resistor");
    const directionInput = document.getElementById("bv-direction");

    const todInput = document.getElementById("bv-tod");
    const seasideInput = document.getElementById("bv-seaside");
    const groundScreenInput = document.getElementById("bv-groundscreen");
    const elevatedInput = document.getElementById("bv-elevated");

    const feedFamilyInput = document.getElementById("bv-feed-family");
    const feedTypeInput = document.getElementById("bv-feed-type");
    const feedLenInput = document.getElementById("bv-feed-length");

    const summaryDiv = document.getElementById("bv-summary");
    const button = document.getElementById("bv-compute");

    button.addEventListener("click", () => {

        const errors = [];

        const freq = toNumber(freqInput.value);
        const length = toNumber(lengthInput.value);
        const height = toNumber(heightInput.value);
        const resistor = toNumber(resistorInput.value);
        const direction = directionInput.value;

        requireFrequency(freq, errors);
        requirePositive(length, "Wire length", errors);
        requirePositive(height, "Height above ground", errors);
        if (direction === "forward") requirePositive(resistor, "Termination resistor", errors);

        if (errors.length) {
            summaryDiv.innerHTML = warnBox(errors.join("<br>"));
            return;
        }

        const band = findBand(freq);

        const baseGain = baseBeverageGain(length);

        const geom = GeometryEngine.computeGeometry({
            freqMHz: freq,
            heightM: height,
            spanM: length
        });

        const feedFamily = feedFamilyInput.value === "ladder" ? "ladder" : "coax";

        const boost = BoostEngine.computeBoost({
            reflectorCount: direction === "forward" ? 1 : 0,
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

        const totalGain = baseGain + boost.totalBoost;

        const finalToa = 60; // Beverage = high-angle receive, fixed

        const geomLines = [
            `Wire length: ${length.toFixed(1)} m`,
            `Height: ${height.toFixed(1)} m`,
            `Direction: ${direction}`,
            direction === "forward" ? `Termination resistor: ${resistor} Ω` : "Unterminated (bidirectional)",
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

        const transformerHtml = TransformerEngine.getTransformerNote("beverage", feedFamily);

        log("Beverage", {
            freq,
            length,
            height,
            resistor,
            direction,
            geom,
            baseGain,
            boost,
            totalGain,
            finalToa
        });

        summaryDiv.innerHTML = infoBox(`
            <p><strong>Operating frequency:</strong> ${freq.toFixed(2)} MHz (${band?.label ?? "Unknown band"})</p>

            <p><strong>Beverage base gain (receive‑only):</strong> ${baseGain.toFixed(1)} dBi</p>

            <p><strong>Geometry details:</strong><br>${geomLines}</p>

            <p><strong>Boost breakdown:</strong><br>${boostLines
