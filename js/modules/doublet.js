/* ---------------------------------------------------------
   HF Workbench — Doublet Antenna
   - Geometry panel
   - Unified boost panel (two-column .boost-grid)
   - Feedline family + type + length
   - Transformer Requirements (1:1 current balun + balanced line notes)
--------------------------------------------------------- */

import { requireFrequency, requirePositive, toNumber } from "../validators.js";
import { infoBox, warnBox } from "../dom.js";
import { findBand } from "../constants.js";
import { log } from "../log.js";
import { GeometryEngine } from "../engines/geometry-engine.js";
import { BoostEngine } from "../engines/boost-engine.js";
import { TransformerEngine } from "../engines/transformer-engine.js";

function baseDoubletGain(frac) {
    if (frac < 0.40) return 1.9;
    if (frac < 0.60) return 2.3;
    if (frac < 0.80) return 2.6;
    return 2.9;
}

export default function initDoublet(root) {
    const container = document.querySelector("#content") || root;
    if (!container) return;

    container.innerHTML = `
        <section class="tool">
            <h2>Doublet Antenna</h2>

            <h3>Geometry</h3>
            <div class="field-grid">
                <label>Frequency (MHz)
                    <input id="db-freq" type="number" step="0.01" value="7.1">
                </label>

                <label>Total span (m)
                    <input id="db-span" type="number" step="0.5" value="40">
                </label>

                <label>Average height (m)
                    <input id="db-height" type="number" step="0.5" value="10">
                </label>

                <label>Configuration
                    <select id="db-config">
                        <option value="flat-top">Flat-top</option>
                        <option value="inverted-V">Inverted-V</option>
                        <option value="sloper">Sloper</option>
                        <option value="irregular">Irregular</option>
                    </select>
                </label>
            </div>

            <h3>Boost</h3>
            <div class="field-grid boost-grid">
                <label>Time of day
                    <select id="db-tod">
                        <option value="day">Day</option>
                        <option value="night">Night</option>
                        <option value="dawn">Dawn</option>
                        <option value="dusk">Dusk</option>
                    </select>
                </label>

                <label><input id="db-seaside" type="checkbox"> Seaside (+10 dB)</label>
                <label><input id="db-groundscreen" type="checkbox"> Ground Screen / Faraday Cloth</label>
                <label><input id="db-elevated" type="checkbox"> Elevated Feed / Supports</label>

                <label>Feedline family
                    <select id="db-feed-family">
                        <option value="ladder">Ladder line</option>
                        <option value="coax">Coax</option>
                    </select>
                </label>

                <label>Feedline type
                    <select id="db-feed-type">
                        <option value="450Ω">450Ω window line</option>
                        <option value="300Ω">300Ω twin-lead</option>
                        <option value="600Ω">600Ω open wire</option>
                        <option value="RG-213">RG-213 (not ideal)</option>
                        <option value="LMR-400">LMR-400 (not ideal)</option>
                        <option value="RG-8X">RG-8X (not ideal)</option>
                    </select>
                </label>

                <label>Feedline length (ft)
                    <input id="db-feed-length" type="number" step="5" value="75">
                </label>
            </div>

            <button id="db-compute" style="margin-top:1rem;">Compute Doublet</button>

            <div id="db-summary" class="summary" style="margin-top:1rem;"></div>
        </section>
    `;

    const freqInput = document.getElementById("db-freq");
    const spanInput = document.getElementById("db-span");
    const heightInput = document.getElementById("db-height");
    const configInput = document.getElementById("db-config");

    const todInput = document.getElementById("db-tod");
    const seasideInput = document.getElementById("db-seaside");
    const groundScreenInput = document.getElementById("db-groundscreen");
    const elevatedInput = document.getElementById("db-elevated");

    const feedFamilyInput = document.getElementById("db-feed-family");
    const feedTypeInput = document.getElementById("db-feed-type");
    const feedLenInput = document.getElementById("db-feed-length");

    const summaryDiv = document.getElementById("db-summary");
    const button = document.getElementById("db-compute");

    button.addEventListener("click", () => {
        const errors = [];

        const freq = toNumber(freqInput.value);
        const span = toNumber(spanInput.value);
        const height = toNumber(heightInput.value);
        const config = configInput.value;

        requireFrequency(freq, errors);
        requirePositive(span, "Total span", errors);
        requirePositive(height, "Average height", errors);

        if (errors.length) {
            summaryDiv.innerHTML = warnBox(errors.join("<br>"));
            return;
        }

        const band = findBand(freq);

        const geom = GeometryEngine.computeGeometry({
            freqMHz: freq,
            heightM: height,
            spanM: span
        });

        const baseGain = baseDoubletGain(geom.frac);

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
        const finalToa = Math.max(25, Math.min(85, geom.toa + boost.toaShift));

        const geomLines = [
            `Span: ${span.toFixed(1)} m`,
            `Configuration: ${config}`,
            ...(geom.components.length ? geom.components.map(c => c.note ?? "") : [])
        ].join("<br>");

        const boostLines = boost.components.length
            ? boost.components.map(d => {
                const parts = [];
                if (d.boost) parts.push(`${d.boost.toFixed(1)} dB from ${d.label}`);
                else parts.push(d.label);
                if (d.toaShift) parts.push(`TOA shift ${d.toaShift > 0 ? "+" : ""}${
