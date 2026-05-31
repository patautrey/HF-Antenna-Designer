/* ---------------------------------------------------------
   HF Workbench — Hexbeam (Broadband 2‑element wire beam)
   - Geometry panel
   - Unified boost panel (two-column .boost-grid)
   - Driven element length + reflector length + spreader radius
   - Height + wire spacing + hub-to-tip geometry
   - Feedline family + type + length
   - Transformer Requirements (1:1 choke recommended)
--------------------------------------------------------- */

import { requireFrequency, requirePositive, toNumber } from "../validators.js";
import { infoBox, warnBox } from "../dom.js";
import { findBand } from "../constants.js";
import { log } from "../log.js";
import { GeometryEngine } from "../engines/geometry-engine.js";
import { BoostEngine } from "../engines/boost-engine.js";
import { TransformerEngine } from "../engines/transformer-engine.js";

function baseHexbeamGain(frac) {
    // Hexbeam gain is similar to a 2‑element Yagi but slightly lower
    if (frac < 0.40) return 4.2;
    if (frac < 0.60) return 4.9;
    if (frac < 0.80) return 5.4;
    return 5.8;
}

export default function initHexbeam(root) {
    const container = document.querySelector("#content") || root;
    if (!container) return;

    container.innerHTML = `
        <section class="tool">
            <h2>Hexbeam</h2>

            <h3>Geometry</h3>
            <div class="field-grid">

                <label>Operating frequency (MHz)
                    <input id="hx-freq" type="number" step="0.01" value="14.2">
                </label>

                <label>Driven element total wire length (m)
                    <input id="hx-driven" type="number" step="0.1" value="11.2">
                </label>

                <label>Reflector total wire length (m)
                    <input id="hx-refl" type="number" step="0.1" value="12.0">
                </label>

                <label>Spreader radius (m)
                    <input id="hx-radius" type="number" step="0.1" value="2.7">
                </label>

                <label>Wire spacing (m)
                    <input id="hx-spacing" type="number" step="0.01" value="0.25">
                </label>

                <label>Height above ground (m)
                    <input id="hx-height" type="number" step="0.1" value="10">
                </label>

            </div>

            <h3>Boost</h3>
            <div class="field-grid boost-grid">

                <label>Time of day
                    <select id="hx-tod">
                        <option value="day">Day</option>
                        <option value="night">Night</option>
                        <option value="dawn">Dawn</option>
                        <option value="dusk">Dusk</option>
                    </select>
                </label>

                <label><input id="hx-seaside" type="checkbox"> Seaside (+10 dB)</label>
                <label><input id="hx-groundscreen" type="checkbox"> Ground Screen / Faraday Cloth</label>
                <label><input id="hx-elevated" type="checkbox"> Elevated Supports</label>

                <label>Feedline family
                    <select id="hx-feed-family">
                        <option value="coax">Coax</option>
                        <option value="ladder">Ladder line</option>
                    </select>
                </label>

                <label>Feedline type
                    <select id="hx-feed-type">
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
                    <input id="hx-feed-length" type="number" step="5" value="75">
                </label>

            </div>

            <button id="hx-compute" style="margin-top:1rem;">Compute Hexbeam</button>

            <div id="hx-summary" class="summary" style="margin-top:1rem;"></div>

        </section>
    `;

    const freqInput = document.getElementById("hx-freq");
    const drivenInput = document.getElementById("hx-driven");
    const reflInput = document.getElementById("hx-refl");
    const radiusInput = document.getElementById("hx-radius");
    const spacingInput = document.getElementById("hx-spacing");
    const heightInput = document.getElementById("hx-height");

    const todInput = document.getElementById("hx-tod");
    const seasideInput = document.getElementById("hx-seaside");
    const groundScreenInput = document.getElementById("hx-groundscreen");
    const elevatedInput = document.getElementById("hx-elevated");

    const feedFamilyInput = document.getElementById("hx-feed-family");
    const feedTypeInput = document.getElementById("hx-feed-type");
    const feedLenInput = document.getElementById("hx-feed-length");

    const summaryDiv = document.getElementById("hx-summary");
    const button = document.getElementById("hx-compute");

    button.addEventListener("click", () => {

        const errors = [];

        const freq = toNumber(freqInput.value);
        const driven = toNumber(drivenInput.value);
        const refl = toNumber(reflInput.value);
        const radius = toNumber(radiusInput.value);
        const spacing = toNumber(spacingInput.value);
        const height = toNumber(heightInput.value);

        requireFrequency(freq, errors);
        requirePositive(driven, "Driven element length", errors);
        requirePositive(refl, "Reflector length", errors);
        requirePositive(radius, "Spreader radius", errors);
        requirePositive(spacing, "Wire spacing", errors);
        requirePositive(height, "Height", errors);

        if (refl <= driven) errors.push("Reflector must be longer than driven element.");
        if (radius < 1.5 || radius > 4.0) errors.push("Spreader radius must be between 1.5 m and 4 m.");

        if (errors.length) {
            summaryDiv.innerHTML = warnBox(errors.join("<br>"));
            return;
        }

        const band = findBand(freq);

        const geom = GeometryEngine.computeGeometry({
            freqMHz: freq,
            heightM: height,
            spanM: driven
        });

        const baseGain = baseHexbeamGain(geom.frac);

        const feedFamily = feedFamilyInput.value === "ladder" ? "ladder" : "coax";

        const boost = BoostEngine.computeBoost({
            reflectorCount: 1,
            directorCount: 0,
            timeOfDay: todInput.value,
            seaside: seasideInput.checked,
            groundScreen: groundScreenInput.checked,
            elevatedRadials: elevatedInput.checked,
            nvisReflector: false,
            feedlineFamily: feedFamily,
            feedlineType: feedTypeInput.value,
            feedlineLengthFt: toNumber(feedLenInput.value),
            dxTurboPatternBonus: true
        });

        const totalGain = baseGain + geom.totalGeomGainDelta + boost.totalBoost;

        const finalToa = Math.max(10, Math.min(32, geom.toa + boost.toaShift));

        const geomLines = [
            `Driven element: ${driven.toFixed(1)} m`,
            `Reflector: ${refl.toFixed(1)} m`,
            `Spreader radius: ${radius.toFixed(1)} m`,
            `Wire spacing: ${spacing.toFixed(2)} m`,
            `Height: ${height.toFixed(1)} m`,
            `Hexbeam provides excellent F/B ratio and compact footprint.`,
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

        const transformerHtml = TransformerEngine.getTransformerNote("hexbeam", feedFamily);

        log("Hexbeam", {
            freq,
            driven,
            refl,
            radius,
            spacing,
            height,
            geom,
            baseGain,
            boost,
            totalGain,
            finalToa
        });

        summaryDiv.innerHTML = infoBox(`
            <p><strong>Operating frequency:</strong> ${freq.toFixed(2)} MHz (${band?.label ?? "Unknown band"})</p>

            <p><strong>Base Hexbeam Gain:</strong> ${baseGain.toFixed(1)} dBi</p>

            <p><strong>Geometry details:</strong><br>${geomLines}</p>

            <p><strong>Boost breakdown:</strong><br>${boostLines}</p>

            <p><strong>Total estimated gain:</strong> ${totalGain.toFixed(1)} dBi</p>

            <p><strong>Estimated TOA:</strong> ${finalToa.toFixed(0)}°</p>

            ${transformerHtml}
        `);
    });
}
