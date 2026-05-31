/* ---------------------------------------------------------
   HF Workbench — Quad‑Yagi Hybrid
   (Driven quad loop + Yagi‑style reflector/director rods)
   - Geometry panel
   - Unified boost panel (two-column .boost-grid)
   - Driven loop + reflector rod + director rod + spacing
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

function baseQuadYagiGain(frac) {
    // Hybrid gain sits between 2‑el quad and 3‑el Yagi
    if (frac < 0.40) return 6.0;
    if (frac < 0.60) return 6.8;
    if (frac < 0.80) return 7.4;
    return 7.8;
}

export default function initQuadYagiHybrid(root) {
    const container = document.querySelector("#content") || root;
    if (!container) return;

    container.innerHTML = `
        <section class="tool">
            <h2>Quad‑Yagi Hybrid</h2>

            <h3>Geometry</h3>
            <div class="field-grid">

                <label>Operating frequency (MHz)
                    <input id="qy-freq" type="number" step="0.01" value="14.2">
                </label>

                <label>Driven quad loop perimeter (m)
                    <input id="qy-driven" type="number" step="0.1" value="21">
                </label>

                <label>Reflector rod length (m)
                    <input id="qy-refl" type="number" step="0.1" value="11.2">
                </label>

                <label>Director rod length (m)
                    <input id="qy-dir" type="number" step="0.1" value="10.4">
                </label>

                <label>Spacing (driven ↔ reflector, m)
                    <input id="qy-sr" type="number" step="0.1" value="2.5">
                </label>

                <label>Spacing (driven ↔ director, m)
                    <input id="qy-sd" type="number" step="0.1" value="2.5">
                </label>

                <label>Height above ground (m)
                    <input id="qy-height" type="number" step="0.1" value="10">
                </label>

                <label>Feedpoint
                    <select id="qy-feedpos">
                        <option value="bottom">Bottom (horizontal pol.)</option>
                        <option value="side">Side (vertical pol.)</option>
                    </select>
                </label>

                <label>Loop orientation
                    <select id="qy-orient">
                        <option value="square">Square</option>
                        <option value="diamond">Diamond (45° rotated)</option>
                    </select>
                </label>

            </div>

            <h3>Boost</h3>
            <div class="field-grid boost-grid">

                <label>Time of day
                    <select id="qy-tod">
                        <option value="day">Day</option>
                        <option value="night">Night</option>
                        <option value="dawn">Dawn</option>
                        <option value="dusk">Dusk</option>
                    </select>
                </label>

                <label><input id="qy-seaside" type="checkbox"> Seaside (+10 dB)</label>
                <label><input id="qy-groundscreen" type="checkbox"> Ground Screen / Faraday Cloth</label>
                <label><input id="qy-elevated" type="checkbox"> Elevated Supports</label>

                <label>Feedline family
                    <select id="qy-feed-family">
                        <option value="coax">Coax</option>
                        <option value="ladder">Ladder line</option>
                    </select>
                </label>

                <label>Feedline type
                    <select id="qy-feed-type">
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
                    <input id="qy-feed-length" type="number" step="5" value="75">
                </label>

            </div>

            <button id="qy-compute" style="margin-top:1rem;">Compute Quad‑Yagi Hybrid</button>

            <div id="qy-summary" class="summary" style="margin-top:1rem;"></div>

        </section>
    `;

    const freqInput = document.getElementById("qy-freq");
    const drivenInput = document.getElementById("qy-driven");
    const reflInput = document.getElementById("qy-refl");
    const dirInput = document.getElementById("qy-dir");
    const srInput = document.getElementById("qy-sr");
    const sdInput = document.getElementById("qy-sd");
    const heightInput = document.getElementById("qy-height");
    const feedposInput = document.getElementById("qy-feedpos");
    const orientInput = document.getElementById("qy-orient");

    const todInput = document.getElementById("qy-tod");
    const seasideInput = document.getElementById("qy-seaside");
    const groundScreenInput = document.getElementById("qy-groundscreen");
    const elevatedInput = document.getElementById("qy-elevated");

    const feedFamilyInput = document.getElementById("qy-feed-family");
    const feedTypeInput = document.getElementById("qy-feed-type");
    const feedLenInput = document.getElementById("qy-feed-length");

    const summaryDiv = document.getElementById("qy-summary");
    const button = document.getElementById("qy-compute");

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
        requirePositive(refl, "Reflector rod length", errors);
        requirePositive(dir, "Director rod length", errors);
        requirePositive(sr, "Driven ↔ Reflector spacing", errors);
        requirePositive(sd, "Driven ↔ Director spacing", errors);
        requirePositive(height, "Height", errors);

        if (refl <= driven / 4) errors.push("Reflector rod must be electrically longer than driven loop side.");
        if (dir >= driven / 4) errors.push("Director rod must be electrically shorter than driven loop side.");

        if (errors.length) {
            summaryDiv.innerHTML = warnBox(errors.join("<br>"));
            return;
        }

        const band = findBand(freq);

        const avgSpan = driven;

        const geom = GeometryEngine.computeGeometry({
            freqMHz: freq,
            heightM: height,
            spanM: avgSpan
        });

        const baseGain = baseQuadYagiGain(geom.frac);

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
                ? Math.max(8, Math.min(30, geom.toa + boost.toaShift))
                : Math.max(40, Math.min(70, geom.toa + boost.toaShift));

        const geomLines = [
            `Driven quad loop: ${driven.toFixed(1)} m perimeter`,
            `Reflector rod: ${refl.toFixed(1)} m`,
            `Director rod: ${dir.toFixed(1)} m`,
            `Spacing (driven ↔ reflector): ${sr.toFixed(1)} m`,
            `Spacing (driven ↔ director): ${sd.toFixed(1)} m`,
            `Height: ${height.toFixed(1)} m`,
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

        const transformerHtml = TransformerEngine.getTransformerNote("quadYagiHybrid", feedFamily);

        log("QuadYagiHybrid", {
            freq,
            driven,
            refl,
            dir,
            sr,
            sd,
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

            <p><strong>Base Quad‑Yagi Hybrid Gain:</strong> ${baseGain.toFixed(1)} dBi</p>

            <p><strong>Geometry details:</strong><br>${geomLines}</p>

            <p><strong>Boost breakdown:</strong><br>${boostLines}</p>

            <p><strong>Total estimated gain:</strong> ${totalGain.toFixed(1)} dBi</p>

            <p><strong>Estimated TOA:</strong> ${finalToa.toFixed(0)}°</p>

            ${transformerHtml}
        `);
    });
}
