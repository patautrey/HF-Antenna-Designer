/* ---------------------------------------------------------
   HF Workbench — Bobtail Curtain
   (Three 1/4-wave verticals in phase for strong low-angle DX)
   - Geometry panel
   - Unified boost panel (two-column .boost-grid)
   - Vertical height + spacing + wire diameter + configuration
   - Feedline family + type + length
   - Transformer Requirements (1:1 choke recommended; phasing harness required)
--------------------------------------------------------- */

import { requireFrequency, requirePositive, toNumber } from "../validators.js";
import { infoBox, warnBox } from "../dom.js";
import { findBand } from "../constants.js";
import { log } from "../log.js";
import { GeometryEngine } from "../engines/geometry-engine.js";
import { BoostEngine } from "../engines/boost-engine.js";
import { TransformerEngine } from "../engines/transformer-engine.js";

function baseBobtailGain(frac, spacing) {
    // Bobtail Curtain gain increases with proper spacing (≈0.5 λ)
    let base = 3.0; // baseline vertical gain
    if (spacing < 0.35) base += 1.0;
    else if (spacing < 0.45) base += 2.2;
    else if (spacing < 0.55) base += 3.0;
    else base += 2.5;
    return base;
}

export default function initBobtailCurtain(root) {
    const container = document.querySelector("#content") || root;
    if (!container) return;

    container.innerHTML = `
        <section class="tool">
            <h2>Bobtail Curtain</h2>

            <h3>Geometry</h3>
            <div class="field-grid">

                <label>Operating frequency (MHz)
                    <input id="bt-freq" type="number" step="0.01" value="7.1">
                </label>

                <label>Vertical height (m)
                    <input id="bt-height" type="number" step="0.1" value="10">
                </label>

                <label>Element spacing (m)
                    <input id="bt-spacing" type="number" step="0.1" value="20">
                </label>

                <label>Wire diameter (mm)
                    <input id="bt-wire" type="number" step="0.1" value="2">
                </label>

                <label>Configuration
                    <select id="bt-config">
                        <option value="vertical">Vertical</option>
                        <option value="sloper">Sloper</option>
                        <option value="tilted">Tilted</option>
                    </select>
                </label>

            </div>

            <h3>Boost</h3>
            <div class="field-grid boost-grid">

                <label>Time of day
                    <select id="bt-tod">
                        <option value="day">Day</option>
                        <option value="night">Night</option>
                        <option value="dawn">Dawn</option>
                        <option value="dusk">Dusk</option>
                    </select>
                </label>

                <label><input id="bt-seaside" type="checkbox"> Seaside (+10 dB)</label>
                <label><input id="bt-groundscreen" type="checkbox"> Ground Screen / Faraday Cloth</label>
                <label><input id="bt-elevated" type="checkbox"> Elevated Supports</label>

                <label>Feedline family
                    <select id="bt-feed-family">
                        <option value="coax">Coax</option>
                        <option value="ladder">Ladder line</option>
                    </select>
                </label>

                <label>Feedline type
                    <select id="bt-feed-type">
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
                    <input id="bt-feed-length" type="number" step="5" value="75">
                </label>

            </div>

            <button id="bt-compute" style="margin-top:1rem;">Compute Bobtail Curtain</button>

            <div id="bt-summary" class="summary" style="margin-top:1rem;"></div>

        </section>
    `;

    const freqInput = document.getElementById("bt-freq");
    const heightInput = document.getElementById("bt-height");
    const spacingInput = document.getElementById("bt-spacing");
    const wireInput = document.getElementById("bt-wire");
    const configInput = document.getElementById("bt-config");

    const todInput = document.getElementById("bt-tod");
    const seasideInput = document.getElementById("bt-seaside");
    const groundScreenInput = document.getElementById("bt-groundscreen");
    const elevatedInput = document.getElementById("bt-elevated");

    const feedFamilyInput = document.getElementById("bt-feed-family");
    const feedTypeInput = document.getElementById("bt-feed-type");
    const feedLenInput = document.getElementById("bt-feed-length");

    const summaryDiv = document.getElementById("bt-summary");
    const button = document.getElementById("bt-compute");

    button.addEventListener("click", () => {

        const errors = [];

        const freq = toNumber(freqInput.value);
        const height = toNumber(heightInput.value);
        const spacing = toNumber(spacingInput.value);
        const wire = toNumber(wireInput.value);
        const config = configInput.value;

        requireFrequency(freq, errors);
        requirePositive(height, "Vertical height", errors);
        requirePositive(spacing, "Element spacing", errors);
        requirePositive(wire, "Wire diameter", errors);

        if (errors.length) {
            summaryDiv.innerHTML = warnBox(errors.join("<br>"));
            return;
        }

        const band = findBand(freq);

        const spacingWL = spacing / (300 / freq);
        const avgHeight = height / 2;

        const geom = GeometryEngine.computeGeometry({
            freqMHz: freq,
            heightM: avgHeight,
            spanM: height
        });

        const baseGain = baseBobtailGain(geom.frac, spacingWL);

        const feedFamily = feedFamilyInput.value === "ladder" ? "ladder" : "coax";

        const boost = BoostEngine.computeBoost({
            reflectorCount: 1,
            directorCount: 1,
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

        let toaBase = 12;
        if (config === "sloper") toaBase = 18;
        if (config === "tilted") toaBase = 15;

        const finalToa = Math.max(6, Math.min(28, toaBase + (boost.toaShift || 0)));

        const geomLines = [
            `Vertical height: ${height.toFixed(1)} m`,
            `Element spacing: ${spacing.toFixed(1)} m (${spacingWL.toFixed(2)} λ)`,
            `Wire diameter: ${wire.toFixed(1)} mm`,
            `Configuration: ${config}`,
            `Bobtail Curtain produces very strong low-angle DX radiation.`,
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

        const transformerHtml = TransformerEngine.getTransformerNote("bobtailCurtain", feedFamily);

        log("BobtailCurtain", {
            freq,
            height,
            spacing,
            spacingWL,
            wire,
            config,
            avgHeight,
            geom,
            baseGain,
            boost,
            totalGain,
            finalToa
        });

        summaryDiv.innerHTML = infoBox(`
            <p><strong>Operating frequency:</strong> ${freq.toFixed(2)} MHz (${band?.label ?? "Unknown band"})</p>

            <p><strong>Base Bobtail Curtain Gain:</strong> ${baseGain.toFixed(1)} dBi</p>

            <p><strong>Geometry details:</strong><br>${geomLines}</p>

            <p><strong>Boost breakdown:</strong><br>${boostLines}</p>

            <p><strong>Total estimated gain:</strong> ${totalGain.toFixed(1)} dBi</p>

            <p><strong>Estimated TOA:</strong> ${finalToa.toFixed(0)}°</p>

            ${transformerHtml}
        `);
    });
}
