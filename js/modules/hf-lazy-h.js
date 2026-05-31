/* ---------------------------------------------------------
   HF Workbench — Lazy‑H
   (Two half‑wave dipoles stacked vertically and fed in phase)
   - Geometry panel
   - Unified boost panel (two-column .boost-grid)
   - Upper/lower dipole heights + total span + spacing
   - Feedline family + type + length
   - Transformer Requirements (1:1 choke recommended; phasing line required)
--------------------------------------------------------- */

import { requireFrequency, requirePositive, toNumber } from "../validators.js";
import { infoBox, warnBox } from "../dom.js";
import { findBand } from "../constants.js";
import { log } from "../log.js";
import { GeometryEngine } from "../engines/geometry-engine.js";
import { BoostEngine } from "../engines/boost-engine.js";
import { TransformerEngine } from "../engines/transformer-engine.js";

function baseLazyHGain(frac, spacing) {
    // Lazy‑H gain increases with vertical spacing
    let base = 2.2; // dipole baseline
    if (spacing < 0.15) base += 1.0;
    else if (spacing < 0.25) base += 2.0;
    else if (spacing < 0.35) base += 2.8;
    else base += 3.2;
    return base;
}

export default function initLazyH(root) {
    const container = document.querySelector("#content") || root;
    if (!container) return;

    container.innerHTML = `
        <section class="tool">
            <h2>Lazy‑H (Broadside Wire Array)</h2>

            <h3>Geometry</h3>
            <div class="field-grid">

                <label>Total span (m)
                    <input id="lh-span" type="number" step="0.1" value="41">
                </label>

                <label>Operating frequency (MHz)
                    <input id="lh-freq" type="number" step="0.01" value="7.1">
                </label>

                <label>Lower dipole height (m)
                    <input id="lh-low" type="number" step="0.1" value="10">
                </label>

                <label>Upper dipole height (m)
                    <input id="lh-high" type="number" step="0.1" value="20">
                </label>

                <label>Vertical spacing (m)
                    <input id="lh-spacing" type="number" step="0.1" value="10">
                </label>

                <label>Configuration
                    <select id="lh-config">
                        <option value="flat">Flat / horizontal</option>
                        <option value="sloper">Sloper</option>
                        <option value="tilted">Tilted</option>
                    </select>
                </label>

            </div>

            <h3>Boost</h3>
            <div class="field-grid boost-grid">

                <label>Time of day
                    <select id="lh-tod">
                        <option value="day">Day</option>
                        <option value="night">Night</option>
                        <option value="dawn">Dawn</option>
                        <option value="dusk">Dusk</option>
                    </select>
                </label>

                <label><input id="lh-seaside" type="checkbox"> Seaside (+10 dB)</label>
                <label><input id="lh-groundscreen" type="checkbox"> Ground Screen / Faraday Cloth</label>
                <label><input id="lh-elevated" type="checkbox"> Elevated Supports</label>

                <label>Feedline family
                    <select id="lh-feed-family">
                        <option value="ladder">Ladder line (recommended)</option>
                        <option value="coax">Coax</option>
                    </select>
                </label>

                <label>Feedline type
                    <select id="lh-feed-type">
                        <option value="450Ω">450Ω window line</option>
                        <option value="300Ω">300Ω twin-lead</option>
                        <option value="600Ω">600Ω open wire</option>
                        <option value="RG-213">RG-213</option>
                        <option value="LMR-400">LMR-400</option>
                        <option value="RG-8X">RG-8X</option>
                        <option value="RG-58">RG-58</option>
                    </select>
                </label>

                <label>Feedline length (ft)
                    <input id="lh-feed-length" type="number" step="5" value="75">
                </label>

            </div>

            <button id="lh-compute" style="margin-top:1rem;">Compute Lazy‑H</button>

            <div id="lh-summary" class="summary" style="margin-top:1rem;"></div>

        </section>
    `;

    const spanInput = document.getElementById("lh-span");
    const freqInput = document.getElementById("lh-freq");
    const lowInput = document.getElementById("lh-low");
    const highInput = document.getElementById("lh-high");
    const spacingInput = document.getElementById("lh-spacing");
    const configInput = document.getElementById("lh-config");

    const todInput = document.getElementById("lh-tod");
    const seasideInput = document.getElementById("lh-seaside");
    const groundScreenInput = document.getElementById("lh-groundscreen");
    const elevatedInput = document.getElementById("lh-elevated");

    const feedFamilyInput = document.getElementById("lh-feed-family");
    const feedTypeInput = document.getElementById("lh-feed-type");
    const feedLenInput = document.getElementById("lh-feed-length");

    const summaryDiv = document.getElementById("lh-summary");
    const button = document.getElementById("lh-compute");

    button.addEventListener("click", () => {

        const errors = [];

        const span = toNumber(spanInput.value);
        const freq = toNumber(freqInput.value);
        const low = toNumber(lowInput.value);
        const high = toNumber(highInput.value);
        const spacing = toNumber(spacingInput.value);
        const config = configInput.value;

        requirePositive(span, "Total span", errors);
        requireFrequency(freq, errors);
        requirePositive(low, "Lower dipole height", errors);
        requirePositive(high, "Upper dipole height", errors);
        requirePositive(spacing, "Vertical spacing", errors);

        if (high <= low) errors.push("Upper dipole height must be greater than lower dipole height.");

        if (errors.length) {
            summaryDiv.innerHTML = warnBox(errors.join("<br>"));
            return;
        }

        const band = findBand(freq);

        const spacingWL = spacing / (300 / freq);
        const avgHeight = (low + high) / 2;

        const geom = GeometryEngine.computeGeometry({
            freqMHz: freq,
            heightM: avgHeight,
            spanM: span
        });

        const baseGain = baseLazyHGain(geom.frac, spacingWL);

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
            dxTurboPatternBonus: true
        });

        const totalGain = baseGain + geom.totalGeomGainDelta + boost.totalBoost;

        let toaBase = 22;
        if (config === "sloper") toaBase = 28;
        if (config === "tilted") toaBase = 25;

        const finalToa = Math.max(10, Math.min(45, toaBase + (boost.toaShift || 0)));

        const geomLines = [
            `Total span: ${span.toFixed(1)} m`,
            `Lower dipole height: ${low.toFixed(1)} m`,
            `Upper dipole height: ${high.toFixed(1)} m`,
            `Vertical spacing: ${spacing.toFixed(1)} m (${spacingWL.toFixed(2)} λ)`,
            `Configuration: ${config}`,
            `Lazy‑H provides strong broadside gain and low-angle radiation.`,
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

        const transformerHtml = TransformerEngine.getTransformerNote("lazyH", feedFamily);

        log("LazyH", {
            span,
            freq,
            low,
            high,
            spacing,
            spacingWL,
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

            <p><strong>Base Lazy‑H Gain:</strong> ${baseGain.toFixed(1)} dBi</p>

            <p><strong>Geometry details:</strong><br>${geomLines}</p>

            <p><strong>Boost breakdown:</strong><br>${boostLines}</p>

            <p><strong>Total estimated gain:</strong> ${totalGain.toFixed(1)} dBi</p>

            <p><strong>Estimated TOA:</strong> ${finalToa.toFixed(0)}°</p>

            ${transformerHtml}
        `);
    });
}
