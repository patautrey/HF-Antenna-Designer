/* ---------------------------------------------------------
   HF Workbench — OCF Dipole (Off‑Center‑Fed Dipole)
   - Geometry panel
   - Unified boost panel (two-column .boost-grid)
   - Total length + feedpoint offset + height + tilt
   - Feedline family + type + length
   - Transformer Requirements (4:1 or 6:1 balun depending on offset)
--------------------------------------------------------- */

import { requireFrequency, requirePositive, toNumber } from "../validators.js";
import { infoBox, warnBox } from "../dom.js";
import { findBand } from "../constants.js";
import { log } from "../log.js";
import { GeometryEngine } from "../engines/geometry-engine.js";
import { BoostEngine } from "../engines/boost-engine.js";
import { TransformerEngine } from "../engines/transformer-engine.js";

function baseOCFGain(frac) {
    // OCF behaves like a dipole with slight asymmetry
    if (frac < 0.40) return 1.9;
    if (frac < 0.60) return 2.3;
    if (frac < 0.80) return 2.6;
    return 2.9;
}

export default function initOCFDipole(root) {
    const container = document.querySelector("#content") || root;
    if (!container) return;

    container.innerHTML = `
        <section class="tool">
            <h2>OCF Dipole (Off‑Center‑Fed Dipole)</h2>

            <h3>Geometry</h3>
            <div class="field-grid">

                <label>Total wire length (m)
                    <input id="ocf-length" type="number" step="0.1" value="41">
                </label>

                <label>Feedpoint offset (% from one end)
                    <input id="ocf-offset" type="number" step="1" value="33">
                </label>

                <label>Operating frequency (MHz)
                    <input id="ocf-freq" type="number" step="0.01" value="7.1">
                </label>

                <label>Center height (m)
                    <input id="ocf-height" type="number" step="0.1" value="10">
                </label>

                <label>End height (m)
                    <input id="ocf-endheight" type="number" step="0.1" value="6">
                </label>

                <label>Configuration
                    <select id="ocf-config">
                        <option value="flat">Flat / horizontal</option>
                        <option value="invertedV">Inverted‑V</option>
                        <option value="sloper">Sloper</option>
                    </select>
                </label>

            </div>

            <h3>Boost</h3>
            <div class="field-grid boost-grid">

                <label>Time of day
                    <select id="ocf-tod">
                        <option value="day">Day</option>
                        <option value="night">Night</option>
                        <option value="dawn">Dawn</option>
                        <option value="dusk">Dusk</option>
                    </select>
                </label>

                <label><input id="ocf-seaside" type="checkbox"> Seaside (+10 dB)</label>
                <label><input id="ocf-groundscreen" type="checkbox"> Ground Screen / Faraday Cloth</label>
                <label><input id="ocf-elevated" type="checkbox"> Elevated Supports</label>

                <label>Feedline family
                    <select id="ocf-feed-family">
                        <option value="coax">Coax</option>
                        <option value="ladder">Ladder line</option>
                    </select>
                </label>

                <label>Feedline type
                    <select id="ocf-feed-type">
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
                    <input id="ocf-feed-length" type="number" step="5" value="75">
                </label>

            </div>

            <button id="ocf-compute" style="margin-top:1rem;">Compute OCF Dipole</button>

            <div id="ocf-summary" class="summary" style="margin-top:1rem;"></div>

        </section>
    `;

    const lengthInput = document.getElementById("ocf-length");
    const offsetInput = document.getElementById("ocf-offset");
    const freqInput = document.getElementById("ocf-freq");
    const heightInput = document.getElementById("ocf-height");
    const endHeightInput = document.getElementById("ocf-endheight");
    const configInput = document.getElementById("ocf-config");

    const todInput = document.getElementById("ocf-tod");
    const seasideInput = document.getElementById("ocf-seaside");
    const groundScreenInput = document.getElementById("ocf-groundscreen");
    const elevatedInput = document.getElementById("ocf-elevated");

    const feedFamilyInput = document.getElementById("ocf-feed-family");
    const feedTypeInput = document.getElementById("ocf-feed-type");
    const feedLenInput = document.getElementById("ocf-feed-length");

    const summaryDiv = document.getElementById("ocf-summary");
    const button = document.getElementById("ocf-compute");

    button.addEventListener("click", () => {

        const errors = [];

        const length = toNumber(lengthInput.value);
        const offsetPct = toNumber(offsetInput.value);
        const freq = toNumber(freqInput.value);
        const height = toNumber(heightInput.value);
        const endHeight = toNumber(endHeightInput.value);
        const config = configInput.value;

        requirePositive(length, "Total wire length", errors);
        requirePositive(offsetPct, "Feedpoint offset", errors);
        requireFrequency(freq, errors);
        requirePositive(height, "Center height", errors);
        requirePositive(endHeight, "End height", errors);

        if (offsetPct <= 0 || offsetPct >= 50) {
            errors.push("Offset must be between 5% and 45% for typical OCF operation.");
        }

        if (errors.length) {
            summaryDiv.innerHTML = warnBox(errors.join("<br>"));
            return;
        }

        const band = findBand(freq);

        const feedOffsetM = (offsetPct / 100) * length;
        const avgHeight = (height + endHeight) / 2;

        const geom = GeometryEngine.computeGeometry({
            freqMHz: freq,
            heightM: avgHeight,
            spanM: length
        });

        const baseGain = baseOCFGain(geom.frac);

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
            `Total length: ${length.toFixed(1)} m`,
            `Feedpoint offset: ${offsetPct.toFixed(1)}% (${feedOffsetM.toFixed(1)} m from one end)`,
            `Center height: ${height.toFixed(1)} m`,
            `End height: ${endHeight.toFixed(1)} m`,
            `Configuration: ${config}`,
            `Average height: ${avgHeight.toFixed(1)} m`,
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

        const transformerHtml =
            offsetPct < 30
                ? TransformerEngine.getTransformerNote("ocfDipole4to1", feedFamily)
                : TransformerEngine.getTransformerNote("ocfDipole6to1", feedFamily);

        log("OCFDipole", {
            length,
            offsetPct,
            freq,
            height,
            endHeight,
            config,
            feedOffsetM,
            avgHeight,
            geom,
            baseGain,
            boost,
            totalGain,
            finalToa
        });

        summaryDiv.innerHTML = infoBox(`
            <p><strong>Operating frequency:</strong> ${freq.toFixed(2)} MHz (${band?.label ?? "Unknown band"})</p>

            <p><strong>Base OCF Dipole Gain:</strong> ${baseGain.toFixed(1)} dBi</p>

            <p><strong>Geometry details:</strong><br>${geomLines}</p>

            <p><strong>Boost breakdown:</strong><br>${boostLines}</p>

            <p><strong>Total estimated gain:</strong> ${totalGain.toFixed(1)} dBi</p>

            <p><strong>Estimated TOA:</strong> ${finalToa.toFixed(0)}°</p>

            ${transformerHtml}
        `);
    });
}
