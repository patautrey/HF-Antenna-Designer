/* ---------------------------------------------------------
   HF Workbench — Delta Loop (Full‑Wave Loop, Triangular)
   - Geometry panel
   - Unified boost panel (two-column .boost-grid)
   - Loop perimeter + orientation + feedpoint position
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

function baseDeltaLoopGain(frac) {
    // Delta loop = excellent low-angle DX radiator when fed at bottom corner
    if (frac < 0.40) return 1.8;
    if (frac < 0.60) return 2.3;
    if (frac < 0.80) return 2.7;
    return 3.0;
}

export default function initDeltaLoop(root) {
    const container = document.querySelector("#content") || root;
    if (!container) return;

    container.innerHTML = `
        <section class="tool">
            <h2>Delta Loop (Full‑Wave Triangular Loop)</h2>

            <h3>Geometry</h3>
            <div class="field-grid">

                <label>Operating frequency (MHz)
                    <input id="dl-freq" type="number" step="0.01" value="14.2">
                </label>

                <label>Loop perimeter (m)
                    <input id="dl-perim" type="number" step="0.1" value="21">
                </label>

                <label>Apex height (m)
                    <input id="dl-apex" type="number" step="0.1" value="12">
                </label>

                <label>Base height (m)
                    <input id="dl-base" type="number" step="0.1" value="2">
                </label>

                <label>Feedpoint
                    <select id="dl-feedpos">
                        <option value="bottom">Bottom corner (low-angle DX)</option>
                        <option value="side">Side (higher-angle NVIS)</option>
                        <option value="top">Top (vertical polarization)</option>
                    </select>
                </label>

                <label>Orientation
                    <select id="dl-orient">
                        <option value="point-up">Point up</option>
                        <option value="point-down">Point down</option>
                        <option value="sideways">Sideways</option>
                    </select>
                </label>

            </div>

            <h3>Boost</h3>
            <div class="field-grid boost-grid">

                <label>Time of day
                    <select id="dl-tod">
                        <option value="day">Day</option>
                        <option value="night">Night</option>
                        <option value="dawn">Dawn</option>
                        <option value="dusk">Dusk</option>
                    </select>
                </label>

                <label><input id="dl-seaside" type="checkbox"> Seaside (+10 dB)</label>
                <label><input id="dl-groundscreen" type="checkbox"> Ground Screen / Faraday Cloth</label>
                <label><input id="dl-elevated" type="checkbox"> Elevated Supports</label>

                <label>Feedline family
                    <select id="dl-feed-family">
                        <option value="coax">Coax</option>
                        <option value="ladder">Ladder line</option>
                    </select>
                </label>

                <label>Feedline type
                    <select id="dl-feed-type">
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
                    <input id="dl-feed-length" type="number" step="5" value="75">
                </label>

            </div>

            <button id="dl-compute" style="margin-top:1rem;">Compute Delta Loop</button>

            <div id="dl-summary" class="summary" style="margin-top:1rem;"></div>

        </section>
    `;

    const freqInput = document.getElementById("dl-freq");
    const perimInput = document.getElementById("dl-perim");
    const apexInput = document.getElementById("dl-apex");
    const baseInput = document.getElementById("dl-base");
    const feedposInput = document.getElementById("dl-feedpos");
    const orientInput = document.getElementById("dl-orient");

    const todInput = document.getElementById("dl-tod");
    const seasideInput = document.getElementById("dl-seaside");
    const groundScreenInput = document.getElementById("dl-groundscreen");
    const elevatedInput = document.getElementById("dl-elevated");

    const feedFamilyInput = document.getElementById("dl-feed-family");
    const feedTypeInput = document.getElementById("dl-feed-type");
    const feedLenInput = document.getElementById("dl-feed-length");

    const summaryDiv = document.getElementById("dl-summary");
    const button = document.getElementById("dl-compute");

    button.addEventListener("click", () => {

        const errors = [];

        const freq = toNumber(freqInput.value);
        const perim = toNumber(perimInput.value);
        const apex = toNumber(apexInput.value);
        const base = toNumber(baseInput.value);
        const feedpos = feedposInput.value;
        const orient = orientInput.value;

        requireFrequency(freq, errors);
        requirePositive(perim, "Loop perimeter", errors);
        requirePositive(apex, "Apex height", errors);
        requirePositive(base, "Base height", errors);

        if (apex <= base) {
            errors.push("Apex height must be greater than base height.");
        }

        if (errors.length) {
            summaryDiv.innerHTML = warnBox(errors.join("<br>"));
            return;
        }

        const band = findBand(freq);

        const avgHeight = (apex + base + base) / 3;

        const geom = GeometryEngine.computeGeometry({
            freqMHz: freq,
            heightM: avgHeight,
            spanM: perim
        });

        const baseGain = baseDeltaLoopGain(geom.frac);

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
                ? Math.max(10, Math.min(35, geom.toa + boost.toaShift))
                : feedpos === "side"
                ? Math.max(45, Math.min(75, geom.toa + boost.toaShift))
                : Math.max(20, Math.min(55, geom.toa + boost.toaShift));

        const geomLines = [
            `Loop perimeter: ${perim.toFixed(1)} m`,
            `Apex height: ${apex.toFixed(1)} m`,
            `Base height: ${base.toFixed(1)} m`,
            `Feedpoint: ${feedpos}`,
            `Orientation: ${orient}`,
            `Average height: ${avgHeight.toFixed(1)} m`,
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

        const transformerHtml = TransformerEngine.getTransformerNote("deltaLoop", feedFamily);

        log("DeltaLoop", {
            freq,
            perim,
            apex,
            base,
            feedpos,
            orient,
            avgHeight,
            geom,
            baseGain,
            boost,
            totalGain,
            finalToa
        });

        summaryDiv.innerHTML = infoBox(`
            <p><strong>Operating frequency:</strong> ${freq.toFixed(2)} MHz (${band?.label ?? "Unknown band"})</p>

            <p><strong>Base Delta Loop Gain:</strong> ${baseGain.toFixed(1)} dBi</p>

            <p><strong>Geometry details:</strong><br>${geomLines}</p>

            <p><strong>Boost breakdown:</strong><br>${boostLines}</p>

            <p><strong>Total estimated gain:</strong> ${totalGain.toFixed(1)} dBi</p>

            <p><strong>Estimated TOA:</strong> ${finalToa.toFixed(0)}°</p>

            ${transformerHtml}
        `);
    });
}
