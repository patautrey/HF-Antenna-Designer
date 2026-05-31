/* ---------------------------------------------------------
   HF Workbench — 3‑Element Cubical Quad (Driven + Reflector + Director)
   - Geometry panel
   - Unified boost panel (two-column .boost-grid)
   - Driven loop + reflector loop + director loop + spacing
   - Feedline family + type + length
   - Transformer Requirements (4:1 balun recommended)
--------------------------------------------------------- */

import { requireFrequency, requirePositive, toNumber } from "../validators.js";
import { infoBox, warnBox } from "../dom.js";
import { findBand } from "../constants.js";
import { log } from "../log.js";
import { GeometryEngine } from "../engines/geometry-engine.js";
import { BoostEngine } from "../engines/boost-engine.js";
import { TransformerEngine } from "../engines/transformer-engine.js";

function baseQuad3elGain(frac) {
    // Typical 3‑element quad gain profile
    if (frac < 0.40) return 7.0;
    if (frac < 0.60) return 7.8;
    if (frac < 0.80) return 8.4;
    return 8.8;
}

export default function initCubicalQuad3el(root) {
    const container = document.querySelector("#content") || root;
    if (!container) return;

    container.innerHTML = `
        <section class="tool">
            <h2>3‑Element Cubical Quad (Driven + Reflector + Director)</h2>

            <h3>Geometry</h3>
            <div class="field-grid">

                <label>Operating frequency (MHz)
                    <input id="cq3-freq" type="number" step="0.01" value="14.2">
                </label>

                <label>Driven loop perimeter (m)
                    <input id="cq3-driven" type="number" step="0.1" value="21">
                </label>

                <label>Reflector loop perimeter (m)
                    <input id="cq3-refl" type="number" step="0.1" value="22">
                </label>

                <label>Director loop perimeter (m)
                    <input id="cq3-dir" type="number" step="0.1" value="20">
                </label>

                <label>Spacing (driven ↔ reflector, m)
                    <input id="cq3-sr" type="number" step="0.1" value="2.5">
                </label>

                <label>Spacing (driven ↔ director, m)
                    <input id="cq3-sd" type="number" step="0.1" value="2.5">
                </label>

                <label>Loop height above ground (m)
                    <input id="cq3-height" type="number" step="0.1" value="10">
                </label>

                <label>Feedpoint
                    <select id="cq3-feedpos">
                        <option value="bottom">Bottom (horizontal pol.)</option>
                        <option value="side">Side (vertical pol.)</option>
                    </select>
                </label>

                <label>Orientation
                    <select id="cq3-orient">
                        <option value="square">Square</option>
                        <option value="diamond">Diamond (45° rotated)</option>
                    </select>
                </label>

            </div>

            <h3>Boost</h3>
            <div class="field-grid boost-grid">

                <label>Time of day
                    <select id="cq3-tod">
                        <option value="day">Day</option>
                        <option value="night">Night</option>
                        <option value="dawn">Dawn</option>
                        <option value="dusk">Dusk</option>
                    </select>
                </label>

                <label><input id="cq3-seaside" type="checkbox"> Seaside (+10 dB)</label>
                <label><input id="cq3-groundscreen" type="checkbox"> Ground Screen / Faraday Cloth</label>
                <label><input id="cq3-elevated" type="checkbox"> Elevated Supports</label>

                <label>Feedline family
                    <select id="cq3-feed-family">
                        <option value="coax">Coax</option>
                        <option value="ladder">Ladder line</option>
                    </select>
                </label>

                <label>Feedline type
                    <select id="cq3-feed-type">
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
                    <input id="cq3-feed-length" type="number" step="5" value="75">
                </label>

            </div>

            <button id="cq3-compute" style="margin-top:1rem;">Compute 3‑Element Quad</button>

            <div id="cq3-summary" class="summary" style="margin-top:1rem;"></div>

        </section>
    `;

    const freqInput = document.getElementById("cq3-freq");
    const drivenInput = document.getElementById("cq3-driven");
    const reflInput = document.getElementById("cq3-refl");
    const dirInput = document.getElementById("cq3-dir");
    const srInput = document.getElementById("cq3-sr");
    const sdInput = document.getElementById("cq3-sd");
    const heightInput = document.getElementById("cq3-height");
    const feedposInput = document.getElementById("cq3-feedpos");
    const orientInput = document.getElementById("cq3-orient");

    const todInput = document.getElementById("cq3-tod");
    const seasideInput = document.getElementById("cq3-seaside");
    const groundScreenInput = document.getElementById("cq3-groundscreen");
    const elevatedInput = document.getElementById("cq3-elevated");

    const feedFamilyInput = document.getElementById("cq3-feed-family");
    const feedTypeInput = document.getElementById("cq3-feed-type");
    const feedLenInput = document.getElementById("cq3-feed-length");

    const summaryDiv = document.getElementById("cq3-summary");
    const button = document.getElementById("cq3-compute");

    button.addEventListener("click", () => {

        const errors = [];

        const freq = toNumber(freqInput.value);
        const driven = toNumber(drivenInput.value);
        const refl = toNumber(reflInput.value);
        const dir = toNumber(dirInput.value);
        const sr = toNumber(srInput.value);
        const sd = toNumber(sdInput.value);
        const height = toNumber(heightInput.value);
        const feedpos = feedposInput.value;
        const orient = orientInput.value;

        requireFrequency(freq, errors);
        requirePositive(driven, "Driven loop perimeter", errors);
        requirePositive(refl, "Reflector loop perimeter", errors);
        requirePositive(dir, "Director loop perimeter", errors);
        requirePositive(sr, "Driven ↔ Reflector spacing", errors);
        requirePositive(sd, "Driven ↔ Director spacing", errors);
        requirePositive(height, "Loop height", errors);

        if (refl <= driven) errors.push("Reflector must be larger than driven loop.");
        if (dir >= driven) errors.push("Director must be smaller than driven loop.");

        if (errors.length) {
            summaryDiv.innerHTML = warnBox(errors.join("<br>"));
            return;
        }

        const band = findBand(freq);

        const avgSpan = (driven + refl + dir) / 3;

        const geom = GeometryEngine.computeGeometry({
            freqMHz: freq,
            heightM: height,
            spanM: avgSpan
        });

        const baseGain = baseQuad3elGain(geom.frac);

        const feedFamily = feedFamilyInput.value === "ladder" ? "ladder" : "coax";

        const boost = BoostEngine.computeBoost({
            reflectorCount: 1,
            directorCount: 1,
            timeOfDay: todInput.value,
            seaside: seasideInput.checked,
            groundScreen: groundScreenInput.checked,
            elevatedRadials: elevatedInput.checked,
            nvisReflector: feedpos === "side",
            feedlineFamily: feedFamily,
            feedlineType: feedTypeInput.value,
            feedlineLengthFt: toNumber(feedLenInput.value),
            dxTurboPatternBonus: false
        });

        const totalGain = baseGain + geom.totalGeomGainDelta + boost.totalBoost;

        const finalToa =
            feedpos === "bottom"
                ? Math.max(8, Math.min(28, geom.toa + boost.toaShift))
                : Math.max(40, Math.min(70, geom.toa + boost.toaShift));

        const geomLines = [
            `Driven loop: ${driven.toFixed(1)} m`,
            `Reflector loop: ${refl.toFixed(1)} m`,
            `Director loop: ${dir.toFixed(1)} m`,
            `Spacing (driven ↔ reflector): ${sr.toFixed(1)} m`,
            `Spacing (driven ↔ director): ${sd.toFixed(1)} m`,
            `Loop height: ${height.toFixed(1)} m`,
            `Feedpoint: ${feedpos}`,
            `Orientation: ${orient}`,
            ...(geom.components.length ? geom.components.map(c => c.note
