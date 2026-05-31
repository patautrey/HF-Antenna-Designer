/* ---------------------------------------------------------
   HF Workbench — Marconi‑T Antenna (Top‑Loaded Vertical T)
   - Geometry panel
   - Unified boost panel (two-column .boost-grid)
   - Vertical radiator + horizontal top‑hat arms
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

function baseMarconiTGain(frac) {
    if (frac < 0.40) return 1.0;
    if (frac < 0.60) return 1.5;
    if (frac < 0.80) return 1.9;
    return 2.2;
}

export default function initMarconiT(root) {
    const container = document.querySelector("#content") || root;
    if (!container) return;

    container.innerHTML = `
        <section class="tool">
            <h2>Marconi‑T Antenna</h2>

            <h3>Geometry</h3>
            <div class="field-grid">

                <label>Frequency (MHz)
                    <input id="mt-freq" type="number" step="0.01" value="3.8">
                </label>

                <label>Vertical radiator length (m)
                    <input id="mt-vert" type="number" step="0.1" value="12">
                </label>

                <label>Top‑hat arm length (each side, m)
                    <input id="mt-arm" type="number" step="0.1" value="15">
                </label>

                <label>Base height (m)
                    <input id="mt-height" type="number" step="0.5" value="2">
                </label>

            </div>

            <h3>Boost</h3>
            <div class="field-grid boost-grid">

                <label>Time of day
                    <select id="mt-tod">
                        <option value="day">Day</option>
                        <option value="night">Night</option>
                        <option value="dawn">Dawn</option>
                        <option value="dusk">Dusk</option>
                    </select>
                </label>

                <label><input id="mt-seaside" type="checkbox"> Seaside (+10 dB)</label>
                <label><input id="mt-groundscreen" type="checkbox"> Ground Screen / Faraday Cloth</label>
                <label><input id="mt-elevated" type="checkbox"> Elevated Base / Supports</label>

                <label>Feedline family
                    <select id="mt-feed-family">
                        <option value="coax">Coax</option>
                        <option value="ladder">Ladder line</option>
                    </select>
                </label>

                <label>Feedline type
                    <select id="mt-feed-type">
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
                    <input id="mt-feed-length" type="number" step="5" value="75">
                </label>

            </div>

            <button id="mt-compute" style="margin-top:1rem;">Compute Marconi‑T</button>

            <div id="mt-summary" class="summary" style="margin-top:1rem;"></div>

        </section>
    `;

    const freqInput = document.getElementById("mt-freq");
    const vertInput = document.getElementById("mt-vert");
    const armInput = document.getElementById("mt-arm");
    const heightInput = document.getElementById("mt-height");

    const todInput = document.getElementById("mt-tod");
    const seasideInput = document.getElementById("mt-seaside");
    const groundScreenInput = document.getElementById("mt-groundscreen");
    const elevatedInput = document.getElementById("mt-elevated");

    const feedFamilyInput = document.getElementById("mt-feed-family");
    const feedTypeInput = document.getElementById("mt-feed-type");
    const feedLenInput = document.getElementById("mt-feed-length");

    const summaryDiv = document.getElementById("mt-summary");
    const button = document.getElementById("mt-compute");

    button.addEventListener("click", () => {

        const errors = [];

        const freq = toNumber(freqInput.value);
        const vert = toNumber(vertInput.value);
        const arm = toNumber(armInput.value);
        const height = toNumber(heightInput.value);

        requireFrequency(freq, errors);
        requirePositive(vert, "Vertical radiator length", errors);
        requirePositive(arm, "Top‑hat arm length", errors);
        requirePositive(height, "Base height", errors);

        if (errors.length) {
            summaryDiv.innerHTML = warnBox(errors.join("<br>"));
            return;
        }

        const band = findBand(freq);

        const effectiveSpan = vert + (arm * 2);

        const geom = GeometryEngine.computeGeometry({
            freqMHz: freq,
            heightM: height,
            spanM: effectiveSpan
        });

        const baseGain = baseMarconiTGain(geom.frac);

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
        const finalToa = Math.max(18, Math.min(70, geom.toa + boost.toaShift));

        const geomLines = [
            `Vertical radiator: ${vert.toFixed(2)} m`,
            `Top‑hat arms: ${arm.toFixed(2)} m each`,
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

        const transformerHtml = TransformerEngine.getTransformerNote("marconiT", feedFamily);

        log("MarconiT", {
            freq,
            vert,
            arm,
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

            <p><strong>Base Marconi‑T Gain:</strong> ${baseGain.toFixed(1)} dBi</p>

            <p><strong>Geometry details:</strong><br>${geomLines}</p>

