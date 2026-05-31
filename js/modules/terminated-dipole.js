/* ---------------------------------------------------------
   HF Workbench — Terminated Dipole (T2FD / Broadband Dipole)
   - Geometry panel
   - Unified boost panel (two-column .boost-grid)
   - Termination resistor value + placement
   - Feedline family + type + length
   - Transformer Requirements (4:1 current balun + resistor notes)
--------------------------------------------------------- */

import { requireFrequency, requirePositive, toNumber } from "../validators.js";
import { infoBox, warnBox } from "../dom.js";
import { findBand } from "../constants.js";
import { log } from "../log.js";
import { GeometryEngine } from "../engines/geometry-engine.js";
import { BoostEngine } from "../engines/boost-engine.js";
import { TransformerEngine } from "../engines/transformer-engine.js";

function baseT2FDGain(frac) {
    if (frac < 0.40) return -1.0;   // broadband antennas trade efficiency for bandwidth
    if (frac < 0.60) return -0.5;
    if (frac < 0.80) return 0.0;
    return 0.3;
}

export default function initTerminatedDipole(root) {
    const container = document.querySelector("#content") || root;
    if (!container) return;

    container.innerHTML = `
        <section class="tool">
            <h2>Terminated Dipole (T2FD)</h2>

            <h3>Geometry</h3>
            <div class="field-grid">
                <label>Center frequency (MHz)
                    <input id="td-freq" type="number" step="0.01" value="10.1">
                </label>

                <label>Total span (m)
                    <input id="td-span" type="number" step="0.5" value="27">
                </label>

                <label>Average height (m)
                    <input id="td-height" type="number" step="0.5" value="10">
                </label>

                <label>Termination resistor (Ω)
                    <input id="td-resistor" type="number" step="10" value="390">
                </label>

                <label>Configuration
                    <select id="td-config">
                        <option value="flat-top">Flat-top</option>
                        <option value="inverted-V">Inverted-V</option>
                        <option value="sloper">Sloper</option>
                        <option value="tilted">Tilted / T2FD classic</option>
                    </select>
                </label>
            </div>

            <h3>Boost</h3>
            <div class="field-grid boost-grid">
                <label>Time of day
                    <select id="td-tod">
                        <option value="day">Day</option>
                        <option value="night">Night</option>
                        <option value="dawn">Dawn</option>
                        <option value="dusk">Dusk</option>
                    </select>
                </label>

                <label><input id="td-seaside" type="checkbox"> Seaside (+10 dB)</label>
                <label><input id="td-groundscreen" type="checkbox"> Ground Screen / Faraday Cloth</label>
                <label><input id="td-elevated" type="checkbox"> Elevated Feed / Supports</label>

                <label>Feedline family
                    <select id="td-feed-family">
                        <option value="coax">Coax</option>
                        <option value="ladder">Ladder line</option>
                    </select>
                </label>

                <label>Feedline type
                    <select id="td-feed-type">
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
                    <input id="td-feed-length" type="number" step="5" value="75">
                </label>
            </div>

            <button id="td-compute" style="margin-top:1rem;">Compute Terminated Dipole</button>

            <div id="td-summary" class="summary" style="margin-top:1rem;"></div>
        </section>
    `;

    const freqInput = document.getElementById("td-freq");
    const spanInput = document.getElementById("td-span");
    const heightInput = document.getElementById("td-height");
    const resistorInput = document.getElementById("td-resistor");
    const configInput = document.getElementById("td-config");

    const todInput = document.getElementById("td-tod");
    const seasideInput = document.getElementById("td-seaside");
    const groundScreenInput = document.getElementById("td-groundscreen");
    const elevatedInput = document.getElementById("td-elevated");

    const feedFamilyInput = document.getElementById("td-feed-family");
    const feedTypeInput = document.getElementById("td-feed-type");
    const feedLenInput = document.getElementById("td-feed-length");

    const summaryDiv = document.getElementById("td-summary");
    const button = document.getElementById("td-compute");

    button.addEventListener("click", () => {
        const errors = [];

        const freq = toNumber(freqInput.value);
        const span = toNumber(spanInput.value);
        const height = toNumber(heightInput.value);
        const resistor = toNumber(resistorInput.value);
        const config = configInput.value;

        requireFrequency(freq, errors);
        requirePositive(span, "Total span", errors);
        requirePositive(height, "Average height", errors);
        requirePositive(resistor, "Termination resistor", errors);

        if (errors.length) {
            summaryDiv.innerHTML = warnBox(errors.join("<br>"));
            return;
        }

        const band = findBand(freq);

        const geom = GeometryEngine.computeGeometry({
            freqMHz: freq,
            heightM: height,
            spanM: span
        });

        const baseGain = baseT2FDGain(geom.frac);

        const feedFamily = feedFamilyInput.value === "ladder" ? "ladder" : "coax";

        const boost = BoostEngine.computeBoost({
            reflectorCount: 0,
            directorCount: 0,
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
        const finalToa = Math.max(30, Math.min(85, geom.toa + boost.toaShift));

        const geomLines = [
            `Span: ${span.toFixed(1)} m`,
            `Configuration: ${config}`,
            `Termination resistor: ${resistor.toFixed(0)} Ω`,
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

        const transformerHtml = TransformerEngine.getTransformerNote("terminatedDipole", feedFamily);

        log("TerminatedDipole", {
            freq,
            span,
            height,
            resistor,
            config,
            geom,
            baseGain,
            boost,
            totalGain,
            finalToa
        });

        summaryDiv.innerHTML = infoBox(`
            <p><strong>Center frequency:</strong> ${freq.toFixed(2)} MHz (${band?.label ?? "Unknown band"})</p>

            <p><strong>Electrical height:</strong> 
                ${geom.effectiveHeight.toFixed(2)} m 
                (${(geom.frac * 100).toFixed(1)}% of λ)
            </p>

            <p><strong>Base T2FD Gain:</strong> ${baseGain.toFixed(1)} dBi</p>

            <p><strong>Geometry details:</strong><br>${geomLines}</p>

            <p><strong>Boost breakdown:</strong><br>${boostLines}</p>

            <p><strong>Total estimated gain:</strong> ${totalGain.toFixed(1)} dBi</p>

            <p><strong>Estimated TOA:</strong> ${finalToa.toFixed(0)}°</p>

            ${transformerHtml}
        `);
    });
}
