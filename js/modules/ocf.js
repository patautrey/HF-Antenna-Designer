/* ---------------------------------------------------------
   HF Workbench — Off-Center-Fed Dipole (OCF)
   - Geometry panel
   - Unified boost panel (two-column .boost-grid)
   - Feedline family + type + length
   - Transformer Requirements / balun notes
--------------------------------------------------------- */

import { requireFrequency, requirePositive, toNumber } from "../validators.js";
import { infoBox, warnBox } from "../dom.js";
import { findBand } from "../constants.js";
import { log } from "../log.js";
import { GeometryEngine } from "../engines/geometry-engine.js";
import { BoostEngine } from "../engines/boost-engine.js";
import { TransformerEngine } from "../engines/transformer-engine.js";

function baseOCFGain(frac) {
    if (frac < 0.40) return 1.5;
    if (frac < 0.60) return 2.0;
    if (frac < 0.80) return 2.4;
    return 2.7;
}

export default function initOCF(root) {
    const container = document.querySelector("#content") || root;
    if (!container) return;

    container.innerHTML = `
        <section class="tool">
            <h2>Off-Center-Fed Dipole (OCF)</h2>

            <h3>Geometry</h3>
            <div class="field-grid">
                <label>Frequency (MHz)
                    <input id="ocf-freq" type="number" step="0.01" value="7.1">
                </label>
                <label>Total length (m)
                    <input id="ocf-length" type="number" step="0.5" value="40">
                </label>
                <label>Feed offset (% from one end)
                    <input id="ocf-offset" type="number" step="1" value="33">
                </label>
                <label>Average height (m)
                    <input id="ocf-height" type="number" step="0.5" value="10">
                </label>
            </div>

            <h3>Boost</h3>
            <div class="field-grid boost-grid">
                <label>Time of day
                    <select id="ocf-tod">
                        <option value="day">Day</option>
                        <option value="night">Night</option>
                        <option value="dawn">Dawn</option>
                        <option value="dusk">Dusk</option>
                    </select>
                </label>

                <label><input id="ocf-seaside" type="checkbox"> Seaside (+10 dB)</label>
                <label><input id="ocf-groundscreen" type="checkbox"> Ground Screen / Faraday Cloth</label>
                <label><input id="ocf-elevated" type="checkbox"> Elevated Feed / Supports</label>

                <label>Feedline family
                    <select id="ocf-feed-family">
                        <option value="coax">Coax</option>
                        <option value="ladder">Ladder line</option>
                    </select>
                </label>

                <label>Feedline type
                    <select id="ocf-feed-type">
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
                    <input id="ocf-feed-length" type="number" step="5" value="75">
                </label>
            </div>

            <button id="ocf-compute" style="margin-top:1rem;">Compute OCF</button>

            <div id="ocf-summary" class="summary" style="margin-top:1rem;"></div>
        </section>
    `;

    const freqInput = document.getElementById("ocf-freq");
    const lengthInput = document.getElementById("ocf-length");
    const offsetInput = document.getElementById("ocf-offset");
    const heightInput = document.getElementById("ocf-height");

    const todInput = document.getElementById("ocf-tod");
    const seasideInput = document.getElementById("ocf-seaside");
    const groundScreenInput = document.getElementById("ocf-groundscreen");
    const elevatedInput = document.getElementById("ocf-elevated");

    const feedFamilyInput = document.getElementById("ocf-feed-family");
    const feedTypeInput = document.getElementById("ocf-feed-type");
    const feedLenInput = document.getElementById("ocf-feed-length");

    const summaryDiv = document.getElementById("ocf-summary");
    const button = document.getElementById("ocf-compute");

    button.addEventListener("click", () => {
        const errors = [];

        const freq = toNumber(freqInput.value);
        const totalLen = toNumber(lengthInput.value);
        const offsetPct = toNumber(offsetInput.value);
        const height = toNumber(heightInput.value);

        requireFrequency(freq, errors);
        requirePositive(totalLen, "Total length", errors);
        requirePositive(height, "Average height", errors);
        if (offsetPct <= 0 || offsetPct >= 50) {
            errors.push("Feed offset should typically be between 10% and 45% from one end.");
        }

        if (errors.length) {
            summaryDiv.innerHTML = warnBox(errors.join("<br>"));
            return;
        }

        const band = findBand(freq);

        const geom = GeometryEngine.computeGeometry({
            freqMHz: freq,
            heightM: height
        });

        const baseGain = baseOCFGain(geom.frac);

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
        const finalToa = Math.max(20, Math.min(80, geom.toa + boost.toaShift));

        const geomLines = [
            `Total span: ${totalLen.toFixed(1)} m`,
            `Feed offset: ${offsetPct.toFixed(1)}% from one end`,
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

        const transformerHtml = TransformerEngine.getTransformerNote("ocf", feedFamily);

        log("OCF", {
            freq,
            totalLen,
            offsetPct,
            height,
            geom,
            baseGain,
            boost,
            totalGain,
            finalToa
        });

        summaryDiv.innerHTML = infoBox(`
            <p><strong>Design frequency:</strong> ${freq.toFixed(2)} MHz (${band?.label ?? "Unknown band"})</p>

            <p><strong>Electrical height (center):</strong> 
                ${geom.effectiveHeight.toFixed(2)} m 
                (${(geom.frac * 100).toFixed(1)}% of λ)
            </p>

            <p><strong>Base OCF Gain:</strong> ${baseGain.toFixed(1)} dBi</p>

            <p><strong>Geometry details:</strong><br>${geomLines}</p>

            <p><strong>Boost breakdown:</strong><br>${boostLines}</p>

            <p><strong>Total estimated gain:</strong> ${totalGain.toFixed(1)} dBi</p>

            <p><strong>Estimated TOA:</strong> ${finalToa.toFixed(0)}°</p>

            ${transformerHtml}
        `);
    });
}
