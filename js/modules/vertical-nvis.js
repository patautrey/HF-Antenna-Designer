/* ---------------------------------------------------------
   HF Workbench — Vertical NVIS
--------------------------------------------------------- */

import { requireFrequency, requirePositive, toNumber } from "../validators.js";
import { infoBox, warnBox } from "../dom.js";
import { findBand } from "../constants.js";
import { log } from "../log.js";
import { GeometryEngine } from "../engines/geometry-engine.js";
import { BoostEngine } from "../engines/boost-engine.js";
import { TransformerEngine } from "../engines/transformer-engine.js";

function baseNVISGain(frac) {
    if (frac < 0.1) return -0.5;
    if (frac < 0.2) return 0.0;
    return 0.5;
}

export default function initVerticalNVIS(root) {
    const container = document.querySelector("#content") || root;
    if (!container) return;

    container.innerHTML = `
        <section class="tool">
            <h2>Vertical NVIS</h2>

            <h3>Geometry</h3>
            <div class="field-grid">
                <label>Frequency (MHz)
                    <input id="vn-freq" type="number" step="0.01" value="5.3">
                </label>
                <label>Height (m)
                    <input id="vn-height" type="number" step="0.01" value="4">
                </label>
                <label><input id="vn-dxturbo-height" type="checkbox"> DX Turbo height override (0.70λ)</label>
                <label><input id="vn-fold-enable" type="checkbox"> Foldover enabled</label>
                <label>Foldover angle (deg)
                    <input id="vn-fold-angle" type="number" step="1" value="0">
                </label>
                <label><input id="vn-ll-enable" type="checkbox"> Linear loading enabled</label>
                <label>Linear loading factor (0–0.4)
                    <input id="vn-ll-factor" type="number" step="0.05" value="0">
                </label>
                <label><input id="vn-coil-enable" type="checkbox"> Loading coil enabled</label>
                <label>Coil position
                    <select id="vn-coil-pos">
                        <option value="base">Base</option>
                        <option value="mid">Mid</option>
                        <option value="top">Top</option>
                    </select>
                </label>
                <label>Coil Q
                    <input id="vn-coil-q" type="number" step="10" value="200">
                </label>
                <label><input id="vn-hat-enable" type="checkbox"> Capacitance hat enabled</label>
                <label>Hat radius (m)
                    <input id="vn-hat-radius" type="number" step="0.5" value="0">
                </label>
                <label>Hat spokes
                    <input id="vn-hat-spokes" type="number" step="1" value="0">
                </label>
            </div>

            <h3>Boost</h3>
            <div class="field-grid">
                <label>Reflectors
                    <input id="vn-reflectors" type="number" min="0" max="2" step="1" value="0">
                </label>
                <label>Directors
                    <input id="vn-directors" type="number" min="0" max="3" step="1" value="0">
                </label>
                <label>Time of day
                    <select id="vn-tod">
                        <option value="day">Day</option>
                        <option value="night">Night</option>
                        <option value="dawn">Dawn</option>
                        <option value="dusk">Dusk</option>
                    </select>
                </label>
                <label><input id="vn-seaside" type="checkbox"> Seaside (+10 dB)</label>
                <label><input id="vn-groundscreen" type="checkbox"> Ground Screen / Faraday Cloth</label>
                <label><input id="vn-elevated" type="checkbox"> Elevated Radials</label>
                <label><input id="vn-nvis-reflector" type="checkbox"> NVIS Reflector</label>
                <label>Feedline family
                    <select id="vn-feed-family">
                        <option value="coax">Coax</option>
                        <option value="ladder">Ladder line</option>
                    </select>
                </label>
                <label>Feedline type
                    <select id="vn-feed-type">
                        <option value="RG-213">RG-213 / 450Ω</option>
                        <option value="LMR-400">LMR-400</option>
                        <option value="RG-8X">RG-8X</option>
                        <option value="RG-58">RG-58</option>
                        <option value="450Ω">450Ω</option>
                        <option value="300Ω">300Ω</option>
                        <option value="600Ω">600Ω</option>
                    </select>
                </label>
                <label>Feedline length (ft)
                    <input id="vn-feed-length" type="number" step="5" value="75">
                </label>
                <label><input id="vn-dxturbo-pattern" type="checkbox"> DX Turbo pattern bonus</label>
            </div>

            <button id="vn-compute" style="margin-top:1rem;">Compute Vertical NVIS</button>

            <div id="vn-summary" class="summary" style="margin-top:1rem;"></div>
        </section>
    `;

    const freqInput = document.getElementById("vn-freq");
    const heightInput = document.getElementById("vn-height");
    const dxTurboHeightInput = document.getElementById("vn-dxturbo-height");
    const foldEnable = document.getElementById("vn-fold-enable");
    const foldAngle = document.getElementById("vn-fold-angle");
    const llEnable = document.getElementById("vn-ll-enable");
    const llFactor = document.getElementById("vn-ll-factor");
    const coilEnable = document.getElementById("vn-coil-enable");
    const coilPos = document.getElementById("vn-coil-pos");
    const coilQ = document.getElementById("vn-coil-q");
    const hatEnable = document.getElementById("vn-hat-enable");
    const hatRadius = document.getElementById("vn-hat-radius");
    const hatSpokes = document.getElementById("vn-hat-spokes");

    const refInput = document.getElementById("vn-reflectors");
    const dirInput = document.getElementById("vn-directors");
    const todInput = document.getElementById("vn-tod");
    const seasideInput = document.getElementById("vn-seaside");
    const groundScreenInput = document.getElementById("vn-groundscreen");
    const elevatedInput = document.getElementById("vn-elevated");
    const nvisReflInput = document.getElementById("vn-nvis-reflector");
    const feedFamilyInput = document.getElementById("vn-feed-family");
    const feedTypeInput = document.getElementById("vn-feed-type");
    const feedLenInput = document.getElementById("vn-feed-length");
    const dxTurboPatternInput = document.getElementById("vn-dxturbo-pattern");

    const summaryDiv = document.getElementById("vn-summary");
    const button = document.getElementById("vn-compute");

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

        const baseGain = baseNVISGain(geom.frac);

        const feedFamily = feedFamilyInput.value === "ladder" ? "ladder" : "coax";

        const boost = BoostEngine.computeBoost({
            reflectorCount: toNumber(refInput.value),
            directorCount: toNumber(dirInput.value),
            timeOfDay: todInput.value,
            seaside: seasideInput.checked,
            groundScreen: groundScreenInput.checked,
            elevatedRadials: elevatedInput.checked,
            nvisReflector: nvisReflInput.checked,
            feedlineFamily: feedFamily,
            feedlineType: feedTypeInput.value,
            feedlineLengthFt: toNumber(feedLenInput.value),
            dxTurboPatternBonus: dxTurboPatternInput.checked
        });

        const totalGain = baseGain + geom.totalGeomGainDelta + boost.totalBoost;
        const finalToa = Math.max(20, Math.min(90, geom.toa + boost.toaShift + 10)); // bias higher for NVIS

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

        const transformerHtml = TransformerEngine.getTransformerNote("verticalNVIS", feedFamily);

        log("VerticalNVIS", {
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
            <p><strong>Base NVIS Gain (overhead):</strong> ${baseGain.toFixed(1)} dBi</p>
            <p><strong>Geometry adjustments:</strong><br>${geomLines}</p>
            <p><strong>Boost Breakdown:</strong><br>${boostLines}</p>
            <p><strong>Total NVIS Gain:</strong> ${totalGain.toFixed(1)} dBi</p>
            <p><strong>Effective TOA (NVIS focus):</strong> ${finalToa.toFixed(0)}°</p>
            ${transformerHtml}
        `);
    });
}
