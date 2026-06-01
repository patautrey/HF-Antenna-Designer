/* ---------------------------------------------------------
   HF Workbench — Horizontal Loop / Skywire
   - Geometry panel
   - Unified boost panel (two-column .boost-grid)
   - Feedline family + type + length
   - Transformer Requirements (4:1 current balun)
--------------------------------------------------------- */

import { requireFrequency, requirePositive, toNumber } from "../validators.js";
import { infoBox, warnBox } from "../dom.js";
import { findBand } from "../constants.js";
import { log } from "../log.js";
import { GeometryEngine } from "../engines/geometry-engine.js";
import { BoostEngine } from "../engines/boost-engine.js";
import { TransformerEngine } from "../engines/transformer-engine.js";

function baseLoopGain(frac) {
    if (frac < 0.30) return 1.5;
    if (frac < 0.60) return 2.0;
    if (frac < 0.90) return 2.4;
    return 2.7;
}

export default function initLoop(root) {
    const container = document.querySelector("#content") || root;
    if (!container) return;

    container.innerHTML = `
        <section class="tool">
            <h2>Horizontal Loop / Skywire</h2>

            <h3>Geometry</h3>
            <div class="field-grid">
                <label>Frequency (MHz)
                    <input id="lp-freq" type="number" step="0.01" value="3.8">
                </label>
                <label>Perimeter (m)
                    <input id="lp-perim" type="number" step="1" value="130">
                </label>
                <label>Average height (m)
                    <input id="lp-height" type="number" step="0.5" value="12">
                </label>
                <label>Shape
                    <select id="lp-shape">
                        <option value="square">Square</option>
                        <option value="triangle">Triangle</option>
                        <option value="rectangle">Rectangle</option>
                        <option value="irregular">Irregular</option>
                    </select>
                </label>
            </div>

            <h3>Boost</h3>
            <div class="field-grid boost-grid">
                <label>Time of day
                    <select id="lp-tod">
                        <option value="day">Day</option>
                        <option value="night">Night</option>
                        <option value="dawn">Dawn</option>
                        <option value="dusk">Dusk</option>
                    </select>
                </label>

                <label><input id="lp-seaside" type="checkbox"> Seaside (+10 dB)</label>
                <label><input id="lp-groundscreen" type="checkbox"> Ground Screen / Faraday Cloth</label>
                <label><input id="lp-elevated" type="checkbox"> Elevated Feed / Supports</label>

                <label>Feedline family
                    <select id="lp-feed-family">
                        <option value="coax">Coax</option>
                        <option value="ladder">Ladder line</option>
                    </select>
                </label>

                <label>Feedline type
                    <select id="lp-feed-type">
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
                    <input id="lp-feed-length" type="number" step="5" value="75">
                </label>
            </div>

            <button id="lp-compute" style="margin-top:1rem;">Compute Loop</button>

            <div id="lp-summary" class="summary" style="margin-top:1rem;"></div>
        </section>
    `;

    const freqInput = document.getElementById("lp-freq");
    const perimInput = document.getElementById("lp-perim");
    const heightInput = document.getElementById("lp-height");
    const shapeInput = document.getElementById("lp-shape");

    const todInput = document.getElementById("lp-tod");
    const seasideInput = document.getElementById("lp-seaside");
    const groundScreenInput = document.getElementById("lp-groundscreen");
    const elevatedInput = document.getElementById("lp-elevated");

    const feedFamilyInput = document.getElementById("lp-feed-family");
    const feedTypeInput = document.getElementById("lp-feed-type");
    const feedLenInput = document.getElementById("lp-feed-length");

    const summaryDiv = document.getElementById("lp-summary");
    const button = document.getElementById("lp-compute");

    button.addEventListener("click", () => {
        const errors = [];

        const freq = toNumber(freqInput.value);
        const perim = toNumber(perimInput.value);
        const height = toNumber(heightInput.value);
        const shape = shapeInput.value;

        requireFrequency(freq, errors);
        requirePositive(perim, "Perimeter", errors);
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

        const baseGain = baseLoopGain(geom.frac);

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
        const finalToa = Math.max(30, Math.min(85, geom.toa + boost.toaShift));

        const geomAdjustLines = (geom.components && geom.components.length)
            ? geom.components
                .map(c => c.note ?? "")
                .filter(Boolean)
                .join("<br>")
            : "No additional geometry modifiers.";

        const boostLines = boost.components.length
            ? boost.components.map(d => {
                const parts = [];
                if (typeof d.boost === "number") {
                    parts.push(`${d.boost.toFixed(1)} dB from ${d.label}`);
                } else {
                    parts.push(d.label);
                }
                if (d.toaShift) {
                    parts.push(`TOA shift ${d.toaShift > 0 ? "+" : ""}${d.toaShift}°`);
                }
                return parts.join(" — ");
            }).join("<br>")
            : "No boost options enabled.";

        const transformerHtml = TransformerEngine.getTransformerNote("loop", feedFamily);

        log("Loop", {
            freq,
            perim,
            height,
            shape,
            geom,
            baseGain,
            boost,
            totalGain,
            finalToa
        });

        summaryDiv.innerHTML = infoBox(`
            <p><strong>Design frequency:</strong> ${freq.toFixed(2)} MHz (${band?.label ?? "Unknown band"})</p>

            <p><strong>Perimeter:</strong> ${perim.toFixed(1)} m<br>
               <strong>Average height:</strong> ${height.toFixed(1)} m<br>
               <strong>Shape:</strong> ${shape}</p>

            <p><strong>Electrical height:</strong>
                ${geom.effectiveHeight.toFixed(2)} m
                (${(geom.frac * 100).toFixed(1)}% of λ)
            </p>

            <p><strong>Base Loop Gain (no boosts):</strong> ${baseGain.toFixed(1)} dBi</p>

            <p><strong>Geometry adjustments:</strong><br>${geomAdjustLines}</p>

            <p><strong>Boost breakdown:</strong><br>${boostLines}</p>

            <p><strong>NVIS reflector:</strong> No NVIS reflector enabled.</p>

            <p><strong>Total estimated gain:</strong> ${totalGain.toFixed(1)} dBi</p>

            <p><strong>Estimated TOA:</strong> ${finalToa.toFixed(0)}°</p>

            ${transformerHtml}
        `);
    });
}
