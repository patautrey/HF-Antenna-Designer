/* ---------------------------------------------------------
   HF Workbench — NVIS Designer
   High-level NVIS planning tool using Vertical NVIS model.
--------------------------------------------------------- */

import { requireFrequency, toNumber } from "../validators.js";
import { infoBox, warnBox } from "../dom.js";
import { findBand } from "../constants.js";
import { log } from "../log.js";
import { GeometryEngine } from "../engines/geometry-engine.js";
import { BoostEngine } from "../engines/boost-engine.js";
import { TransformerEngine } from "../engines/transformer-engine.js";

export default function initNVISDesigner(root) {
    const container = document.querySelector("#content") || root;
    if (!container) return;

    container.innerHTML = `
        <section class="tool">
            <h2>NVIS Designer</h2>

            <div class="field-grid">
                <label>Frequency (MHz)
                    <input id="nd-freq" type="number" step="0.01" value="5.3">
                </label>
                <label>Target coverage radius (km)
                    <input id="nd-radius" type="number" step="10" value="300">
                </label>
                <label>Available mast height (m)
                    <input id="nd-height" type="number" step="0.5" value="4">
                </label>
                <label>Time of day
                    <select id="nd-tod">
                        <option value="day">Day</option>
                        <option value="night">Night</option>
                        <option value="dawn">Dawn</option>
                        <option value="dusk">Dusk</option>
                    </select>
                </label>
                <label>Feedline family
                    <select id="nd-feed-family">
                        <option value="coax">Coax</option>
                        <option value="ladder">Ladder line</option>
                    </select>
                </label>
                <label>Feedline length (ft)
                    <input id="nd-feed-length" type="number" step="5" value="75">
                </label>
            </div>

            <button id="nd-compute" style="margin-top:1rem;">Design NVIS System</button>

            <div id="nd-summary" class="summary" style="margin-top:1rem;"></div>
        </section>
    `;

    const freqInput = document.getElementById("nd-freq");
    const radiusInput = document.getElementById("nd-radius");
    const heightInput = document.getElementById("nd-height");
    const todInput = document.getElementById("nd-tod");
    const feedFamilyInput = document.getElementById("nd-feed-family");
    const feedLenInput = document.getElementById("nd-feed-length");

    const summaryDiv = document.getElementById("nd-summary");
    const button = document.getElementById("nd-compute");

    button.addEventListener("click", () => {
        const errors = [];

        const freq = toNumber(freqInput.value);
        const radius = toNumber(radiusInput.value);
        const height = toNumber(heightInput.value);

        requireFrequency(freq, errors);
        if (radius <= 0) errors.push("Coverage radius must be positive.");
        if (height <= 0) errors.push("Mast height must be positive.");

        if (errors.length) {
            summaryDiv.innerHTML = warnBox(errors.join("<br>"));
            return;
        }

        const band = findBand(freq);

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
            coilQ: 200,
            hatEnabled: false,
            hatRadiusM: 0,
            hatSpokes: 0
        });

        const baseGain = 0.0; // conceptual NVIS baseline

        const feedFamily = feedFamilyInput.value === "ladder" ? "ladder" : "coax";

        const boost = BoostEngine.computeBoost({
            reflectorCount: 0,
            directorCount: 0,
            timeOfDay: todInput.value,
            seaside: false,
            groundScreen: false,
            elevatedRadials: false,
            nvisReflector: true,
            feedlineFamily: feedFamily,
            feedlineType: feedFamily === "ladder" ? "450Ω" : "RG-213",
            feedlineLengthFt: toNumber(feedLenInput.value),
            dxTurboPatternBonus: false
        });

        const totalGain = baseGain + geom.totalGeomGainDelta + boost.totalBoost;
        const finalToa = Math.max(30, Math.min(90, geom.toa + boost.toaShift + 10));

        const transformerHtml = TransformerEngine.getTransformerNote("verticalNVIS", feedFamily);

        const nvisScore = (finalToa / 90) * 10 + totalGain; // simple heuristic

        log("NVISDesigner", {
            freq,
            radius,
            height,
            geom,
            boost,
            totalGain,
            finalToa,
            nvisScore
        });

        summaryDiv.innerHTML = infoBox(`
            <p><strong>Design frequency:</strong> ${freq.toFixed(2)} MHz (${band?.label ?? "Unknown band"})</p>
            <p><strong>Target NVIS radius:</strong> ${radius.toFixed(0)} km</p>
            <p><strong>Mast height:</strong> ${height.toFixed(1)} m (${(geom.frac * 100).toFixed(1)}% of λ)</p>
            <p><strong>Estimated NVIS gain (overhead):</strong> ${totalGain.toFixed(1)} dBi</p>
            <p><strong>Estimated NVIS TOA:</strong> ${finalToa.toFixed(0)}°</p>
            <p><strong>NVIS score (higher is better):</strong> ${nvisScore.toFixed(1)}</p>
            ${transformerHtml}
        `);
    });
}
