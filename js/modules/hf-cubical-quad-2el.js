/* ---------------------------------------------------------
   HF Workbench — 2‑Element Cubical Quad (Driven + Reflector)
   - Geometry panel
   - Unified boost panel (two-column .boost-grid)
   - Driven loop + reflector loop + spacing
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

function baseQuad2elGain(frac) {
    // Typical 2‑element quad gain profile
    if (frac < 0.40) return 5.0;
    if (frac < 0.60) return 5.8;
    if (frac < 0.80) return 6.4;
    return 6.8;
}

export default function initCubicalQuad2el(root) {
    const container = document.querySelector("#content") || root;
    if (!container) return;

    container.innerHTML = `
        <section class="tool">
            <h2>2‑Element Cubical Quad (Driven + Reflector)</h2>

            <h3>Geometry</h3>
            <div class="field-grid">

                <label>Operating frequency (MHz)
                    <input id="cq2-freq" type="number" step="0.01" value="14.2">
                </label>

                <label>Driven loop perimeter (m)
                    <input id="cq2-driven" type="number" step="0.1" value="21">
                </label>

                <label>Reflector loop perimeter (m)
                    <input id="cq2-refl" type="number" step="0.1" value="22">
                </label>

                <label>Element spacing (m)
                    <input id="cq2-spacing" type="number" step="0.1" value="2.5">
                </label>

                <label>Loop height above ground (m)
                    <input id="cq2-height" type="number" step="0.1" value="10">
                </label>

                <label>Feedpoint
                    <select id="cq2-feedpos">
                        <option value="bottom">Bottom (horizontal pol.)</option>
                        <option value="side">Side (vertical pol.)</option>
                    </select>
                </label>

                <label>Orientation
                    <select id="cq2-orient">
                        <option value="square">Square</option>
                        <option value="diamond">Diamond (45° rotated)</option>
                    </select>
                </label>

            </div>

            <h3>Boost</h3>
            <div class="field-grid boost-grid">

                <label>Time of day
                    <select id="cq2-tod">
                        <option value="day">Day</option>
                        <option value="night">Night</option>
                        <option value="dawn">Dawn</option>
                        <option value="dusk">Dusk</option>
                    </select>
                </label>

                <label><input id="cq2-seaside" type="checkbox"> Seaside (+10 dB)</label>
                <label><input id="cq2-groundscreen" type="checkbox"> Ground Screen / Faraday Cloth</label>
                <label><input id="cq2-elevated" type="checkbox"> Elevated Supports</label>

                <label>Feedline family
                    <select id="cq2-feed-family">
                        <option value="coax">Coax</option>
                        <option value="ladder">Ladder line</option>
                    </select>
                </label>

                <label>Feedline type
                    <select id="cq2-feed-type">
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
                    <input id="cq2-feed-length" type="number" step="5" value="75">
                </label>

            </div>

            <button id="cq2-compute" style="margin-top:1rem;">Compute 2‑Element Quad</button>

            <div id="cq2-summary" class="summary" style="margin-top:1rem;"></div>

        </section>
    `;

    const freqInput = document.getElementById("cq2-freq");
    const drivenInput = document.getElementById("cq2-driven");
    const reflInput = document.getElementById("cq2-refl");
    const spacingInput = document.getElementById("cq2-spacing");
    const heightInput = document.getElementById("cq2-height");
    const feedposInput = document.getElementById("cq2-feedpos");
    const orientInput = document.getElementById("cq2-orient");

    const todInput = document.getElementById("cq2-tod");
    const seasideInput = document.getElementById("cq2-seaside");
    const groundScreenInput = document.getElementById("cq2-groundscreen");
    const elevatedInput = document.getElementById("cq2-elevated");

    const feedFamilyInput = document.getElementById("cq2-feed-family");
    const feedTypeInput = document.getElementById("cq2-feed-type");
    const feedLenInput = document.getElementById("cq2-feed-length");

    const summaryDiv = document.getElementById("cq2-summary");
    const button = document.getElementById("cq2-compute");

    button.addEventListener("click", () => {

        const errors = [];

        const freq = toNumber(freqInput.value);
        const driven = toNumber(drivenInput.value);
        const refl = toNumber(reflInput.value);
        const spacing = toNumber(spacingInput.value);
        const height = toNumber(heightInput.value);
        const feedpos = feedposInput.value;
        const orient = orientInput.value;

        requireFrequency(freq, errors);
        requirePositive(driven, "Driven loop perimeter", errors);
        requirePositive(refl, "Reflector loop perimeter", errors);
        requirePositive(spacing, "Element spacing", errors);
        requirePositive(height, "Loop height", errors);

        if (refl <= driven) {
            errors.push("Reflector loop must be slightly larger than driven loop.");
        }

        if (errors.length) {
            summaryDiv.innerHTML = warnBox(errors.join("<br>"));
            return;
        }

        const band = findBand(freq);

        const avgSpan = (driven + refl) / 2;

        const geom = GeometryEngine.computeGeometry({
            freqMHz: freq,
            heightM: height,
            spanM: avgSpan
        });

        const baseGain = baseQuad2elGain(geom.frac);

        const feedFamily = feedFamilyInput.value === "ladder" ? "ladder" : "coax";

        const boost = BoostEngine.computeBoost({
            reflectorCount: 1,
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
                ? Math.max(10, Math.min(32, geom.toa + boost.toaShift))
                : Math.max(40, Math.min(70, geom.toa + boost.toaShift));

        const geomLines = [
            `Driven loop perimeter: ${driven.toFixed(1)} m`,
            `Reflector loop perimeter: ${refl.toFixed(1)} m`,
            `Element spacing: ${spacing.toFixed(1)} m`,
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

        const transformerHtml = TransformerEngine.getTransformerNote("cubicalQuad2el", feedFamily);

        log("CubicalQuad2el", {
            freq,
            driven,
            refl,
            spacing,
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

            <p><strong>Base 2‑Element Quad Gain:</strong> ${baseGain.toFixed(1)} dBi</p>

            <p><strong>Geometry details:</strong><br>${geomLines}</p>

            <p><strong>Boost breakdown:</strong><br>${boostLines}</p>

            <p><strong>Total estimated gain:</strong> ${totalGain.toFixed(1)} dBi</p>

            <p><strong>Estimated TOA:</strong> ${finalToa.toFixed(0)}°</p>

            ${transformerHtml}
        `);
    });
}
