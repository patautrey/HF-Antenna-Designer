/* ---------------------------------------------------------
   HF Workbench — Horizontal Loop / Skywire
   (Full-wave horizontal loop, multiband with tuner)
   - Geometry panel
   - Unified boost panel (two-column .boost-grid)
   - Perimeter + height + shape + feedpoint position
   - Feedline family + type + length
   - Transformer Requirements (1:1 choke recommended; tuner required)
--------------------------------------------------------- */

import { requireFrequency, requirePositive, toNumber } from "../validators.js";
import { infoBox, warnBox } from "../dom.js";
import { findBand } from "../constants.js";
import { log } from "../log.js";
import { GeometryEngine } from "../engines/geometry-engine.js";
import { BoostEngine } from "../engines/boost-engine.js";
import { TransformerEngine } from "../engines/transformer-engine.js";

function baseHorizontalLoopGain(frac) {
    // Horizontal loop gain varies by band; treat as loop baseline
    if (frac < 0.40) return 1.6;
    if (frac < 0.60) return 2.1;
    if (frac < 0.80) return 2.5;
    return 2.9;
}

export default function initHorizontalLoop(root) {
    const container = document.querySelector("#content") || root;
    if (!container) return;

    container.innerHTML = `
        <section class="tool">
            <h2>Horizontal Loop / Skywire</h2>

            <h3>Geometry</h3>
            <div class="field-grid">

                <label>Loop perimeter (m)
                    <input id="hl-perim" type="number" step="0.1" value="130">
                </label>

                <label>Operating frequency (MHz)
                    <input id="hl-freq" type="number" step="0.01" value="3.8">
                </label>

                <label>Average height (m)
                    <input id="hl-height" type="number" step="0.1" value="10">
                </label>

                <label>Shape
                    <select id="hl-shape">
                        <option value="square">Square</option>
                        <option value="rectangle">Rectangle</option>
                        <option value="triangle">Triangle</option>
                        <option value="irregular">Irregular</option>
                    </select>
                </label>

                <label>Feedpoint
                    <select id="hl-feedpos">
                        <option value="corner">Corner</option>
                        <option value="mid">Mid‑side</option>
                    </select>
                </label>

            </div>

            <h3>Boost</h3>
            <div class="field-grid boost-grid">

                <label>Time of day
                    <select id="hl-tod">
                        <option value="day">Day</option>
                        <option value="night">Night</option>
                        <option value="dawn">Dawn</option>
                        <option value="dusk">Dusk</option>
                    </select>
                </label>

                <label><input id="hl-seaside" type="checkbox"> Seaside (+10 dB)</label>
                <label><input id="hl-groundscreen" type="checkbox"> Ground Screen / Faraday Cloth</label>
                <label><input id="hl-elevated" type="checkbox"> Elevated Supports</label>

                <label>Feedline family
                    <select id="hl-feed-family">
                        <option value="ladder">Ladder line (recommended)</option>
                        <option value="coax">Coax</option>
                    </select>
                </label>

                <label>Feedline type
                    <select id="hl-feed-type">
                        <option value="450Ω">450Ω window line</option>
                        <option value="300Ω">300Ω twin-lead</option>
                        <option value="600Ω">600Ω open wire</option>
                        <option value="RG-213">RG-213</option>
                        <option value="LMR-400">LMR-400</option>
                        <option value="RG-8X">RG-8X</option>
                        <option value="RG-58">RG-58</option>
                    </select>
                </label>

                <label>Feedline length (ft)
                    <input id="hl-feed-length" type="number" step="5" value="75">
                </label>

            </div>

            <button id="hl-compute" style="margin-top:1rem;">Compute Horizontal Loop</button>

            <div id="hl-summary" class="summary" style="margin-top:1rem;"></div>

        </section>
    `;

    const perimInput = document.getElementById("hl-perim");
    const freqInput = document.getElementById("hl-freq");
    const heightInput = document.getElementById("hl-height");
    const shapeInput = document.getElementById("hl-shape");
    const feedposInput = document.getElementById("hl-feedpos");

    const todInput = document.getElementById("hl-tod");
    const seasideInput = document.getElementById("hl-seaside");
    const groundScreenInput = document.getElementById("hl-groundscreen");
    const elevatedInput = document.getElementById("hl-elevated");

    const feedFamilyInput = document.getElementById("hl-feed-family");
    const feedTypeInput = document.getElementById("hl-feed-type");
    const feedLenInput = document.getElementById("hl-feed-length");

    const summaryDiv = document.getElementById("hl-summary");
    const button = document.getElementById("hl-compute");

    button.addEventListener("click", () => {

        const errors = [];

        const perim = toNumber(perimInput.value);
        const freq = toNumber(freqInput.value);
        const height = toNumber(heightInput.value);
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

        const baseGain = baseHorizontalLoopGain(geom.frac);

        const feedFamily = feedFamilyInput.value === "ladder" ? "ladder" : "coax";

        const boost = BoostEngine.computeBoost({
            reflectorCount: 0,
            directorCount: 0,
            timeOfDay: todInput.value,
            seaside: seasideInput.checked,
            groundScreen: groundScreenInput.checked,
            elevatedRadials: elevatedInput.checked,
            nvisReflector: true, // horizontal loops are NVIS-friendly
            feedlineFamily: feedFamily,
            feedlineType: feedTypeInput.value,
            feedlineLengthFt: toNumber(feedLenInput.value),
            dxTurboPatternBonus: false
        });

        const totalGain = baseGain + geom.totalGeomGainDelta + boost.totalBoost;

        // Horizontal loops have high TOA on low bands, lower on high bands
        let toaBase = 60;
        if (freq > 10) toaBase = 35;
        if (freq > 18) toaBase = 25;

        const finalToa = Math.max(20, Math.min(80, toaBase + (boost.toaShift || 0)));

        const geomLines = [
            `Loop perimeter: ${perim.toFixed(1)} m`,
            `Average height: ${height.toFixed(1)} m`,
            `Shape: ${shape}`,
            `Feedpoint: ${feedpos}`,
            `Horizontal loops are naturally multiband with a tuner.`,
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

        const transformerHtml = TransformerEngine.getTransformerNote("horizontalLoop", feedFamily);

        log("HorizontalLoop", {
            perim,
            freq,
            height,
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

            <p><strong>Base Horizontal Loop Gain:</strong> ${baseGain.toFixed(1)} dBi</p>

            <p><strong>Geometry details:</strong><br>${geomLines}</p>

            <p><strong>Boost breakdown:</strong><br>${boostLines}</p>

            <p><strong>Total estimated gain:</strong> ${totalGain.toFixed(1)} dBi</p>

            <p><strong>Estimated TOA:</strong> ${finalToa.toFixed(0)}°</p>

            ${transformerHtml}
        `);
    });
}
