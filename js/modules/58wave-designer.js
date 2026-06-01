/* ---------------------------------------------------------
   HF Workbench — 5/8 Wave Vertical Designer
   - Polar plots (azimuth + elevation)
   - Metric + imperial (ft + in, 1/8" precision)
--------------------------------------------------------- */

import { requireFrequency, requirePositive, toNumber } from "../validators.js";
import { findBand } from "../constants.js";
import { log } from "../log.js";
import { GeometryEngine } from "../engines/geometry-engine.js";
import { BoostEngine } from "../engines/boost-engine.js";
import { TransformerEngine } from "../engines/transformer-engine.js";

// Simple 5/8λ base gain model
function base58WaveGain() {
    return 2.0;
}

// Convert meters → "X ft Y⅛ in" (nearest 1/8")
function formatFeetInches(meters) {
    const feetTotal = meters * 3.28084;
    let feet = Math.floor(Math.abs(feetTotal));
    let inches = (Math.abs(feetTotal) - feet) * 12;

    // Round to nearest 1/8 inch
    const eighths = Math.round(inches * 8);
    inches = eighths / 8;

    // Normalize if inches >= 12
    if (inches >= 12) {
        feet += 1;
        inches -= 12;
    }

    // Build inches string with fraction if needed
    const wholeInches = Math.floor(inches);
    const frac = inches - wholeInches;
    let fracStr = "";

    const eighth = Math.round(frac * 8); // 0..7
    if (eighth > 0) {
        fracStr = `${eighth}/8`;
    }

    let inchPart = "";
    if (wholeInches === 0 && fracStr) {
        inchPart = `${fracStr} in`;
    } else if (fracStr) {
        inchPart = `${wholeInches} ${fracStr} in`;
    } else {
        inchPart = `${wholeInches} in`;
    }

    const sign = feetTotal < 0 ? "-" : "";
    return `${sign}${feet} ft ${inchPart}`;
}

