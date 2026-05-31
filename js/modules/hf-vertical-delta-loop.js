/* ---------------------------------------------------------
   HF Workbench — Vertical Delta Loop
   (Full-wave triangular loop oriented vertically)
   - Geometry panel
   - Unified boost panel (two-column .boost-grid)
   - Perimeter + apex height + base height + feedpoint position
   - Feedline family + type + length
   - Transformer Requirements (4:1 balun typical; 1:1 for some feedpoints)
--------------------------------------------------------- */

import { requireFrequency, requirePositive, toNumber } from "../validators.js";
import { infoBox, warnBox } from "../dom.js";
import { findBand } from "../constants.js";
import { log } from "../log.js";
import { GeometryEngine } from "../engines/geometry-engine.js";
import { BoostEngine } from "../engines/boost-engine.js";
import { TransformerEngine } from "../engines/transformer-engine.js";

function baseVerticalDeltaGain(frac) {
    // Vertical delta loops have strong low-angle DX gain
    if (frac < 0.40) return 2.8;
    if (frac < 0.60) return 3.4;
    if (frac < 0.80) return 3.9;
    return 4.3;
}

export default function initVerticalDeltaLoop(root) {
    const container = document.querySelector("#content") || root;
    if (!container) return;

    container.innerHTML = `
        <section class="tool">
            <h2>Vertical Delta Loop</h2>

            <h3>Geometry</h3>
            <div class="field-grid">

                <label>Loop perimeter (m)
                    <input id="vdl-perim" type="number" step="0.1" value="42">
                </label>

                <label>Operating frequency (MHz)
                    <input id="vdl-freq" type="number" step="0.01" value="7.1">
                </label>

                <label>Apex height (m)
                    <input id="vdl-apex" type="number" step="0.1" value="12">
                </label>

                <label>Base height (m)
                    <input id="vdl-base" type="number" step="0.1" value="2">
                </label>

                <label>Feedpoint
                    <select id="vdl-feedpos">
                        <option value="bottom">Bottom (low-angle DX)</option>
                        <option value="side">Side (balanced pattern)</option>
                        <option value="corner">Corner (slightly higher TOA)</option>
                    </select>
                </label>

            </div>

            <h3>Boost</h3>
            <div class="field-grid boost-grid">

                <label>Time of day
                    <select id="vdl-tod">
                        <option value="day">Day</option>
                        <option value="night">Night</option>
                        <option value="dawn">Dawn</option>
                        <option value="dusk">Dusk</option>
                    </select>
                </label>

                <label><input id="vdl-seaside" type="checkbox"> Seaside (+10 dB)</label>
                <label><input id="vdl-groundscreen" type="checkbox"> Ground Screen / Faraday Cloth</label>
                <label><input id="vdl-elevated" type="checkbox"> Elevated Supports</label>

                <label>Feedline family
                    <select id="vdl-feed-family">
                        <option value="coax">Coax</option>
                        <option value="ladder">Ladder line</option>
                    </select>
                </label>

                <label>Feedline type
                    <select id="vdl-feed-type">
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
                    <input id="vdl-feed-length" type="number" step="5" value="75">
                </label>

            </div>

            <button id="vdl-compute" style="margin-top:1rem;">Compute Vertical Delta Loop</button>

            <div id="vdl-summary" class="summary" style="margin-top:1rem;"></div>

        </section>
    `;

    const perimInput = document.getElementById("vdl-perim");
    const freqInput = document.getElementById("vdl-freq");
    const apexInput = document.getElementById("vdl-apex");
    const baseInput = document.getElementById("vdl-base");
    const feedposInput = document.getElementById("vdl-feedpos");

    const todInput = document.getElementById("vdl-tod");
    const seasideInput = document.getElementById("vdl-seaside");
    const groundScreenInput = document.getElementById("vdl-groundscreen");
    const elevatedInput = document.getElementById("vdl-elevated");

    const feedFamilyInput = document.getElementById("vdl-feed-family");
    const feedTypeInput = document.getElementById("vdl-feed-type");
    const feedLenInput = document.getElementById("vdl-feed-length");

    const summaryDiv = document.getElementById("vdl-summary");
    const button = document.getElementById("vdl-compute");

    button.addEventListener("click", () => {

        const errors = [];

        const perim = toNumber(perimInput.value);
        const freq = toNumber(freqInput.value);
        const apex = toNumber(apexInput.value);
        const base = toNumber(baseInput.value);
        const feedpos = feedposInput.value;

        requirePositive(perim, "Loop perimeter", errors);
        requireFrequency(freq, errors);
        requirePositive(apex, "Apex height", errors);
        requirePositive(base, "Base height", errors);

        if (apex <= base) errors.push("Apex height must be greater than base height.");

        if (errors.length) {
            summaryDiv.innerHTML = warnBox(errors.join("<br>"));
            return;
        }

        const band = findBand(freq);

        const avgHeight = (apex + base) / 2;

        const geom = GeometryEngine.computeGeometry({
            freqMHz: freq,
            heightM: avgHeight,
            spanM: perim
        });

        const baseGain = baseVerticalDeltaGain(geom.frac);

        const feedFamily = feedFamilyInput.value === "ladder" ? "ladder" : "coax";

        const boost = BoostEngine.computeBoost({
            reflectorCount: 0,
            directorCount: 0,
            timeOfDay: todInput.value,
            seaside: seasideInput.checked,
            groundScreen: groundScreenInput.checked,
            elevatedRadials: elevatedInput.checked,
            nvisReflector: feedpos !== "bottom",
            feedlineFamily: feedFamily,
            feedlineType: feedTypeInput.value,
            feedlineLengthFt: toNumber(feedLenInput.value),
            dxTurboPatternBonus: false
        });

        const totalGain = baseGain + geom.totalGeomGainDelta + boost.totalBoost;

        let toaBase = 18;
        if (feedpos === "side") toaBase = 25;
        if (feedpos === "corner") toaBase = 30;

        const finalToa = Math.max(10, Math.min(55, toaBase + (boost.toaShift || 0)));

        const geomLines = [
            `Loop perimeter: ${perim.toFixed(1)} m`,
            `Apex height: ${apex.toFixed(1)} m`,
            `Base height: ${base.toFixed(1)} m`,
            `Feedpoint: ${feedpos}`,
            `Vertical delta loops produce strong low-angle DX radiation.`,
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

        const transformerHtml =
            feedpos === "bottom"
                ? TransformerEngine.getTransformerNote("verticalDeltaLoop4to1", feedFamily)
                : TransformerEngine.getTransformerNote("verticalDeltaLoop1to1", feedFamily);

        log("VerticalDeltaLoop", {
            perim,
            freq,
            apex,
            base,
            feedpos,
            avgHeight,
            geom,
            baseGain,
            boost,
            totalGain,
            finalToa
        });

        summaryDiv.innerHTML = infoBox(`
            <p><strong>Operating frequency:</strong> ${freq.toFixed(2)} MHz (${band?.label ?? "Unknown band"})</p>

            <p><strong>Base Vertical Delta Loop Gain:</strong> ${baseGain.toFixed(1)} dBi</p>

            <p><strong>Geometry details:</strong><br>${geomLines}</p>

            <p><strong>Boost breakdown:</strong><br>${boostLines}</p>

            <p><strong>Total estimated gain:</strong> ${totalGain.toFixed(1)} dBi</p>

            <p><strong>Estimated TOA:</strong> ${finalToa.toFixed(0)}°</p>

            ${transformerHtml}
        `);
    });
}
