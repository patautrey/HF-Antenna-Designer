/* ---------------------------------------------------------------------------
   Antenna Workbench — Doublet Designer (Workbench Edition)
   Full Workbench‑style module
   - GeometryEngine
   - BoostEngine
   - TransformerEngine
   - NVIS Reflector Engine
   - Unified boost panel
   - Summary box
   - Logging
--------------------------------------------------------------------------- */

import { requireFrequency, requirePositive, toNumber } from "../validators.js";
import { infoBox, warnBox } from "../dom.js";
import { findBand } from "../constants.js";
import { log } from "../log.js";

import { GeometryEngine } from "../engines/geometry-engine.js";
import { BoostEngine } from "../engines/boost-engine.js";
import { TransformerEngine } from "../engines/transformer-engine.js";
import { computeNVISReflector, logNVISReflector } from "../engines/nvis-reflector.js";

import { wavelength, round } from "../utils.js";

/* ---------------------------------------------------------------------------
   BASE GAIN MODEL FOR DOUBLET
--------------------------------------------------------------------------- */
function baseDoubletGain(frac) {
    if (frac < 0.40) return 1.0;     // short doublet
    if (frac < 0.60) return 1.8;     // near half-wave
    if (frac < 0.80) return 2.2;     // slightly long
    return 2.6;                      // long doublet
}

export default function initDoubletDesigner(root) {
    const container = document.querySelector("#content") || root;
    if (!container) return;

    container.innerHTML = `
        <section class="tool">
            <h2>Doublet Designer</h2>

            <h3>Geometry</h3>
            <div class="field-grid">
                <label>Frequency (MHz)
                    <input id="db-freq" type="number" step="0.01" value="7.1">
                </label>

                <label>Total wire length (m)
                    <input id="db-length" type="number" step="0.5" value="40">
                </label>

                <label>Height (m)
                    <input id="db-height" type="number" step="0.5" value="10">
                </label>

                <label>Feedline type
                    <select id="db-feed-type">
                        <option value="450">450Ω ladder line</option>
                        <option value="300">300Ω twinlead</option>
                        <option value="600">600Ω open wire</option>
                    </select>
                </label>

                <label>Feedline length (ft)
                    <input id="db-feed-length" type="number" step="5" value="75">
                </label>
            </div>

            <h3>NVIS Reflector (Optional)</h3>
            <div class="field-grid">
                <label><input id="db-ref-enable" type="checkbox"> Enable NVIS reflector</label>

                <label>Reflector wires
                    <input id="db-ref-wires" type="number" step="1" value="0">
                </label>

                <label>Reflector spacing (m)
                    <input id="db-ref-spacing" type="number" step="0.5" value="0">
                </label>

                <label>Reflector height (m)
                    <input id="db-ref-height" type="number" step="0.5" value="0">
                </label>
            </div>

            <h3>Boost</h3>
            <div class="field-grid boost-grid">
                <label>Time of day
                    <select id="db-tod">
                        <option value="day">Day</option>
                        <option value="night">Night</option>
                        <option value="dawn">Dawn</option>
                        <option value="dusk">Dusk</option>
                    </select>
                </label>

                <label><input id="db-seaside" type="checkbox"> Seaside (+10 dB)</label>
                <label><input id="db-groundscreen" type="checkbox"> Ground screen</label>

                <label>Coax jumper type
                    <select id="db-coax-type">
                        <option value="RG-213">RG-213</option>
                        <option value="LMR-400">LMR-400</option>
                        <option value="RG-8X">RG-8X</option>
                        <option value="RG-58">RG-58</option>
                    </select>
                </label>

                <label>Coax jumper length (ft)
                    <input id="db-coax-length" type="number" step="5" value="10">
                </label>
            </div>

            <button id="db-compute" style="margin-top:1rem;">Compute Doublet</button>

            <div id="db-summary" class="summary" style="margin-top:1rem;"></div>
        </section>
    `;

    // Inputs
    const freqInput = document.getElementById("db-freq");
    const lengthInput = document.getElementById("db-length");
    const heightInput = document.getElementById("db-height");

    const feedTypeInput = document.getElementById("db-feed-type");