export function init({ PlotEngine, container }) {

    container.innerHTML = `
        <section class="tool">
            <h2>5/8 Wave Vertical Designer</h2>

            <h3>Geometry</h3>
            <div class="field-grid">

                <label>Operating frequency (MHz)
                    <input id="v58-freq" type="number" step="0.01" value="7.1">
                </label>

                <label>Target height (m)
                    <input id="v58-height" type="number" step="0.5" value="12">
                </label>

                <label>Radial count
                    <input id="v58-radials" type="number" step="1" value="16">
                </label>

                <label>Radial length (m)
                    <input id="v58-radial-length" type="number" step="0.5" value="10">
                </label>

            </div>

            <h3>Boost</h3>
            <div class="field-grid boost-grid">

                <label>Time of day
                    <select id="v58-tod">
                        <option value="day">Day</option>
                        <option value="night">Night</option>
                        <option value="dawn">Dawn</option>
                        <option value="dusk">Dusk</option>
                    </select>
                </label>

                <label><input id="v58-seaside" type="checkbox"> Seaside (+10 dB)</label>
                <label><input id="v58-groundscreen" type="checkbox"> Ground Screen / Radial Screen</label>
                <label><input id="v58-elevated" type="checkbox"> Elevated Radials</label>

                <label>Feedline family
                    <select id="v58-feed-family">
                        <option value="coax">Coax</option>
                        <option value="ladder">Ladder line</option>
                    </select>
                </label>

                <label>Feedline type
                    <select id="v58-feed-type">
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
                    <input id="v58-feed-length" type="number" step="5" value="75">
                </label>

            </div>

            <button id="v58-compute" style="margin-top:1rem;">Compute 5/8 Wave Vertical</button>

            <div id="v58-summary" class="summary" style="margin-top:1rem;"></div>

            <h3>Radiation Patterns</h3>
            <div id="v58-az" style="height:320px;margin-top:1rem;"></div>
            <div id="v58-el" style="height:320px;margin-top:1rem;"></div>

        </section>
    `;

    const summaryDiv = container.querySelector("#v58-summary");

    container.querySelector("#v58-compute").addEventListener("click", () => {

        const errors = [];

        const freq = toNumber(container.querySelector("#v58-freq").value);
        const height = toNumber(container.querySelector("#v58-height").value);
        const radialCount = toNumber(container.querySelector("#v58-radials").value);
        const radialLength = toNumber(container.querySelector("#v58-radial-length").value);

        requireFrequency(freq, errors);
        requirePositive(height, "Target height", errors);
        requirePositive(radialCount, "Radial count", errors);
        requirePositive(radialLength, "Radial length", errors);

        if (errors.length) {
            summaryDiv.innerHTML = `<div class="warn">${errors.join("<br>")}</div>`;
            return;
        }

        const band = findBand(freq);

        const wavelengthM = 300 / freq;
        const idealHeight = 0.625 * wavelengthM;
        const heightDelta = height - idealHeight;

        const geom = GeometryEngine.computeGeometry({
            freqMHz: freq,
            heightM: height,
            spanM: 0
        });

        const baseGain = base58WaveGain();

        const feedFamily = container.querySelector("#v58-feed-family").value === "ladder" ? "ladder" : "coax";

        const boost = BoostEngine.computeBoost({
            reflectorCount: 0,
            directorCount: 0,
            timeOfDay: container.querySelector("#v58-tod").value,
            seaside: container.querySelector("#v58-seaside").checked,
            groundScreen: container.querySelector("#v58-groundscreen").checked,
            elevatedRadials: container.querySelector("#v58-elevated").checked,
            nvisReflector: false,
            feedlineFamily: feedFamily,
            feedlineType: container.querySelector("#v58-feed-type").value,
            feedlineLengthFt: toNumber(container.querySelector("#v58-feed-length").value),
            dxTurboPatternBonus: false
        });

        const totalGain = baseGain + geom.totalGeomGainDelta + boost.totalBoost;
        const finalToa = Math.max(5, Math.min(40, geom.toa + boost.toaShift));

        const transformerHtml = TransformerEngine.getTransformerNote("58wave-vertical", feedFamily);

        log("58WaveVertical", {
            freq,
            height,
            radialCount,
            radialLength,
            idealHeight,
            heightDelta,
            geom,
            baseGain,
            boost,
            totalGain,
            finalToa
        });

        const idealHeightImperial = formatFeetInches(idealHeight);
        const actualHeightImperial = formatFeetInches(height);
        const heightDeltaImperial = formatFeetInches(heightDelta);
        const radialLengthImperial = formatFeetInches(radialLength);

        summaryDiv.innerHTML = `
            <div class="info">
                <p><strong>Operating frequency:</strong> ${freq.toFixed(2)} MHz (${band?.label ?? "Unknown band"})</p>

                <p><strong>Ideal 5/8λ height:</strong> ${idealHeight.toFixed(2)} m (${idealHeightImperial})<br>
                   <strong>Actual height:</strong> ${height.toFixed(2)} m (${actualHeightImperial})<br>
                   <strong>Height offset:</strong> ${heightDelta >= 0 ? "+" : ""}${heightDelta.toFixed(2)} m (${heightDeltaImperial})</p>

                <p><strong>Radial system:</strong> ${radialCount.toFixed(0)} × ${radialLength.toFixed(1)} m (${radialLengthImperial})</p>

                <p><strong>Base 5/8λ gain:</strong> ${baseGain.toFixed(1)} dBi</p>

                <p><strong>Total estimated gain:</strong> ${totalGain.toFixed(1)} dBi</p>

                <p><strong>Estimated TOA:</strong> ${finalToa.toFixed(0)}°</p>

                ${transformerHtml}
            </div>
        `;

        // Polar patterns
        PlotEngine.clearPlot("v58-az");
        PlotEngine.clearPlot("v58-el");

        const azPattern = Array.from({ length: 360 }, (_, deg) => ({
            angle: deg,
            gain: totalGain - Math.abs(Math.cos(deg * Math.PI / 180)) * 1.5
        }));

        const elPattern = Array.from({ length: 360 }, (_, deg) => {
            const elev = (deg + 360) % 360;
            const delta = Math.min(
                Math.abs(elev - finalToa),
                Math.abs(elev - (360 - finalToa))
            );
            return {
                angle: elev,
                gain: totalGain - (delta / 20)
            };
        });

        PlotEngine.plotAzimuth(azPattern, {
            elementId: "v58-az",
            title: `Azimuth Pattern @ ${freq.toFixed(2)} MHz`
        });

        PlotEngine.plotElevation(elPattern, {
            elementId: "v58-el",
            title: `Elevation Pattern @ ${freq.toFixed(2)} MHz`
        });
    });
}
