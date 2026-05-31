/* ---------------------------------------------------------
   VHF/UHF Workbench — Starter Module
   - 2m Yagi
   - 70cm Yagi
   - Slim Jim
   - J-pole
   - Collinear
   - Satellite (RHCP/LHCP stub)
--------------------------------------------------------- */

import { awAttachShell } from "../ui-shell.js";

export default function initVhfUhfWorkbench(root) {
    const container = document.querySelector("#content") || root;
    if (!container) return;

    container.innerHTML = `
        <section class="tool">
            <h2>VHF/UHF Workbench</h2>
            <p>Select a VHF/UHF antenna type to explore basic parameters. (This is a starter module you can expand later.)</p>

            <div class="field-grid">
                <label>Antenna type
                    <select id="vu-type">
                        <option value="2m-yagi">2m Yagi (144 MHz)</option>
                        <option value="70cm-yagi">70cm Yagi (432 MHz)</option>
                        <option value="slim-jim">Slim Jim (2m)</option>
                        <option value="j-pole">J-pole (2m)</option>
                        <option value="collinear">Collinear Vertical (2m)</option>
                        <option value="satellite">Satellite RHCP/LHCP (2m/70cm)</option>
                    </select>
                </label>

                <label>Center frequency (MHz)
                    <input id="vu-freq" type="number" step="0.1" value="144.2">
                </label>

                <label>Element boom length (m)
                    <input id="vu-boom" type="number" step="0.01" value="1.5">
                </label>

                <label>Element count (for Yagi/Collinear)
                    <input id="vu-elements" type="number" step="1" value="5">
                </label>

                <label>Polarization
                    <select id="vu-pol">
                        <option value="vertical">Vertical</option>
                        <option value="horizontal">Horizontal</option>
                        <option value="circular">Circular (satellite)</option>
                    </select>
                </label>
            </div>

            <button id="vu-compute" style="margin-top:1rem;">Compute VHF/UHF Antenna</button>

            <div id="vu-summary" class="summary" style="margin-top:1rem;"></div>
        </section>
    `;

    const typeInput = document.getElementById("vu-type");
    const freqInput = document.getElementById("vu-freq");
    const boomInput = document.getElementById("vu-boom");
    const elemInput = document.getElementById("vu-elements");
    const polInput = document.getElementById("vu-pol");
    const summaryDiv = document.getElementById("vu-summary");
    const button = document.getElementById("vu-compute");

    button.addEventListener("click", () => {
        const type = typeInput.value;
        const freq = Number(freqInput.value) || 0;
        const boom = Number(boomInput.value) || 0;
        const elements = Number(elemInput.value) || 0;
        const pol = polInput.value;

        let baseGain = 2.1; // dBi baseline
        let notes = [];

        if (type === "2m-yagi" || type === "70cm-yagi") {
            baseGain = 3 + 1.2 * Math.max(0, elements - 3);
            notes.push("Yagi gain scales roughly with element count and boom length.");
        } else if (type === "slim-jim") {
            baseGain = 3.0;
            notes.push("Slim Jim offers some gain over a simple 1/4-wave and a low-angle pattern.");
        } else if (type === "j-pole") {
            baseGain = 2.5;
            notes.push("J-pole behaves similarly to a 1/2-wave vertical with convenient feed.");
        } else if (type === "collinear") {
            baseGain = 3 + 1.5 * Math.max(0, elements - 2);
            notes.push("Collinear verticals stack radiating sections for higher gain at low angles.");
        } else if (type === "satellite") {
            baseGain = 10;
            notes.push("Satellite antennas often use crossed Yagis with circular polarization.");
        }

        if (pol === "circular") {
            notes.push("Circular polarization is ideal for satellite work to mitigate fading.");
        } else if (pol === "vertical") {
            notes.push("Vertical polarization is standard for FM and repeater work.");
        } else if (pol === "horizontal") {
            notes.push("Horizontal polarization is common for weak-signal SSB/CW on VHF/UHF.");
        }

        const lambda = freq > 0 ? (300 / freq) : 0;
        const boomLambda = lambda > 0 ? boom / lambda : 0;

        const html = `
            <p><strong>Type:</strong> ${type}</p>
            <p><strong>Frequency:</strong> ${freq.toFixed(1)} MHz</p>
            <p><strong>Estimated free-space gain:</strong> ${baseGain.toFixed(1)} dBi</p>
            <p><strong>Boom length:</strong> ${boom.toFixed(2)} m (${boomLambda.toFixed(2)} λ)</p>
            <p><strong>Elements:</strong> ${elements}</p>
            <p><strong>Polarization:</strong> ${pol}</p>
            <p><strong>Notes:</strong><br>${notes.join("<br>")}</p>
        `;

        summaryDiv.innerHTML = html;
    });

    awAttachShell(root, "vhf-uhf-workbench", "VHF/UHF Workbench");
}
