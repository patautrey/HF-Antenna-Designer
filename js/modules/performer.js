/* ---------------------------------------------------------
   HF Workbench — Performer Vertical
--------------------------------------------------------- */

import { requireFrequency, requirePositive, toNumber } from "../validators.js";
import { infoBox, warnBox } from "../dom.js";
import { findBand } from "../constants.js";
import { log } from "../log.js";
import { GeometryEngine } from "../engines/geometry-engine.js";
import { BoostEngine } from "../engines/boost-engine.js";
import { TransformerEngine } from "../engines/transformer-engine.js";

function basePerformerGain(frac) {
    if (frac < 0.15) return 0.8;
    if (frac < 0.25) return 1.2;
    return 1.5;
}

export default function initPerformer(root) {
    const container = document.querySelector("#content") || root;
    if (!container) return;

    container.innerHTML = `
        <section class="tool">
            <h2>Performer Vertical</h2>

            <h3>Geometry</h3>
            <div class="field-grid">
                <label>Frequency (MHz)
                    <input id="pf-freq" type="number" step="0.01" value="14.2">
                </label>
                <label>Height (m)
                    <input id="pf-height" type="number" step="0.01" value="5">
                </label>
                <label><input id="pf-dxturbo-height" type="checkbox"> DX Turbo height override (0.70λ)</label>
                <label><input id="pf-fold-enable" type="checkbox"> Foldover enabled</label>
                <label>Foldover angle (deg)
                    <input id="pf-fold-angle" type="number" step="1" value="0">
                </label>
                <label><input id="pf-ll-enable" type="checkbox"> Linear loading enabled</label>
                <label>Linear loading factor (0–0.4)
                    <input id="pf-ll-factor" type="number" step="0.05" value="0">
                </label>
                <label><input id="pf-coil-enable" type="checkbox"> Loading coil enabled</label>
                <label>Coil position
                    <select id="pf-coil-pos">
                        <option value="base">Base</option>
                        <option value="mid">Mid</option>
                        <option value="top">Top</option>
                    </select>
                </label>
                <label>Coil Q
                    <input id="pf-coil-q" type="number" step="10" value="200">
                </label>
                <label><input id="pf-hat-enable" type="checkbox"> Capacitance hat enabled</label>
                <label>Hat radius (m)
                    <input id="pf-hat-radius" type="number" step="0.5" value="0">
                </label>
                <label>Hat spokes
                    <input id="pf-hat-spokes" type="number" step="1" value="0">
                </label>
            </div>

            <h3>Boost</h3>
            <div class="field-grid">
                <label>Reflectors
                    <input id="pf-reflectors" type="number" min="0" max="2" step="1" value="0">
                </label>
                <label>Directors
                    <input id="pf-directors" type="number" min="0" max="3" step="1" value="0">
                </label>
                <label>Time of day
                    <select id="pf-tod">
                        <option value="day">Day</option>
                        <option value="night">Night</option>
                        <option value="dawn">Dawn</option>
                        <option value="dusk">Dusk</option>
                    </select>
                </label>
                <label><input id="pf-seaside" type="checkbox"> Seaside (+10 dB)</label>
                <label><input id="pf-groundscreen" type="checkbox"> Ground Screen / Faraday Cloth</label>
                <label><input id="pf-elevated" type="checkbox"> Elevated Radials</label>
                <label>Feedline type
                    <select id="pf-feed-type">
                        <option value="RG-213">RG-213</option>
                        <option value="LMR-400">LMR-400</option>
                        <option value="RG-8X">RG-8X</option>
                        <option value="RG-58">RG-58</option>
                    </select>
                </label>
                <label>Feedline length (ft)
                    <input id="pf-feed-length" type="number" step="5" value="50">
                </label>
                <label><input id="pf-dxturbo-pattern" type="checkbox"> DX Turbo pattern bonus</label>
            </div>

            <button id="pf-compute" style="margin-top:1rem;">Compute Performer</button>

            <div id="pf-summary" class="summary" style="margin-top:1rem;"></div>
        </section>
    `;

    const freqInput = document.getElementById("pf-freq");
    const heightInput = document.getElementById("pf-height");
    const dxTurboHeightInput = document.getElementById("pf-dxturbo-height");
    const foldEnable = document.getElementById("pf-fold-enable");
    const foldAngle = document.getElementById("pf-fold-angle");
    const llEnable = document.getElementById("pf-ll-enable");
    const llFactor = document.getElementById("pf-ll-factor");
    const coilEnable = document.getElementById("pf-coil-enable");
    const coilPos = document.getElementById("pf-coil-pos");
    const coilQ = document.getElementById("pf-coil-q");
    const hatEnable = document.getElementById("pf-hat-enable");
    const hatRadius = document.getElementById("pf-hat-radius");
    const hatSpokes = document.getElementById("pf-hat-spokes");

    const refInput = document.getElementById("pf-reflectors");
    const dirInput = document.getElementById("pf-directors");
    const todInput = document.getElementById("pf-tod");
    const seasideInput = document.getElementById("pf-seaside");
    const groundScreenInput = document.getElementById("pf-groundscreen");
    const elevatedInput = document.getElementById("pf-elevated");
    const feedTypeInput = document.getElementById("pf-feed-type");
    const feedLenInput = document.getElementById("pf-feed-length");
    const dxTurboPatternInput = document.getElementById("pf-dxturbo-pattern");

    const summaryDiv = document.getElementById("pf-summary");
    const button = document.getElementById("pf-compute");

    button.addEventListener("click", () => {
        const errors = [];

        const freq = toNumber(freqInput.value);
        const height = toNumber(heightInput.value);

        requireFrequency(freq, errors);
        requirePositive(height, "Height", errors);

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

        const baseGain = basePerformerGain(geom.frac);
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

        const transformerHtml = TransformerEngine.getTransformerNote("performer", "coax");

        log("Performer", {
            freq,
            height,
            geom,
            baseGain,
            boost,
            totalGain,
            finalToa
        });

        summaryDiv.innerHTML = infoBox(`
            <p><strong>Design frequency:</strong> ${freq.toFixed(2)} MHz (${band?.label ?? "Unknown band"})</p>
            <p><strong>Electrical height:</strong> ${geom.effectiveHeight.toFixed(2)} m (${(geom.frac * 100).toFixed(1)}% of λ)</p>
            <p><strong>Base Gain:</strong> ${baseGain.toFixed(1)} dBi</p>
            <p><strong>Geometry adjustments:</strong><br>${geomLines}</p>
            <p><strong>Boost Breakdown:</strong><br>${boostLines}</p>
            <p><strong>Total Gain:</strong> ${totalGain.toFixed(1)} dBi</p>
            <p><strong>TOA:</strong> ${finalToa.toFixed(0)}°</p>
            <p><strong>Note:</strong> The telescopic whip can be replaced with antenna wire with identical response.</p>
            ${transformerHtml}
        `);
    });
}
