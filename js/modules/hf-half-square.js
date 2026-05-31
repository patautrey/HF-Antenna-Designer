/* ---------------------------------------------------------
   HF Workbench — Half‑Square Antenna
   (Two verticals joined by a horizontal top wire)
   - Geometry panel
   - Unified boost panel (two-column .boost-grid)
   - Vertical leg length + top span + height
   - Feedline family + type + length
   - Transformer Requirements (matching network / 1:1 choke)
--------------------------------------------------------- */

import { requireFrequency, requirePositive, toNumber } from "../validators.js";
import { infoBox, warnBox } from "../dom.js";
import { findBand } from "../constants.js";
import { log } from "../log.js";
import { GeometryEngine } from "../engines/geometry-engine.js";
import { BoostEngine } from "../engines/boost-engine.js";
import { TransformerEngine } from "../engines/transformer-engine.js";

function baseHalfSquareGain(frac) {
    // Broadside low-angle DX pattern; modest dependence on electrical height
    if (frac < 0.40) return 2.5;
    if (frac < 0.60) return 3.0;
    if (frac < 0.80) return 3.4;
    return 3.7;
}

export default function initHalfSquare(root) {
    const container = document.querySelector("#content") || root;
    if (!container) return;

    container.innerHTML = `
        <section class="tool">
            <h2>Half‑Square Antenna</h2>

            <h3>Geometry</h3>
            <div class="field-grid">

                <label>Operating frequency (MHz)
                    <input id="hs-freq" type="number" step="0.01" value="7.1">
                </label>

                <label>Vertical leg length (m)
                    <input id="hs-vert" type="number" step="0.1" value="10">
                </label>

                <label>Top horizontal span (m)
                    <input id="hs-top" type="number" step="0.1" value="20">
                </label>

                <label>Feedpoint height above ground (m)
                    <input id="hs-height" type="number" step="0.5" value="2">
                </label>

            </div>

            <h3>Boost</h3>
            <div class="field-grid boost-grid">

                <label>Time of day
                    <select id="hs-tod">
                        <option value="day">Day</option>
                        <option value="night">Night</option>
                        <option value="dawn">Dawn</option>
                        <option value="dusk">Dusk</option>
                    </select>
                </label>

                <label><input id="hs-seaside" type="checkbox"> Seaside (+10 dB)</label>
                <label><input id="hs-groundscreen" type="checkbox"> Ground Screen / Faraday Cloth</label>
                <label><input id="hs-elevated" type="checkbox"> Elevated Supports</label>

                <label>Feedline family
                    <select id="hs-feed-family">
                        <option value="coax">Coax</option>
                        <option value="ladder">Ladder line</option>
                    </select>
                </label>

                <label>Feedline type
                    <select id="hs-feed-type">
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
                    <input id="hs-feed-length" type="number" step="5" value="75">
                </label>

            </div>

            <button id="hs-compute" style="margin-top:1rem;">Compute Half‑Square</button>

            <div id="hs-summary" class="summary" style="margin-top:1rem;"></div>

        </section>
    `;

    const freqInput = document.getElementById("hs-freq");
    const vertInput = document.getElementById("hs-vert");
    const topInput = document.getElementById("hs-top");
    const heightInput = document.getElementById("hs-height");

    const todInput = document.getElementById("hs-tod");
    const seasideInput = document.getElementById("hs-seaside");
    const groundScreenInput = document.getElementById("hs-groundscreen");
    const elevatedInput = document.getElementById("hs-elevated");

    const feedFamilyInput = document.getElementById("hs-feed-family");
    const feedTypeInput = document.getElementById("hs-feed-type");
    const feedLenInput = document.getElementById("hs-feed-length");

    const summaryDiv = document.getElementById("hs-summary");
    const button = document.getElementById("hs-compute");

    button.addEventListener("click", () => {

        const errors = [];

        const freq = toNumber(freqInput.value);
        const vert = toNumber(vertInput.value);
        const top = toNumber(topInput.value);
        const height = toNumber(heightInput.value);

        requireFrequency(freq, errors);
        requirePositive(vert, "Vertical leg length", errors);
        requirePositive(top, "Top horizontal span", errors);
        requirePositive(height, "Feedpoint height", errors);

        if (errors.length) {
            summaryDiv.innerHTML = warnBox(errors.join("<br>"));
            return;
        }

        const band = findBand(freq);

        // Effective span approximated as total wire length
        const totalWire = (2 * vert) + top;

        const geom = GeometryEngine.computeGeometry({
            freqMHz: freq,
            heightM: height + vert / 2, // average current height
            spanM: totalWire
        });

        const baseGain = baseHalfSquareGain(geom.frac);

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
        const finalToa = Math.max(10, Math.min(35, geom.toa + boost.toaShift));

        const geomLines = [
            `Vertical legs: ${vert.toFixed(2)} m each`,
            `Top span: ${top.toFixed(2)} m`,
            `Approx. total wire length: ${totalWire.toFixed(2)} m`,
            `Feedpoint height: ${height.toFixed(2)} m`,
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

        const transformerHtml = TransformerEngine.getTransformerNote("halfSquare", feedFamily);

        log("HalfSquare", {
            freq,
            vert,
            top,
            height,
            totalWire,
            geom,
            baseGain,
            boost,
            totalGain,
            finalToa
        });

        summaryDiv.innerHTML = infoBox(`
            <p><strong>Operating frequency:</strong> ${freq.toFixed(2)} MHz (${band?.label ?? "Unknown band"})</p>

            <p><strong>Base Half‑Square Gain:</strong> ${baseGain.toFixed(1)} dBi (broadside)</p>

            <p><strong>Geometry details:</strong><br>${geomLines}</p>

            <p><strong>Boost breakdown:</strong><br>${boostLines}</p>

            <p><strong>Total estimated gain:</strong> ${totalGain.toFixed(1)} dBi</p>

            <p><strong>Estimated TOA:</strong> ${finalToa.toFixed(0)}°</p>

            ${transformerHtml}
        `);
    });
}
