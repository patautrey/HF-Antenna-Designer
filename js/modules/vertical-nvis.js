/* ---------------------------------------------------------
   HF Workbench — NVIS Vertical Hybrid
   (Short Vertical + High‑Angle Radiator Assist)
   - Geometry panel
   - Unified boost panel (two-column .boost-grid)
   - NVIS reflector / top‑hat options
   - Feedline family + type + length
   - Transformer Requirements (1:1 choke or EFHW transformer)
--------------------------------------------------------- */

import { requireFrequency, requirePositive, toNumber } from "../validators.js";
import { infoBox, warnBox } from "../dom.js";
import { findBand } from "../constants.js";
import { log } from "../log.js";
import { GeometryEngine } from "../engines/geometry-engine.js";
import { BoostEngine } from "../engines/boost-engine.js";
import { TransformerEngine } from "../engines/transformer-engine.js";

function baseNVISVerticalGain(frac) {
    if (frac < 0.40) return 0.5;
    if (frac < 0.60) return 1.0;
    if (frac < 0.80) return 1.3;
    return 1.5;
}

export default function initVerticalNVIS(root) {
    const container = document.querySelector("#content") || root;
    if (!container) return;

    container.innerHTML = `
        <section class="tool">
            <h2>Vertical NVIS Hybrid</h2>

            <h3>Geometry</h3>
            <div class="field-grid">

                <label>Frequency (MHz)
                    <input id="vn-freq" type="number" step="0.01" value="5.3">
                </label>

                <label>Vertical radiator length (m)
                    <input id="vn-length" type="number" step="0.1" value="4.0">
                </label>

                <label>Base height (m)
                    <input id="vn-height" type="number" step="0.5" value="1.5">
                </label>

                <label>NVIS reflector enabled
                    <select id="vn-reflector">
                        <option value="none">None</option>
                        <option value="wire">Low wire reflector</option>
                        <option value="mesh">Mesh / cloth reflector</option>
                    </select>
                </label>

                <label>Reflector height (m)
                    <input id="vn-refheight" type="number" step="0.1" value="2.5">
                </label>

            </div>

            <h3>Boost</h3>
            <div class="field-grid boost-grid">

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
                <label><input id="vn-elevated" type="checkbox"> Elevated Base / Supports</label>

                <label>Feedline family
                    <select id="vn-feed-family">
                        <option value="coax">Coax</option>
                        <option value="ladder">Ladder line</option>
                    </select>
                </label>

                <label>Feedline type
