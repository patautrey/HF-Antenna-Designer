/* ---------------------------------------------------------
   HF Workbench — Generic Full‑Wave Loop
   (Single-band full-wave loop in any orientation)
   - Geometry panel
   - Unified boost panel (two-column .boost-grid)
   - Perimeter + height + orientation + shape
   - Feedline family + type + length
   - Transformer Requirements (4:1 balun typical; 1:1 for some configs)
--------------------------------------------------------- */

import { requireFrequency, requirePositive, toNumber } from "../validators.js";
import { infoBox, warnBox } from "../dom.js";
import { findBand } from "../constants.js";
import { log } from "../log.js";
import { GeometryEngine } from "../engines/geometry-engine.js";
import { BoostEngine } from "../engines/boost-engine.js";
import { TransformerEngine } from "../engines/transformer-engine.js";

function baseFullWaveLoopGain(frac) {
    // Full-wave loops have slightly higher gain than dipoles
    if (frac < 0.40) return 2.2;
    if (frac < 0.60) return 2.7;
    if (frac < 0.80) return 3.1;
    return 3.4;
}

export default function initFullWaveLoop(root) {
    const container = document.querySelector("#content") || root;
    if (!container) return;

    container.innerHTML = `
        <section class="tool">
            <h2>Full‑Wave Loop (Generic)</h2>

            <h3>Geometry</h3>
            <div class="field-grid">

                <label>Loop perimeter (m)
                    <input id="fw-perim" type="number" step="0.1" value="42">
                </label>

                <label>Operating frequency (MHz)
                    <input id="fw-freq" type="number" step="0.01" value="7.1">
                </label>

                <label>Average height (m)
                    <input id="fw-height" type="number" step="0.1" value="10">
                </label>

                <label>Orientation
                    <select id="fw-orient">
                        <option value="horizontal">Horizontal</option>
                        <option value="vertical">Vertical</option>
                        <option value="tilted">Tilted</option>
                        <option value="sloped">Sloped</option>
                    </select>
                </label>

                <label>Shape
                    <select id="fw-shape">
                        <option value="square">Square</option>
                        <option value="rectangle">Rectangle</option>
                        <option value="triangle">Triangle</option>
                        <option value="irregular">Irregular</option>
                    </select>
                </label>

                <label>Feedpoint
                    <select id="fw-feedpos">
                        <option value="bottom">Bottom</option>
                        <option value="side">Side</option>
                        <option value="top">Top</option>
                        <option value="corner">Corner</option>
                    </select>
                </label>

            </div>

            <h3>Boost</h3>
            <div class="field-grid boost-grid">

                <label>Time of day
                    <select id="fw-tod">
                        <option value="day">Day</option>
                        <option value="night">Night</option>
                        <option value="dawn">Dawn</option>
                        <option value="dusk">Dusk</option>
                    </select>
                </label>

                <label><input id="fw-seaside" type="checkbox"> Seaside (+10 dB)</label>
                <label><input id="fw-groundscreen" type="checkbox"> Ground Screen / Faraday Cloth</label>
                <label><input id="fw-elevated" type="checkbox"> Elevated Supports</label>

                <label>Feedline family
                    <select id="fw-feed-family">
                        <option value="coax">Coax</option>
                        <option value="ladder">Ladder line</option>
                    </select>
                </label>

                <label>Feedline type
                    <select id="fw-feed-type">
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
                    <input id="fw-feed-length" type="number" step="5" value="75">
                </label>

            </div>

            <button id="fw-compute" style="margin-top:1rem;">Compute Full‑Wave Loop</button>

            <div id="fw-summary" class="summary" style="margin-top:1rem;"></div>

        </section>
    `;

    const perimInput = document.getElementById("fw-perim");
    const freqInput = document.getElementById("fw-freq");
    const heightInput = document.getElementById("fw-height");
    const orientInput = document.getElementById("fw-orient");
    const shapeInput = document.getElementById("fw-shape");
    const feedposInput = document.getElementById("fw-feedpos");

    const todInput = document.getElementById("fw-tod");
    const seasideInput = document.getElementById("fw-seaside");
    const groundScreenInput = document.getElementById("fw-groundscreen");
    const elevatedInput = document.getElementById("fw-elevated");

    const feedFamilyInput = document.getElementById("fw-feed-family");
    const feedTypeInput = document.getElementById("fw-feed-type");
    const feedLenInput = document.getElementById("fw-feed-length");

    const summaryDiv = document.getElementById("fw-summary");
    const button = document.getElementById("fw-compute");

    button.addEventListener("click", () => {

        const errors = [];

        const perim = toNumber(perimInput.value);
        const freq = toNumber(freqInput.value);
        const height = toNumber(heightInput.value);
        const orient = orientInput.value;
        const shape = shapeInput.value;
        const feedpos = feedposInput.value;

        requirePositive(perim, "Loop perimeter", errors);
        requireFrequency(freq, errors);
        requirePositive(height, "Average height", errors);

        if (errors.length) {
            summaryDiv.innerHTML = warnBox(errors.join("<br>"));
            return;
        }

        const band = findBand(freq);

        const geom = GeometryEngine.computeGeometry({
            freqMHz: freq,
            heightM: height,
            spanM: perim
        });

        const baseGain = baseFullWaveLoopGain(geom.frac);

        const feedFamily = feedFamilyInput.value === "ladder" ? "ladder" : "coax";

        const boost = BoostEngine.computeBoost({
            reflectorCount: 0,
            directorCount: 0,
            timeOfDay: todInput.value,
            seaside: seasideInput.checked,
            groundScreen: groundScreenInput.checked,
            elevatedRadials: elevatedInput.checked,
            nvisReflector: orient === "horizontal",
            feedlineFamily: feedFamily,
            feedlineType: feedTypeInput.value,
            feedlineLengthFt: toNumber(feedLenInput.value),
            dxTurboPatternBonus: false
        });

        const totalGain = baseGain + geom.totalGeomGainDelta + boost.totalBoost;

        let toaBase = 45;
        if (orient === "vertical") toaBase = 25;
        if (orient === "tilted") toaBase = 35;
        if (orient === "sloped") toaBase = 30;

        const finalToa = Math.max(15, Math.min(80, toaBase + (boost.toaShift || 0)));

        const geomLines = [
            `Loop perimeter: ${perim.toFixed(1)} m`,
            `Average height: ${height.toFixed(1)} m`,
            `Orientation: ${orient}`,
            `Shape: ${shape}`,
            `Feedpoint: ${feedpos}`,
            `Full‑wave loops are efficient and quiet on receive.`,
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

        const transformerHtml = TransformerEngine.getTransformerNote("fullWaveLoop", feedFamily);

        log("FullWaveLoop", {
            perim,
            freq,
            height,
            orient,
            shape,
            feedpos,
            geom,
            baseGain,
            boost,
            totalGain,
            finalToa
        });

        summaryDiv.innerHTML = infoBox(`
            <p><strong>Operating frequency:</strong> ${freq.toFixed(2)} MHz (${band?.label ?? "Unknown band"})</p>

            <p><strong>Base Full‑Wave Loop Gain:</strong> ${baseGain.toFixed(1)} dBi</p>

            <p><strong>Geometry details:</strong><br>${geomLines}</p>

            <p><strong>Boost breakdown:</strong><br>${boostLines}</p>

            <p><strong>Total estimated gain:</strong> ${totalGain.toFixed(1)} dBi</p>

            <p><strong>Estimated TOA:</strong> ${finalToa.toFixed(0)}°</p>

            ${transformerHtml}
        `);
    });
}
