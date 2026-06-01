/* ---------------------------------------------------------------------------
   Antenna Workbench — Doublet Designer (Workbench Edition)
   Full Workbench‑style module
   - GeometryEngine
   - BoostEngine
   - TransformerEngine
   - NVIS Reflector Engine
   - Unified boost panel
   - Summary box
   - Logging
--------------------------------------------------------------------------- */

import { requireFrequency, requirePositive, toNumber } from "../validators.js";
import { infoBox, warnBox } from "../dom.js";
import { findBand } from "../constants.js";
import { log } from "../log.js";

import { GeometryEngine } from "../engines/geometry-engine.js";
import { BoostEngine } from "../engines/boost-engine.js";
import { TransformerEngine } from "../engines/transformer-engine.js";
import { computeNVISReflector, logNVISReflector } from "../engines/nvis-reflector.js";

import { wavelength, round } from "../utils.js";

/* ---------------------------------------------------------------------------
   BASE GAIN MODEL FOR DOUBLET
--------------------------------------------------------------------------- */
function baseDoubletGain(frac) {
    if (frac < 0.40) return 1.0;     // short doublet
    if (frac < 0.60) return 1.8;     // near half-wave
    if (frac < 0.80) return 2.2;     // slightly long
    return 2.6;                      // long doublet
}

export default function initDoubletDesigner(root) {
    const container = document.querySelector("#content") || root;
    if (!container) return;

    container.innerHTML = `
        <section class="tool">
            <h2>Doublet Designer</h2>

            <h3>Geometry</h3>
            <div class="field-grid">
                <label>Frequency (MHz)
                    <input id="db-freq" type="number" step="0.01" value="7.1">
                </label>

                <label>Total wire length (m)
                    <input id="db-length" type="number" step="0.5" value="40">
                </label>

                <label>Height (m)
                    <input id="db-height" type="number" step="0.5" value="10">
                </label>

                <label>Feedline type
                    <select id="db-feed-type">
                        <option value="450">450Ω ladder line</option>
                        <option value="300">300Ω twinlead</option>
                        <option value="600">600Ω open wire</option>
                    </select>
                </label>

                <label>Feedline length (ft)
                    <input id="db-feed-length" type="number" step="5" value="75">
                </label>
            </div>

            <h3>NVIS Reflector (Optional)</h3>
            <div class="field-grid">
                <label><input id="db-ref-enable" type="checkbox"> Enable NVIS reflector</label>

                <label>Reflector wires
                    <input id="db-ref-wires" type="number" step="1" value="0">
                </label>

                <label>Reflector spacing (m)
                    <input id="db-ref-spacing" type="number" step="0.5" value="0">
                </label>

                <label>Reflector height (m)
                    <input id="db-ref-height" type="number" step="0.5" value="0">
                </label>
            </div>

            <h3>Boost</h3>
            <div class="field-grid boost-grid">
                <label>Time of day
                    <select id="db-tod">
                        <option value="day">Day</option>
                        <option value="night">Night</option>
                        <option value="dawn">Dawn</option>
                        <option value="dusk">Dusk</option>
                    </select>
                </label>

                <label><input id="db-seaside" type="checkbox"> Seaside (+10 dB)</label>
                <label><input id="db-groundscreen" type="checkbox"> Ground screen</label>

                <label>Coax jumper type
                    <select id="db-coax-type">
                        <option value="RG-213">RG-213</option>
                        <option value="LMR-400">LMR-400</option>
                        <option value="RG-8X">RG-8X</option>
                        <option value="RG-58">RG-58</option>
                    </select>
                </label>

                <label>Coax jumper length (ft)
                    <input id="db-coax-length" type="number" step="5" value="10">
                </label>
            </div>

            <button id="db-compute" style="margin-top:1rem;">Compute Doublet</button>

            <div id="db-summary" class="summary" style="margin-top:1rem;"></div>
        </section>
    `;

    // Inputs
    const freqInput = document.getElementById("db-freq");
    const lengthInput = document.getElementById("db-length");
    const heightInput = document.getElementById("db-height");

    const feedTypeInput = document.getElementById("db-feed-type");
    const feedLenInput = document.getElementById("db-feed-length");

    const refEnable = document.getElementById("db-ref-enable");
    const refWires = document.getElementById("db-ref-wires");
    const refSpacing = document.getElementById("db-ref-spacing");
    const refHeight = document.getElementById("db-ref-height");

    const todInput = document.getElementById("db-tod");
    const seasideInput = document.getElementById("db-seaside");
    const groundScreenInput = document.getElementById("db-groundscreen");

    const coaxTypeInput = document.getElementById("db-coax-type");
    const coaxLenInput = document.getElementById("db-coax-length");

    const summaryDiv = document.getElementById("db-summary");
    const button = document.getElementById("db-compute");

    button.addEventListener("click", () => {
        const errors = [];

        const freq = toNumber(freqInput.value);
        const totalLength = toNumber(lengthInput.value);
        const height = toNumber(heightInput.value);

        requireFrequency(freq, errors);
        requirePositive(totalLength, "Total wire length", errors);
        requirePositive(height, "Height", errors);

        if (errors.length) {
            summaryDiv.innerHTML = warnBox(errors.join("<br>"));
            return;
        }

        const band = findBand(freq);
        const lambda = wavelength(freq);
        const frac = totalLength / lambda;

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

        const baseGain = baseDoubletGain(frac);

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
            dxTurboPatternBonus: false,
            coaxJumperType: coaxTypeInput.value,
            coaxJumperLengthFt: toNumber(coaxLenInput.value)
        });

        const reflectorGain = reflector?.gainDb ?? 0;
        const reflectorToaShift = reflector?.toaShift ?? 0;

        const totalGain =
            baseGain +
            geom.totalGeomGainDelta +
            boost.totalBoost +
            reflectorGain;

        const finalToa = Math.max(
            40,
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

        const transformerHtml = TransformerEngine.getTransformerNote("doublet", "ladder");

        log("Doublet Designer", {
            freq,
            totalLength,
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

            <p><strong>Total wire length:</strong> ${totalLength.toFixed(1)} m</p>
            <p><strong>Electrical length:</strong> ${(frac * 100).toFixed(1)}% of λ</p>

            <p><strong>Height:</strong> ${height.toFixed(1)} m</p>

            <p><strong>Base Gain (no boosts):</strong> ${baseGain.toFixed(1)} dBi</p>

            <p><strong>Geometry adjustments:</strong><br>${geomLines}</p>

            <p><strong>Boost breakdown:</strong><br>${boostLines}</p>

            <p><strong>NVIS reflector:</strong><br>${reflectorLines}</p>

            <p><strong>Total estimated gain:</strong> ${totalGain.toFixed(1)} dBi</p>

            <p><strong>Estimated TOA:</strong> ${finalToa.toFixed(0)}°</p>

            ${transformerHtml}
        `);
    });
}
