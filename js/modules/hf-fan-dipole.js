/* ---------------------------------------------------------
   HF Workbench — Fan Dipole (Multiband Dipole with Shared Feedpoint)
   - Geometry panel
   - Unified boost panel (two-column .boost-grid)
   - Multiple dipole legs (lengths + heights)
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

function baseFanDipoleGain(frac) {
    // Fan dipole behaves like a dipole on each band
    if (frac < 0.40) return 1.9;
    if (frac < 0.60) return 2.3;
    if (frac < 0.80) return 2.6;
    return 2.9;
}

export default function initFanDipole(root) {
    const container = document.querySelector("#content") || root;
    if (!container) return;

    container.innerHTML = `
        <section class="tool">
            <h2>Fan Dipole (Multiband)</h2>

            <h3>Geometry</h3>
            <div class="field-grid">

                <label>Operating frequency (MHz)
                    <input id="fd-freq" type="number" step="0.01" value="7.1">
                </label>

                <label>Leg 1 length (m)
                    <input id="fd-leg1" type="number" step="0.1" value="20">
                </label>

                <label>Leg 2 length (m)
                    <input id="fd-leg2" type="number" step="0.1" value="10">
                </label>

                <label>Leg 3 length (m)
                    <input id="fd-leg3" type="number" step="0.1" value="6.5">
                </label>

                <label>Center height (m)
                    <input id="fd-height" type="number" step="0.1" value="10">
                </label>

                <label>End height (m)
                    <input id="fd-endheight" type="number" step="0.1" value="6">
                </label>

                <label>Configuration
                    <select id="fd-config">
                        <option value="flat">Flat / horizontal</option>
                        <option value="invertedV">Inverted‑V</option>
                        <option value="sloper">Sloper</option>
                    </select>
                </label>

            </div>

            <h3>Boost</h3>
            <div class="field-grid boost-grid">

                <label>Time of day
                    <select id="fd-tod">
                        <option value="day">Day</option>
                        <option value="night">Night</option>
                        <option value="dawn">Dawn</option>
                        <option value="dusk">Dusk</option>
                    </select>
                </label>

                <label><input id="fd-seaside" type="checkbox"> Seaside (+10 dB)</label>
                <label><input id="fd-groundscreen" type="checkbox"> Ground Screen / Faraday Cloth</label>
                <label><input id="fd-elevated" type="checkbox"> Elevated Supports</label>

                <label>Feedline family
                    <select id="fd-feed-family">
                        <option value="coax">Coax</option>
                        <option value="ladder">Ladder line</option>
                    </select>
                </label>

                <label>Feedline type
                    <select id="fd-feed-type">
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
                    <input id="fd-feed-length" type="number" step="5" value="75">
                </label>

            </div>

            <button id="fd-compute" style="margin-top:1rem;">Compute Fan Dipole</button>

            <div id="fd-summary" class="summary" style="margin-top:1rem;"></div>

        </section>
    `;

    const freqInput = document.getElementById("fd-freq");
    const leg1Input = document.getElementById("fd-leg1");
    const leg2Input = document.getElementById("fd-leg2");
    const leg3Input = document.getElementById("fd-leg3");
    const heightInput = document.getElementById("fd-height");
    const endHeightInput = document.getElementById("fd-endheight");
    const configInput = document.getElementById("fd-config");

    const todInput = document.getElementById("fd-tod");
    const seasideInput = document.getElementById("fd-seaside");
    const groundScreenInput = document.getElementById("fd-groundscreen");
    const elevatedInput = document.getElementById("fd-elevated");

    const feedFamilyInput = document.getElementById("fd-feed-family");
    const feedTypeInput = document.getElementById("fd-feed-type");
    const feedLenInput = document.getElementById("fd-feed-length");

    const summaryDiv = document.getElementById("fd-summary");
    const button = document.getElementById("fd-compute");

    button.addEventListener("click", () => {

        const errors = [];

        const freq = toNumber(freqInput.value);
        const leg1 = toNumber(leg1Input.value);
        const leg2 = toNumber(leg2Input.value);
        const leg3 = toNumber(leg3Input.value);
        const height = toNumber(heightInput.value);
        const endHeight = toNumber(endHeightInput.value);
        const config = configInput.value;

        requireFrequency(freq, errors);
        requirePositive(leg1, "Leg 1 length", errors);
        requirePositive(leg2, "Leg 2 length", errors);
        requirePositive(leg3, "Leg 3 length", errors);
        requirePositive(height, "Center height", errors);
        requirePositive(endHeight, "End height", errors);

        if (errors.length) {
            summaryDiv.innerHTML = warnBox(errors.join("<br>"));
            return;
        }

        const band = findBand(freq);
        const longestLeg = Math.max(leg1, leg2, leg3);
        const avgHeight = (height + endHeight) / 2;

        const geom = GeometryEngine.computeGeometry({
            freqMHz: freq,
            heightM: avgHeight,
            spanM: longestLeg * 2
        });

        const baseGain = baseFanDipoleGain(geom.frac);

        const feedFamily = feedFamilyInput.value === "ladder" ? "ladder" : "coax";

        const boost = BoostEngine.computeBoost({
            reflectorCount: 0,
            directorCount: 0,
            timeOfDay: todInput.value,
            seaside: seasideInput.checked,
            groundScreen: groundScreenInput.checked,
            elevatedRadials: elevatedInput.checked,
            nvisReflector: config === "flat",
            feedlineFamily: feedFamily,
            feedlineType: feedTypeInput.value,
            feedlineLengthFt: toNumber(feedLenInput.value),
            dxTurboPatternBonus: false
        });

        const totalGain = baseGain + geom.totalGeomGainDelta + boost.totalBoost;

        let toaBase = 35;
        if (config === "invertedV") toaBase = 45;
        if (config === "sloper") toaBase = 28;

        const finalToa = Math.max(20, Math.min(80, toaBase + (boost.toaShift || 0)));

        const geomLines = [
            `Leg 1: ${leg1.toFixed(1)} m`,
            `Leg 2: ${leg2.toFixed(1)} m`,
            `Leg 3: ${leg3.toFixed(1)} m`,
            `Center height: ${height.toFixed(1)} m`,
            `End height: ${endHeight.toFixed(1)} m`,
            `Configuration: ${config}`,
            `Average height: ${avgHeight.toFixed(1)} m`,
            `Longest leg determines primary band: ${longestLeg.toFixed(1)} m`,
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

        const transformerHtml = TransformerEngine.getTransformerNote("fanDipole", feedFamily);

        log("FanDipole", {
            freq,
            leg1,
            leg2,
            leg3,
            height,
            endHeight,
            config,
            longestLeg,
            avgHeight,
            geom,
            baseGain,
            boost,
            totalGain,
            finalToa
        });

        summaryDiv.innerHTML = infoBox(`
            <p><strong>Operating frequency:</strong> ${freq.toFixed(2)} MHz (${band?.label ?? "Unknown band"})</p>

            <p><strong>Base Fan Dipole Gain:</strong> ${baseGain.toFixed(1)} dBi</p>

            <p><strong>Geometry details:</strong><br>${geomLines}</p>

            <p><strong>Boost breakdown:</strong><br>${boostLines}</p>

            <p><strong>Total estimated gain:</strong> ${totalGain.toFixed(1)} dBi</p>

            <p><strong>Estimated TOA:</strong> ${finalToa.toFixed(0)}°</p>

            ${transformerHtml}
        `);
    });
}
