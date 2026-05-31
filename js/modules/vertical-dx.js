/* ---------------------------------------------------------
   HF Workbench — Vertical DX
--------------------------------------------------------- */

import { requireFrequency, requirePositive, toNumber } from "../validators.js";
import { infoBox, warnBox } from "../dom.js";
import { findBand } from "../constants.js";
import { log } from "../log.js";
import { GeometryEngine } from "../engines/geometry-engine.js";
import { BoostEngine } from "../engines/boost-engine.js";
import { TransformerEngine } from "../engines/transformer-engine.js";

function baseVerticalDXGain(frac) {
    if (frac < 0.25) return 1.5;
    if (frac < 0.5) return 2.2;
    if (frac < 0.75) return 2.8;
    return 3.0;
}

export default function initVerticalDX(root) {
    const container = document.querySelector("#content") || root;
    if (!container) return;

    container.innerHTML = `
        <section class="tool">
            <h2>Vertical DX Designer</h2>

            <h3>Geometry</h3>
            <div class="field-grid">
                <label>Frequency (MHz)
                    <input id="vdx-freq" type="number" step="0.01" value="14.2">
                </label>
                <label>Height (m)
                    <input id="vdx-height" type="number" step="0.1" value="10">
                </label>
                <label><input id="vdx-dxturbo-height" type="checkbox"> DX Turbo height override (0.70λ)</label>
                <label><input id="vdx-fold-enable" type="checkbox"> Foldover enabled</label>
                <label>Foldover angle (deg)
                    <input id="vdx-fold-angle" type="number" step="1" value="0">
                </label>
                <label><input id="vdx-ll-enable" type="checkbox"> Linear loading enabled</label>
                <label>Linear loading factor (0–0.4)
                    <input id="vdx-ll-factor" type="number" step="0.05" value="0">
                </label>
                <label><input id="vdx-coil-enable" type="checkbox"> Loading coil enabled</label>
                <label>Coil position
                    <select id="vdx-coil-pos">
                        <option value="base">Base</option>
                        <option value="mid">Mid</option>
                        <option value="top">Top</option>
                    </select>
                </label>
                <label>Coil Q
                    <input id="vdx-coil-q" type="number" step="10" value="200">
                </label>
                <label><input id="vdx-hat-enable" type="checkbox"> Capacitance hat enabled</label>
                <label>Hat radius (m)
                    <input id="vdx-hat-radius" type="number" step="0.5" value="0">
                </label>
                <label>Hat spokes
                    <input id="vdx-hat-spokes" type="number" step="1" value="0">
                </label>
            </div>

            <h3>Boost</h3>
            <div class="field-grid boost-grid">
                <label>Reflectors
                    <input id="vdx-reflectors" type="number" min="0" max="2" step="1" value="0">
                </label>
                <label>Directors
                    <input id="vdx-directors" type="number" min="0" max="3" step="1" value="0">
                </label>
                <label>Time of day
                    <select id="vdx-tod">
                        <option value="day">Day</option>
                        <option value="night">Night</option>
                        <option value="dawn">Dawn</option>
                        <option value="dusk">Dusk</option>
                    </select>
                </label>
                <label><input id="vdx-seaside" type="checkbox"> Seaside (+10 dB)</label>
                <label><input id="vdx-groundscreen" type="checkbox"> Ground Screen / Faraday Cloth</label>
                <label><input id="vdx-elevated" type="checkbox"> Elevated Radials</label>
                <label>Feedline type
                    <select id="vdx-feed-type">
                        <option value="RG-213">RG-213</option>
                        <option value="LMR-400">LMR-400</option>
                        <option value="RG-8X">RG-8X</option>
                        <option value="RG-58">RG-58</option>
                    </select>
                </label>
                <label>Feedline length (ft)
                    <input id="vdx-feed-length" type="number" step="5" value="75">
                </label>
                <label><input id="vdx-dxturbo-pattern" type="checkbox"> DX Turbo pattern bonus</label>
            </div>

            <button id="vdx-compute" style="margin-top:1rem;">Compute Vertical DX</button>

            <div id="vdx-summary" class="summary" style="margin-top:1rem;"></div>
        </section>
    `;

    const freqInput = document.getElementById("vdx-freq");
    const heightInput = document.getElementById("vdx-height");
    const dxTurboHeightInput = document.getElementById("vdx-dxturbo-height");
    const foldEnable = document.getElementById("vdx-fold-enable");
    const foldAngle = document.getElementById("vdx-fold-angle");
    const llEnable = document.getElementById("vdx-ll-enable");
    const llFactor = document.getElementById("vdx-ll-factor");
    const coilEnable = document.getElementById("vdx-coil-enable");
    const coilPos = document.getElementById("vdx-coil-pos");
    const coilQ = document.getElementById("vdx-coil-q");
    const hatEnable = document.getElementById("vdx-hat-enable");
    const hatRadius = document.getElementById("vdx-hat-radius");
    const hatSpokes = document.getElementById("vdx-hat-spokes");

    const refInput = document.getElementById("vdx-reflectors");
    const dirInput = document.getElementById("vdx-directors");
    const todInput = document.getElementById("vdx-tod");
    const seasideInput = document.getElementById("vdx-seaside");
    const groundScreenInput = document.getElementById("vdx-groundscreen");
    const elevatedInput = document.getElementById("vdx-elevated");
    const feedTypeInput = document.getElementById("vdx-feed-type");
    const feedLenInput = document.getElementById("vdx-feed-length");
    const dxTurboPatternInput = document.getElementById("vdx-dxturbo-pattern");

    const summaryDiv = document.getElementById("vdx-summary");
    const button = document.getElementById("vdx-compute");

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

        const baseGain = baseVerticalDXGain(geom.frac);

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

        const transformerHtml = TransformerEngine.getTransformerNote("verticalDX", "coax");

        log("VerticalDX", {
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
            <p><strong>Base DX Gain:</strong> ${baseGain.toFixed(1)} dBi</p>
            <p><strong>Geometry adjustments:</strong><br>${geomLines}</p>
            <p><strong>Boost Breakdown:</strong><br>${boostLines}</p>
            <p><strong>Total DX Gain:</strong> ${totalGain.toFixed(1)} dBi</p>
            <p><strong>Estimated TOA:</strong> ${finalToa.toFixed(0)}°</p>
            ${transformerHtml}
        `);
    });
}
