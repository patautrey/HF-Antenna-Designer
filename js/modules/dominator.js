/* ---------------------------------------------------------
   HF Workbench — Dominator Array
--------------------------------------------------------- */

import { requireFrequency, requirePositive, toNumber } from "../validators.js";
import { infoBox, warnBox } from "../dom.js";
import { findBand } from "../constants.js";
import { log } from "../log.js";
import { GeometryEngine } from "../engines/geometry-engine.js";
import { BoostEngine } from "../engines/boost-engine.js";
import { TransformerEngine } from "../engines/transformer-engine.js";

function baseArrayGain(frac, spacingM, lambda) {
    const spacingFrac = spacingM / lambda;
    let gain = 2.6 + spacingFrac * 1.2;
    if (frac > 0.25) gain += 0.3;
    return gain;
}

export default function initDominator(root) {
    const container = document.querySelector("#content") || root;
    if (!container) return;

    container.innerHTML = `
        <section class="tool">
            <h2>Dominator Vertical Array</h2>

            <h3>Geometry</h3>
            <div class="field-grid">
                <label>Frequency (MHz)
                    <input id="dm-freq" type="number" step="0.01" value="14.2">
                </label>
                <label>Element height (m)
                    <input id="dm-height" type="number" step="0.01" value="5">
                </label>
                <label>Element spacing (m)
                    <input id="dm-spacing" type="number" step="0.01" value="6">
                </label>
                <label><input id="dm-dxturbo-height" type="checkbox"> DX Turbo height override (0.70λ)</label>
                <label><input id="dm-fold-enable" type="checkbox"> Foldover enabled</label>
                <label>Foldover angle (deg)
                    <input id="dm-fold-angle" type="number" step="1" value="0">
                </label>
                <label><input id="dm-ll-enable" type="checkbox"> Linear loading enabled</label>
                <label>Linear loading factor (0–0.4)
                    <input id="dm-ll-factor" type="number" step="0.05" value="0">
                </label>
                <label><input id="dm-coil-enable" type="checkbox"> Loading coil enabled</label>
                <label>Coil position
                    <select id="dm-coil-pos">
                        <option value="base">Base</option>
                        <option value="mid">Mid</option>
                        <option value="top">Top</option>
                    </select>
                </label>
                <label>Coil Q
                    <input id="dm-coil-q" type="number" step="10" value="200">
                </label>
                <label><input id="dm-hat-enable" type="checkbox"> Capacitance hat enabled</label>
                <label>Hat radius (m)
                    <input id="dm-hat-radius" type="number" step="0.5" value="0">
                </label>
                <label>Hat spokes
                    <input id="dm-hat-spokes" type="number" step="1" value="0">
                </label>
            </div>

            <h3>Boost</h3>
            <div class="field-grid">
                <label>Reflectors
                    <input id="dm-reflectors" type="number" min="0" max="2" step="1" value="1">
                </label>
                <label>Directors
                    <input id="dm-directors" type="number" min="0" max="3" step="1" value="1">
                </label>
                <label>Time of day
                    <select id="dm-tod">
                        <option value="day">Day</option>
                        <option value="night">Night</option>
                        <option value="dawn">Dawn</option>
                        <option value="dusk">Dusk</option>
                    </select>
                </label>
                <label><input id="dm-seaside" type="checkbox"> Seaside (+10 dB)</label>
                <label><input id="dm-groundscreen" type="checkbox"> Ground Screen / Faraday Cloth</label>
                <label><input id="dm-elevated" type="checkbox"> Elevated Radials</label>
                <label>Feedline type
                    <select id="dm-feed-type">
                        <option value="RG-213">RG-213</option>
                        <option value="LMR-400">LMR-400</option>
                        <option value="RG-8X">RG-8X</option>
                        <option value="RG-58">RG-58</option>
                    </select>
                </label>
                <label>Feedline length (ft)
                    <input id="dm-feed-length" type="number" step="5" value="75">
                </label>
                <label><input id="dm-dxturbo-pattern" type="checkbox"> DX Turbo pattern bonus</label>
            </div>

            <button id="dm-compute" style="margin-top:1rem;">Compute Dominator</button>

            <div id="dm-summary" class="summary" style="margin-top:1rem;"></div>
        </section>
    `;

    const freqInput = document.getElementById("dm-freq");
    const heightInput = document.getElementById("dm-height");
    const spacingInput = document.getElementById("dm-spacing");
    const dxTurboHeightInput = document.getElementById("dm-dxturbo-height");
    const foldEnable = document.getElementById("dm-fold-enable");
    const foldAngle = document.getElementById("dm-fold-angle");
    const llEnable = document.getElementById("dm-ll-enable");
    const llFactor = document.getElementById("dm-ll-factor");
    const coilEnable = document.getElementById("dm-coil-enable");
    const coilPos = document.getElementById("dm-coil-pos");
    const coilQ = document.getElementById("dm-coil-q");
    const hatEnable = document.getElementById("dm-hat-enable");
    const hatRadius = document.getElementById("dm-hat-radius");
    const hatSpokes = document.getElementById("dm-hat-spokes");

    const refInput = document.getElementById("dm-reflectors");
    const dirInput = document.getElementById("dm-directors");
    const todInput = document.getElementById("dm-tod");
    const seasideInput = document.getElementById("dm-seaside");
    const groundScreenInput = document.getElementById("dm-groundscreen");
    const elevatedInput = document.getElementById("dm-elevated");
    const feedTypeInput = document.getElementById("dm-feed-type");
    const feedLenInput = document.getElementById("dm-feed-length");
    const dxTurboPatternInput = document.getElementById("dm-dxturbo-pattern");

    const summaryDiv = document.getElementById("dm-summary");
    const button = document.getElementById("dm-compute");

    button.addEventListener("click", () => {
        const errors = [];

        const freq = toNumber(freqInput.value);
        const height = toNumber(heightInput.value);
        const spacing = toNumber(spacingInput.value);

        requireFrequency(freq, errors);
        requirePositive(height, "Element height", errors);
        requirePositive(spacing, "Element spacing", errors);

        if (errors.length) {
            summaryDiv.innerHTML = warnBox(errors.join("<br>"));
            return;
        }

        const band = findBand(freq);

        const geom = GeometryEngine.computeGeometry({
            freqMHz: freq,
            heightM: height,
            dxTurbo: dxTurboHeightInput.checked,
            foldoverEnabled: foldEnable.checked,
            foldAngleDeg: toNumber(foldAngle.value),
            linearLoadingEnabled: llEnable.checked,
            linearLoadingFactor: toNumber(llFactor.value),
            coilEnabled: coilEnable.checked,
            coilPosition: coilPos.value,
            coilQ: toNumber(coilQ.value),
            hatEnabled: hatEnable.checked,
            hatRadiusM: toNumber(hatRadius.value),
            hatSpokes: toNumber(hatSpokes.value)
        });

        const lambda = 300 / freq;
        const baseGain = baseArrayGain(geom.frac, spacing, lambda);

        const boost = BoostEngine.computeBoost({
            reflectorCount: toNumber(refInput.value),
            directorCount: toNumber(dirInput.value),
            timeOfDay: todInput.value,
            seaside: seasideInput.checked,
            groundScreen: groundScreenInput.checked,
            elevatedRadials: elevatedInput.checked,
            nvisReflector: false,
            feedlineFamily: "coax",
            feedlineType: feedTypeInput.value,
            feedlineLengthFt: toNumber(feedLenInput.value),
            dxTurboPatternBonus: dxTurboPatternInput.checked
        });

        const totalGain = baseGain + geom.totalGeomGainDelta + boost.totalBoost;
        const finalToa = Math.max(10, Math.min(80, geom.toa + boost.toaShift));

        const geomLines = geom.components.length
            ? geom.components.map(c => c.note ?? "").join("<br>")
            : "No additional geometry modifiers.";

        const boostLines = boost.components.length
            ? boost.components.map(d => {
                const parts = [];
                if (d.boost) parts.push(`${d.boost.toFixed(1)} dB from ${d.label}`);
                else parts.push(d.label);
                if (d.toaShift) parts.push(`TOA shift ${d.toaShift > 0 ? "+" : ""}${d.toaShift}°`);
                return parts.join(" — ");
            }).join("<br>")
            : "No boost options enabled.";

        const transformerHtml = TransformerEngine.getTransformerNote("dominator", "coax");

        log("Dominator", {
            freq,
            height,
            spacing,
            geom,
            baseGain,
            boost,
            totalGain,
            finalToa
        });

        summaryDiv.innerHTML = infoBox(`
            <p><strong>Design frequency:</strong> ${freq.toFixed(2)} MHz (${band?.label ?? "Unknown band"})</p>
            <p><strong>Element height (electrical):</strong> ${geom.effectiveHeight.toFixed(2)} m (${(geom.frac * 100).toFixed(1)}% of λ)</p>
            <p><strong>Element spacing:</strong> ${spacing.toFixed(2)} m</p>
            <p><strong>Array Base Gain:</strong> ${baseGain.toFixed(1)} dBi</p>
            <p><strong>Geometry adjustments:</strong><br>${geomLines}</p>
            <p><strong>Boost Breakdown:</strong><br>${boostLines}</p>
            <p><strong>Total Gain:</strong> ${totalGain.toFixed(1)} dBi</p>
            <p><strong>TOA:</strong> ${finalToa.toFixed(0)}°</p>
            <p><strong>Note:</strong> The telescopic whip can be replaced with antenna wire with identical response.</p>
            ${transformerHtml}
        `);
    });
}
