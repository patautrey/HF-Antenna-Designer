/* ---------------------------------------------------------
   HF Workbench — Cubical Quad (Full‑Wave Square Loop)
   - Geometry panel
   - Unified boost panel (two-column .boost-grid)
   - Loop perimeter + height + feedpoint position
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

function baseCubicalQuadGain(frac) {
    // Cubical quad = slightly higher gain than delta loop
    if (frac < 0.40) return 2.2;
    if (frac < 0.60) return 2.7;
    if (frac < 0.80) return 3.1;
    return 3.4;
}

export default function initCubicalQuad(root) {
    const container = document.querySelector("#content") || root;
    if (!container) return;

    container.innerHTML = `
        <section class="tool">
            <h2>Cubical Quad (Full‑Wave Square Loop)</h2>

            <h3>Geometry</h3>
            <div class="field-grid">

                <label>Operating frequency (MHz)
                    <input id="cq-freq" type="number" step="0.01" value="14.2">
                </label>

                <label>Loop perimeter (m)
                    <input id="cq-perim" type="number" step="0.1" value="21">
                </label>

                <label>Loop height above ground (m)
                    <input id="cq-height" type="number" step="0.1" value="10">
                </label>

                <label>Feedpoint
                    <select id="cq-feedpos">
                        <option value="bottom">Bottom (horizontal pol.)</option>
                        <option value="side">Side (vertical pol.)</option>
                        <option value="top">Top (horizontal pol.)</option>
                    </select>
                </label>

                <label>Orientation
                    <select id="cq-orient">
                        <option value="square">Square</option>
                        <option value="diamond">Diamond (45° rotated)</option>
                    </select>
                </label>

            </div>

            <h3>Boost</h3>
            <div class="field-grid boost-grid">

                <label>Time of day
                    <select id="cq-tod">
                        <option value="day">Day</option>
                        <option value="night">Night</option>
                        <option value="dawn">Dawn</option>
                        <option value="dusk">Dusk</option>
                    </select>
                </label>

                <label><input id="cq-seaside" type="checkbox"> Seaside (+10 dB)</label>
                <label><input id="cq-groundscreen" type="checkbox"> Ground Screen / Faraday Cloth</label>
                <label><input id="cq-elevated" type="checkbox"> Elevated Supports</label>

                <label>Feedline family
                    <select id="cq-feed-family">
                        <option value="coax">Coax</option>
                        <option value="ladder">Ladder line</option>
                    </select>
                </label>

                <label>Feedline type
                    <select id="cq-feed-type">
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
                    <input id="cq-feed-length" type="number" step="5" value="75">
                </label>

            </div>

            <button id="cq-compute" style="margin-top:1rem;">Compute Cubical Quad</button>

            <div id="cq-summary" class="summary" style="margin-top:1rem;"></div>

        </section>
    `;

    const freqInput = document.getElementById("cq-freq");
    const perimInput = document.getElementById("cq-perim");
    const heightInput = document.getElementById("cq-height");
    const feedposInput = document.getElementById("cq-feedpos");
    const orientInput = document.getElementById("cq-orient");

    const todInput = document.getElementById("cq-tod");
    const seasideInput = document.getElementById("cq-seaside");
    const groundScreenInput = document.getElementById("cq-groundscreen");
    const elevatedInput = document.getElementById("cq-elevated");

    const feedFamilyInput = document.getElementById("cq-feed-family");
    const feedTypeInput = document.getElementById("cq-feed-type");
    const feedLenInput = document.getElementById("cq-feed-length");

    const summaryDiv = document.getElementById("cq-summary");
    const button = document.getElementById("cq-compute");

    button.addEventListener("click", () => {

        const errors = [];

        const freq = toNumber(freqInput.value);
        const perim = toNumber(perimInput.value);
        const height = toNumber(heightInput.value);
        const feedpos = feedposInput.value;
        const orient = orientInput.value;

        requireFrequency(freq, errors);
        requirePositive(perim, "Loop perimeter", errors);
        requirePositive(height, "Loop height", errors);

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

        const baseGain = baseCubicalQuadGain(geom.frac);

        const feedFamily = feedFamilyInput.value === "ladder" ? "ladder" : "coax";

        const boost = BoostEngine.computeBoost({
            reflectorCount: 0,
            directorCount: 0,
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
                ? Math.max(12, Math.min(38, geom.toa + boost.toaShift))
                : feedpos === "side"
                ? Math.max(45, Math.min(75, geom.toa + boost.toaShift))
                : Math.max(20, Math.min(55, geom.toa + boost.toaShift));

        const geomLines = [
            `Loop perimeter: ${perim.toFixed(1)} m`,
            `Loop height: ${height.toFixed(1)} m`,
            `Feedpoint: ${feedpos}`,
            `Orientation: ${orient}`,
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

        const transformerHtml = TransformerEngine.getTransformerNote("cubicalQuad", feedFamily);

        log("CubicalQuad", {
            freq,
            perim,
            height,
            feedpos,
            orient,
            geom,
            baseGain,
            boost,
            totalGain,
            finalToa
        });

        summaryDiv.innerHTML = infoBox(`
            <p><strong>Operating frequency:</strong> ${freq.toFixed(2)} MHz (${band?.label ?? "Unknown band"})</p>

            <p><strong>Base Cubical Quad Gain:</strong> ${baseGain.toFixed(1)} dBi</p>

            <p><strong>Geometry details:</strong><br>${geomLines}</p>

            <p><strong>Boost breakdown:</strong><br>${boostLines}</p>

            <p><strong>Total estimated gain:</strong> ${totalGain.toFixed(1)} dBi</p>

            <p><strong>Estimated TOA:</strong> ${finalToa.toFixed(0)}°</p>

            ${transformerHtml}
        `);
    });
}
