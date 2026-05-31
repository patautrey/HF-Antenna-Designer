/* ---------------------------------------------------------
   HF Workbench — Sloping Wire (Directional Sloper)
   - Geometry panel
   - Unified boost panel (two-column .boost-grid)
   - Sloping longwire with adjustable angle + height
   - Feedline family + type + length
   - Transformer Requirements (9:1 unun or 49:1 depending on length)
--------------------------------------------------------- */

import { requireFrequency, requirePositive, toNumber } from "../validators.js";
import { infoBox, warnBox } from "../dom.js";
import { findBand } from "../constants.js";
import { log } from "../log.js";
import { GeometryEngine } from "../engines/geometry-engine.js";
import { BoostEngine } from "../engines/boost-engine.js";
import { TransformerEngine } from "../engines/transformer-engine.js";

function baseSlopingWireGain(frac) {
    if (frac < 0.40) return 0.4;
    if (frac < 0.60) return 0.8;
    if (frac < 0.80) return 1.1;
    return 1.4;
}

export default function initSlopingWire(root) {
    const container = document.querySelector("#content") || root;
    if (!container) return;

    container.innerHTML = `
        <section class="tool">
            <h2>Sloping Wire Antenna</h2>

            <h3>Geometry</h3>
            <div class="field-grid">

                <label>Operating frequency (MHz)
                    <input id="sw-freq" type="number" step="0.01" value="7.1">
                </label>

                <label>Wire length (m)
                    <input id="sw-length" type="number" step="0.5" value="30">
                </label>

                <label>High end height (m)
                    <input id="sw-high" type="number" step="0.5" value="12">
                </label>

                <label>Low end height (m)
                    <input id="sw-low" type="number" step="0.5" value="2">
                </label>

                <label>Slope direction
                    <select id="sw-direction">
                        <option value="broadside">Broadside</option>
                        <option value="endfire">End‑fire</option>
                    </select>
                </label>

            </div>

            <h3>Boost</h3>
            <div class="field-grid boost-grid">

                <label>Time of day
                    <select id="sw-tod">
                        <option value="day">Day</option>
                        <option value="night">Night</option>
                        <option value="dawn">Dawn</option>
                        <option value="dusk">Dusk</option>
                    </select>
                </label>

                <label><input id="sw-seaside" type="checkbox"> Seaside (+10 dB)</label>
                <label><input id="sw-groundscreen" type="checkbox"> Ground Screen / Faraday Cloth</label>
                <label><input id="sw-elevated" type="checkbox"> Elevated Supports</label>

                <label>Feedline family
                    <select id="sw-feed-family">
                        <option value="coax">Coax</option>
                        <option value="ladder">Ladder line</option>
                    </select>
                </label>

                <label>Feedline type
                    <select id="sw-feed-type">
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
                    <input id="sw-feed-length" type="number" step="5" value="75">
                </label>

            </div>

            <button id="sw-compute" style="margin-top:1rem;">Compute Sloping Wire</button>

            <div id="sw-summary" class="summary" style="margin-top:1rem;"></div>

        </section>
    `;

    const freqInput = document.getElementById("sw-freq");
    const lengthInput = document.getElementById("sw-length");
    const highInput = document.getElementById("sw-high");
    const lowInput = document.getElementById("sw-low");
    const directionInput = document.getElementById("sw-direction");

    const todInput = document.getElementById("sw-tod");
    const seasideInput = document.getElementById("sw-seaside");
    const groundScreenInput = document.getElementById("sw-groundscreen");
    const elevatedInput = document.getElementById("sw-elevated");

    const feedFamilyInput = document.getElementById("sw-feed-family");
    const feedTypeInput = document.getElementById("sw-feed-type");
    const feedLenInput = document.getElementById("sw-feed-length");

    const summaryDiv = document.getElementById("sw-summary");
    const button = document.getElementById("sw-compute");

    button.addEventListener("click", () => {

        const errors = [];

        const freq = toNumber(freqInput.value);
        const length = toNumber(lengthInput.value);
        const high = toNumber(highInput.value);
        const low = toNumber(lowInput.value);
        const direction = directionInput.value;

        requireFrequency(freq, errors);
        requirePositive(length, "Wire length", errors);
        requirePositive(high, "High end height", errors);
        requirePositive(low, "Low end height", errors);

        if (high <= low) {
            errors.push("High end height must be greater than low end height.");
        }

        if (errors.length) {
            summaryDiv.innerHTML = warnBox(errors.join("<br>"));
            return;
        }

        const band = findBand(freq);

        const avgHeight = (high + low) / 2;

        const geom = GeometryEngine.computeGeometry({
            freqMHz: freq,
            heightM: avgHeight,
            spanM: length
        });

        const baseGain = baseSlopingWireGain(geom.frac);

        const feedFamily = feedFamilyInput.value === "ladder" ? "ladder" : "coax";

        const boost = BoostEngine.computeBoost({
            reflectorCount: direction === "endfire" ? 1 : 0,
            directorCount: direction === "endfire" ? 1 : 0,
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

        const finalToa =
            direction === "endfire"
                ? Math.max(10, Math.min(45, geom.toa + boost.toaShift))
                : Math.max(20, Math.min(70, geom.toa + boost.toaShift));

        const geomLines = [
            `Wire length: ${length.toFixed(1)} m`,
            `High end height: ${high.toFixed(1)} m`,
            `Low end height: ${low.toFixed(1)} m`,
            `Average height: ${avgHeight.toFixed(1)} m`,
            `Slope direction: ${direction}`,
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

        const transformerHtml = TransformerEngine.getTransformerNote("slopingWire", feedFamily);

        log("SlopingWire", {
            freq,
            length,
            high,
            low,
            avgHeight,
            direction,
            geom,
            baseGain,
            boost,
            totalGain,
            finalToa
        });

        summaryDiv.innerHTML = infoBox(`
            <p><strong>Operating frequency:</strong> ${freq.toFixed(2)} MHz (${band?.label ?? "Unknown band"})</p>

            <p><strong>Base Sloping Wire Gain:</strong> ${baseGain.toFixed(1)} dBi</p>

            <p><strong>Geometry details:</strong><br>${geomLines}</p>

            <p><strong>Boost breakdown:</strong><br>${boostLines}</p>

            <p><strong>Total estimated gain:</strong> ${totalGain.toFixed(1)} dBi</p>

            <p><strong>Estimated TOA:</strong> ${finalToa.toFixed(0)}°</p>

            ${transformerHtml}
        `);
    });
}
