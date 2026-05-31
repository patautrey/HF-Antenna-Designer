/* ---------------------------------------------------------
   HF Workbench — Advanced NVIS Sloping Longwire
   (Enhanced NVIS model with dual‑reflector logic + height shaping)
   - Geometry panel
   - Unified boost panel (two-column .boost-grid)
   - Length + slope + height shaping + dual NVIS reflectors
   - Feedline family + type + length
   - Transformer Requirements (9:1 unun or 49:1 EFHW depending on length)
--------------------------------------------------------- */

import { requireFrequency, requirePositive, toNumber } from "../validators.js";
import { infoBox, warnBox } from "../dom.js";
import { findBand } from "../constants.js";
import { log } from "../log.js";
import { GeometryEngine } from "../engines/geometry-engine.js";
import { BoostEngine } from "../engines/boost-engine.js";
import { TransformerEngine } from "../engines/transformer-engine.js";

function baseAdvancedNVISGain(frac) {
    if (frac < 0.40) return 0.3;
    if (frac < 0.60) return 0.7;
    if (frac < 0.80) return 1.0;
    return 1.3;
}

export default function initAdvancedNVISSlopingLongwire(root) {
    const container = document.querySelector("#content") || root;
    if (!container) return;

    container.innerHTML = `
        <section class="tool">
            <h2>Advanced NVIS Sloping Longwire</h2>

            <h3>Geometry</h3>
            <div class="field-grid">

                <label>Operating frequency (MHz)
                    <input id="ansl-freq" type="number" step="0.01" value="5.3">
                </label>

                <label>Wire length (m)
                    <input id="ansl-length" type="number" step="0.5" value="32">
                </label>

                <label>High end height (m)
                    <input id="ansl-high" type="number" step="0.5" value="11">
                </label>

                <label>Low end height (m)
                    <input id="ansl-low" type="number" step="0.5" value="2">
                </label>

                <label>Height shaping (midpoint height, m)
                    <input id="ansl-mid" type="number" step="0.5" value="6">
                </label>

                <label>Primary NVIS reflector
                    <select id="ansl-ref1">
                        <option value="none">None</option>
                        <option value="wire">Low wire reflector</option>
                        <option value="mesh">Mesh / cloth reflector</option>
                    </select>
                </label>

                <label>Primary reflector height (m)
                    <input id="ansl-ref1h" type="number" step="0.1" value="2.5">
                </label>

                <label>Secondary NVIS reflector
                    <select id="ansl-ref2">
                        <option value="none">None</option>
                        <option value="wire">Low wire reflector</option>
                        <option value="mesh">Mesh / cloth reflector</option>
                    </select>
                </label>

                <label>Secondary reflector height (m)
                    <input id="ansl-ref2h" type="number" step="0.1" value="3.0">
                </label>

            </div>

            <h3>Boost</h3>
            <div class="field-grid boost-grid">

                <label>Time of day
                    <select id="ansl-tod">
                        <option value="day">Day</option>
                        <option value="night">Night</option>
                        <option value="dawn">Dawn</option>
                        <option value="dusk">Dusk</option>
                    </select>
                </label>

                <label><input id="ansl-seaside" type="checkbox"> Seaside (+10 dB)</label>
                <label><input id="ansl-groundscreen" type="checkbox"> Ground Screen / Faraday Cloth</label>
                <label><input id="ansl-elevated" type="checkbox"> Elevated Supports</label>

                <label>Feedline family
                    <select id="ansl-feed-family">
                        <option value="coax">Coax</option>
                        <option value="ladder">Ladder line</option>
                    </select>
                </label>

                <label>Feedline type
                    <select id="ansl-feed-type">
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
                    <input id="ansl-feed-length" type="number" step="5" value="75">
                </label>

            </div>

            <button id="ansl-compute" style="margin-top:1rem;">Compute Advanced NVIS Sloping Longwire</button>

            <div id="ansl-summary" class="summary" style="margin-top:1rem;"></div>

        </section>
    `;

    const freqInput = document.getElementById("ansl-freq");
    const lengthInput = document.getElementById("ansl-length");
    const highInput = document.getElementById("ansl-high");
    const lowInput = document.getElementById("ansl-low");
    const midInput = document.getElementById("ansl-mid");
    const ref1Input = document.getElementById("ansl-ref1");
    const ref1hInput = document.getElementById("ansl-ref1h");
    const ref2Input = document.getElementById("ansl-ref2");
    const ref2hInput = document.getElementById("ansl-ref2h");

    const todInput = document.getElementById("ansl-tod");
    const seasideInput = document.getElementById("ansl-seaside");
    const groundScreenInput = document.getElementById("ansl-groundscreen");
    const elevatedInput = document.getElementById("ansl-elevated");

    const feedFamilyInput = document.getElementById("ansl-feed-family");
    const feedTypeInput = document.getElementById("ansl-feed-type");
    const feedLenInput = document.getElementById("ansl-feed-length");

    const summaryDiv = document.getElementById("ansl-summary");
    const button = document.getElementById("ansl-compute");

    button.addEventListener("click", () => {

        const errors = [];

        const freq = toNumber(freqInput.value);
        const length = toNumber(lengthInput.value);
        const high = toNumber(highInput.value);
        const low = toNumber(lowInput.value);
        const mid = toNumber(midInput.value);
        const ref1 = ref1Input.value;
        const ref1h = toNumber(ref1hInput.value);
        const ref2 = ref2Input.value;
        const ref2h = toNumber(ref2hInput.value);

        requireFrequency(freq, errors);
        requirePositive(length, "Wire length", errors);
        requirePositive(high, "High end height", errors);
        requirePositive(low, "Low end height", errors);
        requirePositive(mid, "Midpoint height", errors);

        if (high <= low) errors.push("High end height must be greater than low end height.");
        if (ref1 !== "none") requirePositive(ref1h, "Primary reflector height", errors);
        if (ref2 !== "none") requirePositive(ref2h, "Secondary reflector height", errors);

        if (errors.length) {
            summaryDiv.innerHTML = warnBox(errors.join("<br>"));
            return;
        }

        const band = findBand(freq);
        const avgHeight = (high + low + mid) / 3;

        const geom = GeometryEngine.computeGeometry({
            freqMHz: freq,
            heightM: avgHeight,
            spanM: length
        });

        const baseGain = baseAdvancedNVISGain(geom.frac);

        const feedFamily = feedFamilyInput.value === "ladder" ? "ladder" : "coax";

        const boost = BoostEngine.computeBoost({
            reflectorCount: (ref1 !== "none" ? 1 : 0) + (ref2 !== "none" ? 1 : 0),
            directorCount: 0,
            timeOfDay: todInput.value,
            seaside: seasideInput.checked,
            groundScreen: groundScreenInput.checked,
            elevatedRadials: elevatedInput.checked,
            nvisReflector: ref1 !== "none" || ref2 !== "none",
            feedlineFamily: feedFamily,
            feedlineType: feedTypeInput.value,
            feedlineLengthFt: toNumber(feedLenInput.value),
            dxTurboPatternBonus: false
        });

        const totalGain = baseGain + geom.totalGeomGainDelta + boost.totalBoost;
        const finalToa = Math.max(65, Math.min(88, geom.toa + boost.toaShift));

        const geomLines = [
            `Wire length: ${length.toFixed(1)} m`,
            `High end height: ${high.toFixed(1)} m`,
            `Low end height: ${low.toFixed(1)} m`,
            `Midpoint height: ${mid.toFixed(1)} m`,
            `Average height: ${avgHeight.toFixed(1)} m`,
            `Primary reflector: ${ref1}`,
            ref1 !== "none" ? `Primary reflector height: ${ref1h.toFixed(1)} m` : "",
            `Secondary reflector: ${ref2}`,
            ref2 !== "none" ? `Secondary reflector height: ${ref2h.toFixed(1)} m` : "",
            ...(geom.components.length ? geom.components.map(c => c.note ?? "") : [])
        ].filter(Boolean).join("<br>");

        const boostLines = boost.components.length
            ? boost.components.map(d => {
                const parts = [];
                if (d.boost) parts.push(`${d.boost.toFixed(1)} dB from ${d.label}`);
                else parts.push(d.label);
                if (d.toaShift) parts.push(`TOA shift ${d.toaShift > 0 ? "+" : ""}${d.toaShift}°`);
                return parts.join(" — ");
            }).join("<br>")
            : "No boost options enabled.";

        const transformerHtml = TransformerEngine.getTransformerNote("advancedNVISSlopingLongwire", feedFamily);

        log("AdvancedNVISSlopingLongwire", {
            freq,
            length,
            high,
            low,
            mid,
            ref1,
            ref1h,
            ref2,
            ref2h,
            avgHeight,
            geom,
            baseGain,
            boost,
            totalGain,
            finalToa
        });

        summaryDiv.innerHTML = infoBox(`
            <p><strong>Operating frequency:</strong> ${freq.toFixed(2)} MHz (${band?.label ?? "Unknown band"})</p>

            <p><strong>Base Advanced NVIS Gain:</strong> ${baseGain.toFixed(1)} dBi</p>

            <p><strong>Geometry details:</strong><br>${geomLines}</p>

            <p><strong>Boost breakdown:</strong><br>${boostLines}</p>

            <p><strong>Total estimated gain:</strong> ${totalGain.toFixed(1)} dBi</p>

            <p><strong>Estimated TOA (NVIS):</strong> ${finalToa.toFixed(0)}°</p>

            ${transformerHtml}
        `);
    });
}
