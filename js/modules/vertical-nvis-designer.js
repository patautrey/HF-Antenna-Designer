/* --------------------------------------------------------------
   Antenna Workbench — Vertical NVIS Designer
   Full Workbench‑style module
   - GeometryEngine
   - BoostEngine
   - NVIS Reflector Engine
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
import { computeNVISReflector, logNVISReflector } from "../engines/nvis-reflector.js";

/* --------------------------------------------------------------
   BASE GAIN MODEL FOR NVIS VERTICAL
-------------------------------------------------------------- */
function baseNvisVerticalGain(frac) {
    if (frac < 0.10) return -1.0;   // very short NVIS stub
    if (frac < 0.20) return 0.5;
    if (frac < 0.30) return 1.2;
    return 1.6;                     // NVIS verticals are not high-gain devices
}

export default function initVerticalNvis(root) {
    const container = document.querySelector("#content") || root;
    if (!container) return;

    container.innerHTML = `
        <section class="tool">
            <h2>Vertical NVIS Designer</h2>

            <h3>Geometry</h3>
            <div class="field-grid">
                <label>Frequency (MHz)
                    <input id="vn-freq" type="number" step="0.01" value="7.1">
                </label>

                <label>Radiator height (m)
                    <input id="vn-height" type="number" step="0.1" value="5">
                </label>

                <label>Top-hat length (m)
                    <input id="vn-hat" type="number" step="0.5" value="0">
                </label>

                <label>Ground loss (Ω)
                    <input id="vn-ground-loss" type="number" step="1" value="10">
                </label>

                <label>Radial count
                    <input id="vn-radials" type="number" step="1" value="8">
                </label>

                <label>Radial length (m)
                    <input id="vn-radial-length" type="number" step="0.5" value="5">
                </label>
            </div>

            <h3>NVIS Reflector</h3>
            <div class="field-grid">
                <label><input id="vn-ref-enable" type="checkbox"> Enable NVIS reflector grid</label>

                <label>Reflector wires
                    <input id="vn-ref-wires" type="number" step="1" value="0">
                </label>

                <label>Reflector spacing (m)
                    <input id="vn-ref-spacing" type="number" step="0.5" value="0">
                </label>

                <label>Reflector height (m)
                    <input id="vn-ref-height" type="number" step="0.5" value="0">
                </label>
            </div>

            <h3>Boost</h3>
            <div class="field-grid boost-grid">
                <label>Time of day
                    <select id="vn-tod">
                        <option value="day">Day</option>
                        <option value="night">Night</option>
                        <option value="dawn">Dawn</option>
                        <option value="dusk">Dusk</option>
                    </select>
                </label>

                <label><input id="vn-seaside" type="checkbox"> Seaside (+10 dB)</label>
                <label><input id="vn-groundscreen" type="checkbox"> Ground screen / mesh</label>
                <label><input id="vn-elevated" type="checkbox"> Elevated radials</label>

                <label>Feedline type
                    <select id="vn-feed-type">
                        <option value="RG-213">RG-213</option>
                        <option value="LMR-400">LMR-400</option>
                        <option value="RG-8X">RG-8X</option>
                        <option value="RG-58">RG-58</option>
                    </select>
                </label>

                <label>Feedline length (ft)
                    <input id="vn-feed-length" type="number" step="5" value="75">
                </label>
            </div>

            <button id="vn-compute" style="margin-top:1rem;">Compute Vertical NVIS</button>

            <div id="vn-summary" class="summary" style="margin-top:1rem;"></div>
        </section>
    `;

    // Inputs
    const freqInput = document.getElementById("vn-freq");
    const heightInput = document.getElementById("vn-height");
    const hatInput = document.getElementById("vn-hat");
    const groundLossInput = document.getElementById("vn-ground-loss");
    const radialCountInput = document.getElementById("vn-radials");
    const radialLengthInput = document.getElementById("vn-radial-length");

    const refEnable = document.getElementById("vn-ref-enable");
    const refWires = document.getElementById("vn-ref-wires");
    const refSpacing = document.getElementById("vn-ref-spacing");
    const refHeight = document.getElementById("vn-ref-height");

    const todInput = document.getElementById("vn-tod");
    const seasideInput = document.getElementById("vn-seaside");
    const groundScreenInput = document.getElementById("vn-groundscreen");
    const elevatedInput = document.getElementById("vn-elevated");

    const feedTypeInput = document.getElementById("vn-feed-type");
    const feedLenInput = document.getElementById("vn-feed-length");

    const summaryDiv = document.getElementById("vn-summary");
    const button = document.getElementById("vn-compute");

    button.addEventListener("click", () => {
        const errors = [];

        const freq = toNumber(freqInput.value);
        const height = toNumber(heightInput.value);
        const hatLen = toNumber(hatInput.value);
        const groundLoss = toNumber(groundLossInput.value);
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
            dxTurbo: false,
            foldoverEnabled: false,
            foldAngleDeg: 0,
            linearLoadingEnabled: false,
            linearLoadingFactor: 0,
            coilEnabled: false,
            coilPosition: "base",
            coilQ: 0,
            hatEnabled: hatLen > 0,
            hatRadiusM: hatLen,
            hatSpokes: hatLen > 0 ? 4 : 0,
            radialCount,
            radialLengthM: radialLength,
            groundLoss
        });

        const baseGain = baseNvisVerticalGain(geom.frac);

        // NVIS reflector
        let reflector = null;
        if (refEnable.checked) {
            reflector = computeNVISReflector({
                freqMHz: freq,
                wires: toNumber(refWires.value),
                spacingM: toNumber(refSpacing.value),
                heightM: toNumber(refHeight.value)
            });
        }

        // Boost
        const boost = BoostEngine.computeBoost({
            reflectorCount: 0,
            directorCount: 0,
            timeOfDay: todInput.value,
            seaside: seasideInput.checked,
            groundScreen: groundScreenInput.checked,
            elevatedRadials: elevatedInput.checked,
            nvisReflector: refEnable.checked,
            feedlineFamily: "coax",
            feedlineType: feedTypeInput.value,
            feedlineLengthFt: toNumber(feedLenInput.value),
            dxTurboPatternBonus: false
        });

        const reflectorGain = reflector?.gainDb ?? 0;
        const reflectorToaShift = reflector?.toaShift ?? 0;

        const totalGain =
            baseGain +
            geom.totalGeomGainDelta +
            boost.totalBoost +
            reflectorGain;

        const finalToa = Math.max(
            60,
            Math.min(90, geom.toa + boost.toaShift + reflectorToaShift)
        );

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

        const reflectorLines = reflector
            ? logNVISReflector(reflector).replace(/\n/g, "<br>")
            : "No NVIS reflector enabled.";

        const transformerHtml = TransformerEngine.getTransformerNote("vertical-nvis", "coax");

        log("Vertical NVIS Designer", {
            freq,
            height,
            hatLen,
            groundLoss,
            radialCount,
            radialLength,
            geom,
            baseGain,
            boost,
            reflector,
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

            <p><strong>Top hat:</strong> ${hatLen.toFixed(1)} m</p>
            <p><strong>Ground loss:</strong> ${groundLoss.toFixed(1)} Ω</p>

            <p><strong>Radial system:</strong> ${radialCount.toFixed(0)} × ${radialLength.toFixed(1)} m</p>

            <p><strong>Base Gain (no boosts):</strong> ${baseGain.toFixed(1)} dBi</p>

            <p><strong>Geometry adjustments:</strong><br>${geomLines}</p>

            <p><strong>Boost breakdown:</strong><br>${boostLines}</p>

            <p><strong>NVIS reflector:</strong><br>${reflectorLines}</p>

            <p><strong>Total estimated gain:</strong> ${totalGain.toFixed(1)} dBi</p>

            <p><strong>Estimated NVIS TOA:</strong> ${finalToa.toFixed(0)}°</p>

            ${transformerHtml}
        `);
    });
}
