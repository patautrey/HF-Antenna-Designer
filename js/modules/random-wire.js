/* ---------------------------------------------------------
   HF Workbench — Random Wire / End-Fed Non-Resonant
   - Geometry panel
   - Unified boost panel (two-column .boost-grid)
   - Feedline family + type + length
   - Transformer Requirements / unun + choke notes
--------------------------------------------------------- */

import { requireFrequency, requirePositive, toNumber } from "../validators.js";
import { infoBox, warnBox } from "../dom.js";
import { findBand } from "../constants.js";
import { log } from "../log.js";
import { GeometryEngine } from "../engines/geometry-engine.js";
import { BoostEngine } from "../engines/boost-engine.js";
import { TransformerEngine } from "../engines/transformer-engine.js";

function baseRandomWireGain(frac) {
    if (frac < 0.30) return 1.0;
    if (frac < 0.60) return 1.5;
    if (frac < 0.90) return 1.8;
    return 2.0;
}

export default function initRandomWire(root) {
    const container = document.querySelector("#content") || root;
    if (!container) return;

    container.innerHTML = `
        <section class="tool">
            <h2>Random Wire / End-Fed Non-Resonant</h2>

            <h3>Geometry</h3>
            <div class="field-grid">
                <label>Frequency (MHz)
                    <input id="rw-freq" type="number" step="0.01" value="7.1">
                </label>
                <label>Total wire length (m)
                    <input id="rw-length" type="number" step="0.5" value="26">
                </label>
                <label>Average height (m)
                    <input id="rw-height" type="number" step="0.5" value="8">
                </label>
                <label>Configuration
                    <select id="rw-config">
                        <option value="sloper">Sloper</option>
                        <option value="inverted-L">Inverted-L</option>
                        <option value="flat-top">Flat-top</option>
                        <option value="random">Random / irregular</option>
                    </select>
                </label>
            </div>

            <h3>Boost</h3>
            <div class="field-grid boost-grid">
                <label>Time of day
                    <select id="rw-tod">
                        <option value="day">Day</option>
                        <option value="night">Night</option>
                        <option value="dawn">Dawn</option>
                        <option value="dusk">Dusk</option>
                    </select>
                </label>

                <label><input id="rw-seaside" type="checkbox"> Seaside (+10 dB)</label>
                <label><input id="rw-groundscreen" type="checkbox"> Ground Screen / Faraday Cloth</label>
                <label><input id="rw-elevated" type="checkbox"> Elevated Feed / Supports</label>

                <label>Feedline family
                    <select id="rw-feed-family">
                        <option value="coax">Coax</option>
                        <option value="ladder">Ladder line</option>
                    </select>
                </label>

                <label>Feedline type
                    <select id="rw-feed-type">
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
                    <input id="rw-feed-length" type="number" step="5" value="75">
                </label>
            </div>

            <button id="rw-compute" style="margin-top:1rem;">Compute Random Wire</button>

            <div id="rw-summary" class="summary" style="margin-top:1rem;"></div>
        </section>
    `;

    const freqInput = document.getElementById("rw-freq");
    const lengthInput = document.getElementById("rw-length");
    const heightInput = document.getElementById("rw-height");
    const configInput = document.getElementById("rw-config");

    const todInput = document.getElementById("rw-tod");
    const seasideInput = document.getElementById("rw-seaside");
    const groundScreenInput = document.getElementById("rw-groundscreen");
    const elevatedInput = document.getElementById("rw-elevated");

    const feedFamilyInput = document.getElementById("rw-feed-family");
    const feedTypeInput = document.getElementById("rw-feed-type");
    const feedLenInput = document.getElementById("rw-feed-length");

    const summaryDiv = document.getElementById("rw-summary");
    const button = document.getElementById("rw-compute");

    button.addEventListener("click", () => {
        const errors = [];

        const freq = toNumber(freqInput.value);
        const totalLen = toNumber(lengthInput.value);
        const height = toNumber(heightInput.value);
        const config = configInput.value;

        requireFrequency(freq, errors);
        requirePositive(totalLen, "Total wire length", errors);
        requirePositive(height, "Average height", errors);

        if (errors.length) {
            summaryDiv.innerHTML = warnBox(errors.join("<br>"));
            return;
        }

        const band = findBand(freq);

        const geom = GeometryEngine.computeGeometry({
            freqMHz: freq,
            heightM: height,
            spanM: totalLen
        });

        const baseGain = baseRandomWireGain(geom.frac);

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
        const finalToa = Math.max(25, Math.min(85, geom.toa + boost.toaShift));

        const geomLines = [
            `Total wire length: ${totalLen.toFixed(1)} m`,
            `Configuration: ${config}`,
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

        const transformerHtml = TransformerEngine.getTransformerNote("randomWire", feedFamily);

        log("RandomWire", {
            freq,
            totalLen,
            height,
            config,
            geom,
            baseGain,
            boost,
            totalGain,
            finalToa
        });

        summaryDiv.innerHTML = infoBox(`
            <p><strong>Design frequency:</strong> ${freq.toFixed(2)} MHz (${band?.label ?? "Unknown band"})</p>

            <p><strong>Electrical height (feed region):</strong> 
                ${geom.effectiveHeight.toFixed(2)} m 
                (${(geom.frac * 100).toFixed(1)}% of λ)
            </p>

            <p><strong>Base Random Wire Gain:</strong> ${baseGain.toFixed(1)} dBi</p>

            <p><strong>Geometry details:</strong><br>${geomLines}</p>

            <p><strong>Boost breakdown:</strong><br>${boostLines}</p>

            <p><strong>Total estimated gain:</strong> ${totalGain.toFixed(1)} dBi</p>

            <p><strong>Estimated TOA:</strong> ${finalToa.toFixed(0)}°</p>

            ${transformerHtml}
        `);
    });
}
