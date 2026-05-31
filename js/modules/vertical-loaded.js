/* ---------------------------------------------------------
   HF Workbench — Loaded Vertical (Base‑Loaded / Center‑Loaded)
   - Geometry panel
   - Unified boost panel (two-column .boost-grid)
   - Loading coil position + inductance
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

function baseLoadedVerticalGain(frac) {
    if (frac < 0.40) return 0.8;
    if (frac < 0.60) return 1.3;
    if (frac < 0.80) return 1.6;
    return 1.8;
}

export default function initVerticalLoaded(root) {
    const container = document.querySelector("#content") || root;
    if (!container) return;

    container.innerHTML = `
        <section class="tool">
            <h2>Loaded Vertical (Base‑Loaded / Center‑Loaded)</h2>

            <h3>Geometry</h3>
            <div class="field-grid">

                <label>Frequency (MHz)
                    <input id="vl-freq" type="number" step="0.01" value="7.1">
                </label>

                <label>Physical radiator length (m)
                    <input id="vl-length" type="number" step="0.1" value="6.0">
                </label>

                <label>Base height (m)
                    <input id="vl-height" type="number" step="0.5" value="2">
                </label>

                <label>Loading coil position
                    <select id="vl-coilpos">
                        <option value="base">Base‑loaded</option>
                        <option value="center">Center‑loaded</option>
                    </select>
                </label>

                <label>Coil inductance (µH)
                    <input id="vl-induct" type="number" step="0.1" value="12">
                </label>

            </div>

            <h3>Boost</h3>
            <div class="field-grid boost-grid">

                <label>Time of day
                    <select id="vl-tod">
                        <option value="day">Day</option>
                        <option value="night">Night</option>
                        <option value="dawn">Dawn</option>
                        <option value="dusk">Dusk</option>
                    </select>
                </label>

                <label><input id="vl-seaside" type="checkbox"> Seaside (+10 dB)</label>
                <label><input id="vl-groundscreen" type="checkbox"> Ground Screen / Faraday Cloth</label>
                <label><input id="vl-elevated" type="checkbox"> Elevated Base / Supports</label>

                <label>Feedline family
                    <select id="vl-feed-family">
                        <option value="coax">Coax</option>
                        <option value="ladder">Ladder line</option>
                    </select>
                </label>

                <label>Feedline type
                    <select id="vl-feed-type">
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
                    <input id="vl-feed-length" type="number" step="5" value="75">
                </label>

            </div>

            <button id="vl-compute" style="margin-top:1rem;">Compute Loaded Vertical</button>

            <div id="vl-summary" class="summary" style="margin-top:1rem;"></div>

        </section>
    `;

    const freqInput = document.getElementById("vl-freq");
    const lengthInput = document.getElementById("vl-length");
    const heightInput = document.getElementById("vl-height");
    const coilPosInput = document.getElementById("vl-coilpos");
    const inductInput = document.getElementById("vl-induct");

    const todInput = document.getElementById("vl-tod");
    const seasideInput = document.getElementById("vl-seaside");
    const groundScreenInput = document.getElementById("vl-groundscreen");
    const elevatedInput = document.getElementById("vl-elevated");

    const feedFamilyInput = document.getElementById("vl-feed-family");
    const feedTypeInput = document.getElementById("vl-feed-type");
    const feedLenInput = document.getElementById("vl-feed-length");

    const summaryDiv = document.getElementById("vl-summary");
    const button = document.getElementById("vl-compute");

    button.addEventListener("click", () => {

        const errors = [];

        const freq = toNumber(freqInput.value);
        const length = toNumber(lengthInput.value);
        const height = toNumber(heightInput.value);
        const coilPos = coilPosInput.value;
        const induct = toNumber(inductInput.value);

        requireFrequency(freq, errors);
        requirePositive(length, "Radiator length", errors);
        requirePositive(height, "Base height", errors);
        requirePositive(induct, "Coil inductance", errors);

        if (errors.length) {
            summaryDiv.innerHTML = warnBox(errors.join("<br>"));
            return;
        }

        const band = findBand(freq);

        // Effective electrical length boost from loading coil
        const effectiveSpan =
            coilPos === "base"
                ? length * 1.25
                : length * 1.35;

        const geom = GeometryEngine.computeGeometry({
            freqMHz: freq,
            heightM: height,
            spanM: effectiveSpan
        });

        const baseGain = baseLoadedVerticalGain(geom.frac);

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
        const finalToa = Math.max(18, Math.min(80, geom.toa + boost.toaShift));

        const geomLines = [
            `Physical radiator length: ${length.toFixed(2)} m`,
            `Base height: ${height.toFixed(2)} m`,
            `Coil position: ${coilPos === "base" ? "Base‑loaded" : "Center‑loaded"}`,
            `Coil inductance: ${induct.toFixed(2)} µH`,
            `Effective electrical span: ${effectiveSpan.toFixed(2)} m`,
            ...(geom.components.length ? geom.components.map(c => c.note ?? "") : [])
        ].join("<br>");

        const boostLines = boost.components.length
            ? boost.components.map(d => {
                const parts = [];
                if (d.boost) parts.push(`${d.boost.toFixed(1)} dB from ${d.label}`);
                else parts.push(d.label);
                if (d.toaShift) parts.push(`TOA shift ${d.toaShift
