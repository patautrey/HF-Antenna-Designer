/* ---------------------------------------------------------
   HF Workbench — Quarter‑Wave Vertical Ground Plane
   - Geometry panel
   - Unified boost panel (two-column .boost-grid)
   - Radial count + radial length
   - Feedline family + type + length
   - Transformer Requirements (1:1 current choke)
--------------------------------------------------------- */

import { requireFrequency, requirePositive, toNumber } from "../validators.js";
import { infoBox, warnBox } from "../dom.js";
import { findBand } from "../constants.js";
import { log } from "../log.js";
import { GeometryEngine } from "../engines/geometry-engine.js";
import { BoostEngine } from "../engines/boost-engine.js";
import { TransformerEngine } from "../engines/transformer-engine.js";

function baseGPGain(frac) {
    if (frac < 0.40) return 1.5;
    if (frac < 0.60) return 2.0;
    if (frac < 0.80) return 2.4;
    return 2.6;
}

export default function initVerticalGroundplane(root) {
    const container = document.querySelector("#content") || root;
    if (!container) return;

    container.innerHTML = `
        <section class="tool">
            <h2>Quarter‑Wave Vertical Ground Plane</h2>

            <h3>Geometry</h3>
            <div class="field-grid">

                <label>Frequency (MHz)
                    <input id="gp-freq" type="number" step="0.01" value="14.2">
                </label>

                <label>Radiator length (m)
                    <input id="gp-rad" type="number" step="0.1" value="5.0">
                </label>

                <label>Radial count (2–32)
                    <input id="gp-radials" type="number" min="2" max="32" step="1" value="4">
                </label>

                <label>Radial length (m)
                    <input id="gp-radlen" type="number" step="0.1" value="5.0">
                </label>

                <label>Height above ground (m)
                    <input id="gp-height" type="number" step="0.5" value="2">
                </label>

            </div>

            <h3>Boost</h3>
            <div class="field-grid boost-grid">

                <label>Time of day
                    <select id="gp-tod">
                        <option value="day">Day</option>
                        <option value="night">Night</option>
                        <option value="dawn">Dawn</option>
                        <option value="dusk">Dusk</option>
                    </select>
                </label>

                <label><input id="gp-seaside" type="checkbox"> Seaside (+10 dB)</label>
                <label><input id="gp-groundscreen" type="checkbox"> Ground Screen / Faraday Cloth</label>
                <label><input id="gp-elevated" type="checkbox"> Elevated Radials</label>

                <label>Feedline family
                    <select id="gp-feed-family">
                        <option value="coax">Coax</option>
                        <option value="ladder">Ladder line</option>
                    </select>
                </label>

                <label>Feedline type
                    <select id="gp-feed-type">
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
                    <input id="gp-feed-length" type="number" step="5" value="75">
                </label>

            </div>

            <button id="gp-compute" style="margin-top:1rem;">Compute Ground Plane</button>

            <div id="gp-summary" class="summary" style="margin-top:1rem;"></div>

        </section>
    `;

    const freqInput = document.getElementById("gp-freq");
    const radInput = document.getElementById("gp-rad");
    const radialsInput = document.getElementById("gp-radials");
    const radlenInput = document.getElementById("gp-radlen");
    const heightInput = document.getElementById("gp-height");

    const todInput = document.getElementById("gp-tod");
    const seasideInput = document.getElementById("gp-seaside");
    const groundScreenInput = document.getElementById("gp-groundscreen");
    const elevatedInput = document.getElementById("gp-elevated");

    const feedFamilyInput = document.getElementById("gp-feed-family");
    const feedTypeInput = document.getElementById("gp-feed-type");
    const feedLenInput = document.getElementById("gp-feed-length");

    const summaryDiv = document.getElementById("gp-summary");
    const button = document.getElementById("gp-compute");

    button.addEventListener("click", () => {

        const errors = [];

        const freq = toNumber(freqInput.value);
        const rad = toNumber(radInput.value);
        const radials = toNumber(radialsInput.value);
        const radlen = toNumber(radlenInput.value);
        const height = toNumber(heightInput.value);

        requireFrequency(freq, errors);
        requirePositive(rad, "Radiator length", errors);
        requirePositive(radials, "Radial count", errors);
        requirePositive(radlen, "Radial length", errors);
        requirePositive(height, "Height above ground", errors);

        if (radials < 2 || radials > 32) {
            errors.push("Radial count must be between 2 and 32.");
        }

        if (errors.length) {
            summaryDiv.innerHTML = warnBox(errors.join("<br>"));
            return;
        }

        const band = findBand(freq);

        const geom = GeometryEngine.computeGeometry({
            freqMHz: freq,
            heightM: height,
            spanM: rad
        });

        const baseGain = baseGPGain(geom.frac);

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
        const finalToa = Math.max(12, Math.min(70, geom.toa + boost.toaShift));

        const geomLines = [
            `Radiator length: ${rad.toFixed(2)} m`,
            `Radial count: ${radials}`,
            `Radial length: ${radlen.toFixed(2)} m`,
            `Height above ground: ${height.toFixed(2)} m`,
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

        const transformerHtml = TransformerEngine.getTransformerNote("verticalGroundplane", feedFamily);

        log("VerticalGroundplane", {
            freq,
            rad,
            radials,
            radlen,
            height,
            geom,
            baseGain,
            boost,
            totalGain,
            finalToa
        });

        summaryDiv.innerHTML = infoBox(`
            <p><strong>Design frequency:</strong> ${freq.toFixed(2)} MHz (${band?.label ?? "Unknown band"})</p>

            <p><strong>Electrical height:</strong> 
                ${geom.effectiveHeight.toFixed(2)} m 
                (${(geom.frac * 100).toFixed(1)}% of λ)
            </p>

            <p><strong>Base Ground Plane Gain:</strong> ${baseGain.toFixed(1)} dBi</p>

            <p><strong>Geometry details:</strong><br>${geomLines}</p>

            <p><strong>Boost breakdown:</strong><br>${boostLines}</p>

            <p><strong>Total estimated gain:</strong> ${totalGain.toFixed(1)} dBi</p>

            <p><strong>Estimated TOA:</strong> ${finalToa.toFixed(0)}°</p>

            ${transformerHtml}
        `);
    });
}
