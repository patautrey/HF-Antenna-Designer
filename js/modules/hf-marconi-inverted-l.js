/* ---------------------------------------------------------
   HF Workbench — Inverted‑L (Marconi‑L)
   - Geometry panel
   - Unified boost panel (two-column .boost-grid)
   - Vertical section + horizontal section
   - Feedline family + type + length
   - Transformer Requirements (matching network + 1:1 choke)
--------------------------------------------------------- */

import { requireFrequency, requirePositive, toNumber } from "../validators.js";
import { infoBox, warnBox } from "../dom.js";
import { findBand } from "../constants.js";
import { log } from "../log.js";
import { GeometryEngine } from "../engines/geometry-engine.js";
import { BoostEngine } from "../engines/boost-engine.js";
import { TransformerEngine } from "../engines/transformer-engine.js";

function baseInvertedLGain(frac) {
    if (frac < 0.40) return 1.1;
    if (frac < 0.60) return 1.6;
    if (frac < 0.80) return 2.0;
    return 2.3;
}

export default function initInvertedL(root) {
    const container = document.querySelector("#content") || root;
    if (!container) return;

    container.innerHTML = `
        <section class="tool">
            <h2>Inverted‑L (Marconi‑L)</h2>

            <h3>Geometry</h3>
            <div class="field-grid">

                <label>Frequency (MHz)
                    <input id="il-freq" type="number" step="0.01" value="3.8">
                </label>

                <label>Vertical section length (m)
                    <input id="il-vert" type="number" step="0.1" value="12">
                </label>

                <label>Horizontal section length (m)
                    <input id="il-horiz" type="number" step="0.1" value="20">
                </label>

                <label>Base height (m)
                    <input id="il-height" type="number" step="0.5" value="2">
                </label>

            </div>

            <h3>Boost</h3>
            <div class="field-grid boost-grid">

                <label>Time of day
                    <select id="il-tod">
                        <option value="day">Day</option>
                        <option value="night">Night</option>
                        <option value="dawn">Dawn</option>
                        <option value="dusk">Dusk</option>
                    </select>
                </label>

                <label><input id="il-seaside" type="checkbox"> Seaside (+10 dB)</label>
                <label><input id="il-groundscreen" type="checkbox"> Ground Screen / Faraday Cloth</label>
                <label><input id="il-elevated" type="checkbox"> Elevated Base / Supports</label>

                <label>Feedline family
                    <select id="il-feed-family">
                        <option value="coax">Coax</option>
                        <option value="ladder">Ladder line</option>
                    </select>
                </label>

                <label>Feedline type
                    <select id="il-feed-type">
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
                    <input id="il-feed-length" type="number" step="5" value="75">
                </label>

            </div>

            <button id="il-compute" style="margin-top:1rem;">Compute Inverted‑L</button>

            <div id="il-summary" class="summary" style="margin-top:1rem;"></div>

        </section>
    `;

    const freqInput = document.getElementById("il-freq");
    const vertInput = document.getElementById("il-vert");
    const horizInput = document.getElementById("il-horiz");
    const heightInput = document.getElementById("il-height");

    const todInput = document.getElementById("il-tod");
    const seasideInput = document.getElementById("il-seaside");
    const groundScreenInput = document.getElementById("il-groundscreen");
    const elevatedInput = document.getElementById("il-elevated");

    const feedFamilyInput = document.getElementById("il-feed-family");
    const feedTypeInput = document.getElementById("il-feed-type");
    const feedLenInput = document.getElementById("il-feed-length");

    const summaryDiv = document.getElementById("il-summary");
    const button = document.getElementById("il-compute");

    button.addEventListener("click", () => {

        const errors = [];

        const freq = toNumber(freqInput.value);
        const vert = toNumber(vertInput.value);
        const horiz = toNumber(horizInput.value);
        const height = toNumber(heightInput.value);

        requireFrequency(freq, errors);
        requirePositive(vert, "Vertical section length", errors);
        requirePositive(horiz, "Horizontal section length", errors);
        requirePositive(height, "Base height", errors);

        if (errors.length) {
            summaryDiv.innerHTML = warnBox(errors.join("<br>"));
            return;
        }

        const band = findBand(freq);

        const effectiveSpan = vert + horiz;

        const geom = GeometryEngine.computeGeometry({
            freqMHz: freq,
            heightM: height,
            spanM: effectiveSpan
        });

        const baseGain = baseInvertedLGain(geom.frac);

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
        const finalToa = Math.max(15, Math.min(65, geom.toa + boost.toaShift));

        const geomLines = [
            `Vertical section: ${vert.toFixed(2)} m`,
            `Horizontal section: ${horiz.toFixed(2)} m`,
            `Effective electrical span: ${effectiveSpan.toFixed(2)} m`,
            `Base height: ${height.toFixed(2)} m`,
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

        const transformerHtml = TransformerEngine.getTransformerNote("invertedL", feedFamily);

        log("InvertedL", {
            freq,
            vert,
            horiz,
            height,
            effectiveSpan,
            geom,
            baseGain,
            boost,
            totalGain,
            finalToa
        });

        summaryDiv.innerHTML = infoBox(`
            <p><strong>Operating frequency:</strong> ${freq.toFixed(2)} MHz (${band?.label ?? "Unknown band"})</p>

            <p><strong>Electrical height:</strong>
                ${geom.effectiveHeight.toFixed(2)} m
                (${(geom.frac * 100).toFixed(1)}% of λ)
            </p>

            <p><strong>Base Inverted‑L Gain:</strong> ${baseGain.toFixed(1)} dBi</p>

            <p><strong>Geometry details:</strong><br>${geomLines}</p>

            <p><strong>Boost breakdown:</strong><br>${boostLines}</p>

            <p><strong>Total estimated gain:</strong> ${totalGain.toFixed(1)} dBi</p>

            <p><strong>Estimated TOA:</strong> ${finalToa.toFixed(0)}°</p>

            ${transformerHtml}
        `);
    });
}
