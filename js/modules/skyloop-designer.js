/* --------------------------------------------------------------
   Antenna Workbench — Skyloop Designer (Workbench Edition)
   Full-wave horizontal loop with NVIS reflector support
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

import { wavelength, round } from "../utils.js";

/* --------------------------------------------------------------
   BASE GAIN MODEL FOR SKYLOOP
-------------------------------------------------------------- */
function baseSkyloopGain(frac) {
    if (frac < 0.80) return 1.5;     // slightly short loop
    if (frac < 1.10) return 2.2;     // near full-wave
    if (frac < 1.40) return 2.6;     // slightly long
    return 3.0;                      // long loop
}

export default function initSkyloopDesigner(root) {
    const container = document.querySelector("#content") || root;
    if (!container) return;

    container.innerHTML = `
        <section class="tool">
            <h2>Skyloop Designer</h2>

            <h3>Geometry</h3>
            <div class="field-grid">
                <label>Frequency (MHz)
                    <input id="sl-freq" type="number" step="0.01" value="3.55">
                </label>

                <label>Loop perimeter (m)
                    <input id="sl-perimeter" type="number" step="1" value="284">
                </label>

                <label>Height (m)
                    <input id="sl-height" type="number" step="0.5" value="5">
                </label>
            </div>

            <h3>NVIS Reflector (Optional)</h3>
            <div class="field-grid">
                <label><input id="sl-ref-enable" type="checkbox"> Enable NVIS reflector</label>

                <label>Reflector wires
                    <input id="sl-ref-wires" type="number" step="1" value="0">
                </label>

                <label>Reflector spacing (m)
                    <input id="sl-ref-spacing" type="number" step="0.5" value="0">
                </label>

                <label>Reflector height (m)
                    <input id="sl-ref-height" type="number" step="0.5" value="0">
                </label>
            </div>

            <h3>Boost</h3>
            <div class="field-grid boost-grid">
                <label>Time of day
                    <select id="sl-tod">
                        <option value="day">Day</option>
                        <option value="night">Night</option>
                        <option value="dawn">Dawn</option>
                        <option value="dusk">Dusk</option>
                    </select>
                </label>

                <label><input id="sl-seaside" type="checkbox"> Seaside (+10 dB)</label>
                <label><input id="sl-groundscreen" type="checkbox"> Ground screen</label>

                <label>Feedline type
                    <select id="sl-feed-type">
                        <option value="450">450Ω ladder line</option>
                        <option value="300">300Ω twinlead</option>
                        <option value="600">600Ω open wire</option>
                    </select>
                </label>

                <label>Feedline length (ft)
                    <input id="sl-feed-length" type="number" step="5" value="75">
                </label>
            </div>

            <button id="sl-compute" style="margin-top:1rem;">Compute Skyloop</button>

            <div id="sl-summary" class="summary" style="margin-top:1rem;"></div>
        </section>
    `;

    // Inputs
    const freqInput = document.getElementById("sl-freq");
    const perimeterInput = document.getElementById("sl-perimeter");
    const heightInput = document.getElementById("sl-height");

    const refEnable = document.getElementById("sl-ref-enable");
    const refWires = document.getElementById("sl-ref-wires");
    const refSpacing = document.getElementById("sl-ref-spacing");
    const refHeight = document.getElementById("sl-ref-height");

    const todInput = document.getElementById("sl-tod");
    const seasideInput = document.getElementById("sl-seaside");
    const groundScreenInput = document.getElementById("sl-groundscreen");

    const feedTypeInput = document.getElementById("sl-feed-type");
    const feedLenInput = document.getElementById("sl-feed-length");

    const summaryDiv = document.getElementById("sl-summary");
    const button = document.getElementById("sl-compute");

    button.addEventListener("click", () => {
        const errors = [];

        const freq = toNumber(freqInput.value);
        const perimeter = toNumber(perimeterInput.value);
        const height = toNumber(heightInput.value);

        requireFrequency(freq, errors);
        requirePositive(perimeter, "Loop perimeter", errors);
        requirePositive(height, "Height", errors);

        if (errors.length) {
            summaryDiv.innerHTML = warnBox(errors.join("<br>"));
            return;
        }

        const band = findBand(freq);
        const lambda = wavelength(freq);
        const frac = perimeter / lambda;

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
            hatEnabled: false,
            hatRadiusM: 0,
            hatSpokes: 0
        });

        const baseGain = baseSkyloopGain(frac);

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
            elevatedRadials: false,
            nvisReflector: refEnable.checked,
            feedlineFamily: "ladder",
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

        const transformerHtml = TransformerEngine.getTransformerNote("skyloop", "ladder");

        log("Skyloop Designer", {
            freq,
            perimeter,
            height,
            geom,
            baseGain,
            boost,
            reflector,
            totalGain,
            finalToa
        });

        summaryDiv.innerHTML = infoBox(`
            <p><strong>Design frequency:</strong> ${freq.toFixed(2)} MHz (${band?.label ?? "Unknown band"})</p>

            <p><strong>Loop perimeter:</strong> ${perimeter.toFixed(1)} m</p>
            <p><strong>Electrical length:</strong> ${(frac * 100).toFixed(1)}% of λ</p>

            <p><strong>Height:</strong> ${height.toFixed(1)} m</p>

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
