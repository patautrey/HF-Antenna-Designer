/* ---------------------------------------------------------
   HF Workbench — Dominator Vertical Array
   Updated with:
   - Full geometry panel
   - Full unified boost panel (two-column .boost-grid)
   - DX Turbo height override
   - DX Turbo pattern bonus
   - Transformer Requirements section
   - Whip/Wire equivalence note
--------------------------------------------------------- */

import { requireFrequency, requirePositive, toNumber } from "../validators.js";
import { infoBox, warnBox } from "../dom.js";
import { findBand } from "../constants.js";
import { log } from "../log.js";
import { GeometryEngine } from "../engines/geometry-engine.js";
import { BoostEngine } from "../engines/boost-engine.js";
import { TransformerEngine } from "../engines/transformer-engine.js";

function baseDominatorGain(frac) {
    if (frac < 0.25) return 2.0;
    if (frac < 0.50) return 2.7;
    if (frac < 0.75) return 3.2;
    return 3.5;
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
                    <input id="dom-freq" type="number" step="0.01" value="14.2">
                </label>
                <label>Element height (m)
                    <input id="dom-height" type="number" step="0.1" value="5">
                </label>
                <label>Element spacing (m)
                    <input id="dom-spacing" type="number" step="0.1" value="6">
                </label>

                <label><input id="dom-dxturbo-height" type="checkbox"> DX Turbo height override (0.70λ)</label>

                <label><input id="dom-fold-enable" type="checkbox"> Foldover enabled</label>
                <label>Foldover angle (deg)
                    <input id="dom-fold-angle" type="number" step="1" value="0">
                </label>

                <label><input id="dom-ll-enable" type="checkbox"> Linear loading enabled</label>
                <label>Linear loading factor (0–0.4)
                    <input id="dom-ll-factor" type="number" step="0.05" value="0">
                </label>

                <label><input id="dom-coil-enable" type="checkbox"> Loading coil enabled</label>
                <label>Coil position
                    <select id="dom-coil-pos">
                        <option value="base">Base</option>
                        <option value="mid">Mid</option>
                        <option value="top">Top</option>
                    </select>
                </label>
                <label>Coil Q
                    <input id="dom-coil-q" type="number" step="10" value="200">
                </label>

                <label><input id="dom-hat-enable" type="checkbox"> Capacitance hat enabled</label>
                <label>Hat radius (m)
                    <input id="dom-hat-radius" type="number" step="0.5" value="0">
                </label>
                <label>Hat spokes
                    <input id="dom-hat-spokes" type="number" step="1" value="0">
                </label>
            </div>

            <h3>Boost</h3>
            <div class="field-grid boost-grid">
                <label>Reflectors
                    <input id="dom-reflectors" type="number" min="0" max="2" step="1" value="1">
                </label>

                <label>Directors
                    <input id="dom-directors" type="number" min="0" max="3" step="1" value="1">
                </label>

                <label>Time of day
                    <select id="dom-tod">
                        <option value="day">Day</option>
                        <option value="night">Night</option>
                        <option value="dawn">Dawn</option>
                        <option value="dusk">Dusk</option>
                    </select>
                </label>

                <label><input id="dom-seaside" type="checkbox"> Seaside (+10 dB)</label>
                <label><input id="dom-groundscreen" type="checkbox"> Ground Screen / Faraday Cloth</label>
                <label><input id="dom-elevated" type="checkbox"> Elevated Radials</label>

                <label>Feedline type
                    <select id="dom-feed-type">
                        <option value="RG-213">RG-213</option>
                        <option value="LMR-400">LMR-400</option>
                        <option value="RG-8X">RG-8X</option>
                        <option value="RG-58">RG-58</option>
                    </select>
                </label>

                <label>Feedline length (ft)
                    <input id="dom-feed-length" type="number" step="5" value="75">
                </label>

                <label><input id="dom-dxturbo-pattern" type="checkbox"> DX Turbo pattern bonus</label>
            </div>

            <button id="dom-compute" style="margin-top:1rem;">Compute Dominator</button>

            <div id="dom-summary" class="summary" style="margin-top:1rem;"></div>
        </section>
    `;

    const freqInput = document.getElementById("dom-freq");
    const heightInput = document.getElementById("dom-height");
    const spacingInput = document.getElementById("dom-spacing");
    const dxTurboHeightInput = document.getElementById("dom-dxturbo-height");

    const foldEnable = document.getElementById("dom-fold-enable");
    const foldAngle = document.getElementById("dom-fold-angle");

    const llEnable = document.getElementById("dom-ll-enable");
    const llFactor = document.getElementById("dom-ll-factor");

    const coilEnable = document.getElementById("dom-coil-enable");
    const coilPos = document.getElementById("dom-coil-pos");
    const coilQ = document.getElementById("dom-coil-q");

    const hatEnable = document.getElementById("dom-hat-enable");
    const hatRadius = document.getElementById("dom-hat-radius");
    const hatSpokes = document.getElementById("dom-hat-spokes");

    const refInput = document.getElementById("dom-reflectors");
    const dirInput = document.getElementById("dom-directors");
    const todInput = document.getElementById("dom-tod");
    const seasideInput = document.getElementById("dom-seaside");
    const groundScreenInput = document.getElementById("dom-groundscreen");
    const elevatedInput = document.getElementById("dom-elevated");

    const feedTypeInput = document.getElementById("dom-feed-type");
    const feedLenInput = document.getElementById("dom-feed-length");

    const dxTurboPatternInput = document.getElementById("dom-dxturbo-pattern");

    const summaryDiv = document.getElementById("dom-summary");
    const button = document.getElementById("dom-compute");

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
            hatSpokes: toNumber(hatSpokes.value),
            elementSpacingM: spacing
        });

        const baseGain = baseDominatorGain(geom.frac);

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

            <p><strong>Element height:</strong> 
                ${geom.effectiveHeight.toFixed(2)} m 
                (${(geom.frac * 100).toFixed(1)}% of λ)
            </p>

            <p><strong>Element spacing:</strong> ${spacing.toFixed(2)} m</p>

            <p><strong>Base Array Gain:</strong> ${baseGain.toFixed(1)} dBi</p>

            <p><strong>Geometry adjustments:</strong><br>${geomLines}</p>

            <p><strong>Boost Breakdown:</strong><br>${boostLines}</p>

            <p><strong>Total Array Gain:</strong> ${totalGain.toFixed(1)} dBi</p>

            <p><strong>Estimated TOA:</strong> ${finalToa.toFixed(0)}°</p>

            <p><strong>Note:</strong> The telescopic whips can be replaced with antenna wire elements with identical response.</p>

            ${transformerHtml}
        `);
    });
}
