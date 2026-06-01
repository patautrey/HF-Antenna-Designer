/* --------------------------------------------------------------
   Antenna Workbench — Vertical DX Designer
   Full Workbench‑style module
   - GeometryEngine
   - BoostEngine
   - TransformerEngine
   - Unified boost panel
   - Summary box
   - Logging
-------------------------------------------------------------- */

import { requireFrequency, requirePositive, toNumber } from "../validators.js";
import { infoBox, warnBox } from "../dom.js";
import { findBand } from "../constants.js";
import { log } from "../log.js";
import { GeometryEngine } from "../engines/geometry-engine.js";
import { BoostEngine } from "../engines/boost-engine.js";
import { TransformerEngine } from "../engines/transformer-engine.js";

/* --------------------------------------------------------------
   BASE GAIN MODEL FOR DX VERTICAL
-------------------------------------------------------------- */
function baseVerticalDxGain(frac) {
    if (frac < 0.20) return 0.5;
    if (frac < 0.30) return 1.5;
    if (frac < 0.40) return 2.2;
    if (frac < 0.60) return 2.6;
    return 2.9;
}

export default function initVerticalDx(root) {
    const container = document.querySelector("#content") || root;
    if (!container) return;

    container.innerHTML = `
        <section class="tool">
            <h2>Vertical DX Designer</h2>

            <h3>Geometry</h3>
            <div class="field-grid">
                <label>Frequency (MHz)
                    <input id="vdx-freq" type="number" step="0.01" value="14.2">
                </label>

                <label>Radiator height (m)
                    <input id="vdx-height" type="number" step="0.1" value="10">
                </label>

                <label>Radial count
                    <input id="vdx-radials" type="number" step="1" value="8">
                </label>

                <label>Radial length (m)
                    <input id="vdx-radial-length" type="number" step="0.5" value="5">
                </label>

                <label>Ground type
                    <select id="vdx-ground-type">
                        <option value="average">Average soil</option>
                        <option value="poor">Poor / rocky</option>
                        <option value="good">Good soil</option>
                        <option value="saltwater">Saltwater / marsh</option>
                    </select>
                </label>

                <label><input id="vdx-dxturbo-height" type="checkbox"> DX Turbo height override (0.70λ)</label>
            </div>

            <h3>Boost</h3>
            <div class="field-grid boost-grid">
                <label>Time of day
                    <select id="vdx-tod">
                        <option value="day">Day</option>
                        <option value="night">Night</option>
                        <option value="dawn">Dawn</option>
                        <option value="dusk">Dusk</option>
                    </select>
                </label>

                <label><input id="vdx-seaside" type="checkbox"> Seaside (+10 dB)</label>
                <label><input id="vdx-groundscreen" type="checkbox"> Ground screen / radial mesh</label>
                <label><input id="vdx-elevated" type="checkbox"> Elevated radials</label>
                <label><input id="vdx-saltwater" type="checkbox"> Saltwater enhancement</label>

                <label>Feedline type
                    <select id="vdx-feed-type">
                        <option value="RG-213">RG-213</option>
                        <option value="LMR-400">LMR-400</option>
                        <option value="RG-8X">RG-8X</option>
                        <option value="RG-58">RG-58</option>
                    </select>
                </label>

                <label>Feedline length (ft)
                    <input id="vdx-feed-length" type="number" step="5" value="75">
                </label>

                <label><input id="vdx-dxturbo-pattern" type="checkbox"> DX Turbo pattern bonus</label>
            </div>

            <button id="vdx-compute" style="margin-top:1rem;">Compute Vertical DX</button>

            <div id="vdx-summary" class="summary" style="margin-top:1rem;"></div>
        </section>
    `;

    // Inputs
    const freqInput = document.getElementById("vdx-freq");
    const heightInput = document.getElementById("vdx-height");
    const radialCountInput = document.getElementById("vdx-radials");
    const radialLengthInput = document.getElementById("vdx-radial-length");
    const groundTypeInput = document.getElementById("vdx-ground-type");
    const dxTurboHeightInput = document.getElementById("vdx-dxturbo-height");

    const todInput = document.getElementById("vdx-tod");
    const seasideInput = document.getElementById("vdx-seaside");
    const groundScreenInput = document.getElementById("vdx-groundscreen");
    const elevatedInput = document.getElementById("vdx-elevated");
    const saltwaterInput = document.getElementById("vdx-saltwater");

    const feedTypeInput = document.getElementById("vdx-feed-type");
    const feedLenInput = document.getElementById("vdx-feed-length");
    const dxTurboPatternInput = document.getElementById("vdx-dxturbo-pattern");

    const summaryDiv = document.getElementById("vdx-summary");
    const button = document.getElementById("vdx-compute");

    button.addEventListener("click", () => {
        const errors = [];

        const freq = toNumber(freqInput.value);
        const height = toNumber(heightInput.value);
        const radialCount = toNumber(radialCountInput.value);
        const radialLength = toNumber(radialLengthInput.value);

        requireFrequency(freq, errors);
        requirePositive(height, "Radiator height", errors);
        requirePositive(radialCount, "Radial count", errors);
        requirePositive(radialLength, "Radial length", errors);

        if (errors.length) {
            summaryDiv.innerHTML = warnBox(errors.join("<br>"));
            return;
        }

        const band = findBand(freq);

        // Geometry
        const geom = GeometryEngine.computeGeometry({
            freqMHz: freq,
            heightM: height,
            dxTurbo: dxTurboHeightInput.checked,
            foldoverEnabled: false,
            foldAngleDeg: 0,
            linearLoadingEnabled: false,
            linearLoadingFactor: 0,
            coilEnabled: false,
            coilPosition: "base",
            coilQ: 0,
            hatEnabled: false,
            hatRadiusM: 0,
            hatSpokes: 0,
            radialCount,
            radialLengthM: radialLength,
            groundType: groundTypeInput.value
        });

        const baseGain = baseVerticalDxGain(geom.frac);

        // Boost
        const boost = BoostEngine.computeBoost({
            reflectorCount: 0,
            directorCount: 0,
            timeOfDay: todInput.value,
            seaside: seasideInput.checked,
            groundScreen: groundScreenInput.checked,
            elevatedRadials: elevatedInput.checked,
            saltwaterEnhancement: saltwaterInput.checked,
            nvisReflector: false,
            feedlineFamily: "coax",
            feedlineType: feedTypeInput.value,
            feedlineLengthFt: toNumber(feedLenInput.value),
            dxTurboPatternBonus: dxTurboPatternInput.checked
        });

        const totalGain = baseGain + geom.totalGeomGainDelta + boost.totalBoost;
        const finalToa = Math.max(5, Math.min(40, geom.toa + boost.toaShift));

        const geomLines = geom.components?.length
            ? geom.components.map(c => c.note ?? "").join("<br>")
            : "No additional geometry modifiers.";

        const boostLines = boost.components?.length
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

        const transformerHtml = TransformerEngine.getTransformerNote("vertical-dx", "coax");

        log("Vertical DX Designer", {
            freq,
            height,
            radialCount,
            radialLength,
            groundType: groundTypeInput.value,
            geom,
            baseGain,
            boost,
            totalGain,
            finalToa
        });

        summaryDiv.innerHTML = infoBox(`
            <p><strong>Design frequency:</strong> ${freq.toFixed(2)} MHz (${band?.label ?? "Unknown band"})</p>

            <p><strong>Radiator height:</strong> ${height.toFixed(2)} m</p>
            <p><strong>Electrical height:</strong> 
                ${geom.effectiveHeight.toFixed(2)} m 
                (${(geom.frac * 100).toFixed(1)}% of λ)
            </p>

            <p><strong>Radial system:</strong> ${radialCount.toFixed(0)} × ${radialLength.toFixed(1)} m (${groundTypeInput.value})</p>

            <p><strong>Base Gain (no boosts):</strong> ${baseGain.toFixed(1)} dBi</p>

            <p><strong>Geometry adjustments:</strong><br>${geomLines}</p>

            <p><strong>Boost breakdown:</strong><br>${boostLines}</p>

            <p><strong>Total estimated gain:</strong> ${totalGain.toFixed(1)} dBi</p>

            <p><strong>Estimated DX takeoff angle (TOA):</strong> ${finalToa.toFixed(0)}°</p>

            ${transformerHtml}
        `);
    });
}
