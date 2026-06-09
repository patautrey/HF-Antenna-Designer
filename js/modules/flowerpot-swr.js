/* ---------------------------------------------------------
   HF Workbench — Flowerpot Coaxial SWR Sweep Simulator
   - Transmission line solver
   - Complex impedance engine
   - Sleeve reactance model
   - Choke impedance model
   - Chart.js sweep plot
--------------------------------------------------------- */

import { toNumber } from "../validators.js";

export default function initFlowerpotSWR(root) {
    const container = document.querySelector("#content") || root;
    if (!container) return;

    container.innerHTML = `
        <section class="tool">
            <h2>Flowerpot Coaxial — SWR Sweep Simulator</h2>

            <div class="field-grid">
                <label>Start freq (MHz)
                    <input id="fpswr-start" type="number" step="0.1" value="130">
                </label>

                <label>End freq (MHz)
                    <input id="fpswr-end" type="number" step="0.1" value="170">
                </label>

                <label>Step (MHz)
                    <input id="fpswr-step" type="number" step="0.1" value="0.2">
                </label>

                <label>Radiator length (m)
                    <input id="fpswr-rad" type="number" step="0.01" value="0.49">
                </label>

                <label>Sleeve length (m)
                    <input id="fpswr-sleeve" type="number" step="0.01" value="0.49">
                </label>

                <label>Feedline type
                    <select id="fpswr-feed">
                        <option value="50">50Ω coax</option>
                        <option value="75">75Ω coax</option>
                    </select>
                </label>

                <label>Feedline length (m)
                    <input id="fpswr-len" type="number" step="0.1" value="10">
                </label>

                <label>Choke impedance (Ω)
                    <input id="fpswr-choke" type="number" step="10" value="1500">
                </label>
            </div>

            <button id="fpswr-run" style="margin-top:1rem;">Run Sweep</button>

            <canvas id="fpswr-chart" style="margin-top:1rem; width:100%; height:400px;"></canvas>

            <div id="fpswr-summary" class="summary" style="margin-top:1rem;"></div>
        </section>
    `;

    const startInput = document.getElementById("fpswr-start");
    const endInput = document.getElementById("fpswr-end");
    const stepInput = document.getElementById("fpswr-step");
    const radInput = document.getElementById("fpswr-rad");
    const sleeveInput = document.getElementById("fpswr-sleeve");
    const feedInput = document.getElementById("fpswr-feed");
    const lenInput = document.getElementById("fpswr-len");
    const chokeInput = document.getElementById("fpswr-choke");
    const runBtn = document.getElementById("fpswr-run");
    const summaryDiv = document.getElementById("fpswr-summary");

    let chart;

    function j(x) {
        return { re: 0, im: x };
    }

    function add(a, b) {
        return { re: a.re + b.re, im: a.im + b.im };
    }

    function sub(a, b) {
        return { re: a.re - b.re, im: a.im - b.im };
    }

    function mul(a, b) {
        return {
            re: a.re * b.re - a.im * b.im,
            im: a.re * b.im + a.im * b.re
        };
    }

    function div(a, b) {
        const d = b.re * b.re + b.im * b.im;
        return {
            re: (a.re * b.re + a.im * b.im) / d,
            im: (a.im * b.re - a.re * b.im) / d
        };
    }

    function mag(a) {
        return Math.sqrt(a.re * a.re + a.im * a.im);
    }

    function parallel(a, b) {
        return div(mul(a, b), add(a, b));
    }

    function series(a, b) {
        return add(a, b);
    }

    function Zradiator(freq, radLen) {
        const wl = 300 / freq;
        const x = 200 * (radLen - wl / 4);
        return { re: 30, im: x };
    }

    function Zsleeve(freq, sleeveLen) {
        const wl = 300 / freq;
        const x = -200 * (sleeveLen - wl / 4);
        return { re: 0, im: x };
    }

    function Zchoke(freq, Zc) {
        return { re: Zc, im: 0 };
    }

    function Zfeedline(freq, Zin, Z0, length) {
        const beta = 2 * Math.PI * freq * 1e6 / (3e8);
        const bl = beta * length;
        const jZ0tan = { re: 0, im: Z0 * Math.tan(bl) };
        const num = add(Zin, jZ0tan);
        const den = add({ re: Z0, im: 0 }, mul(j(1), { re: Zin.re * Math.tan(bl), im: Zin.im * Math.tan(bl) }));
        return mul({ re: Z0, im: 0 }, div(num, den));
    }

    function SWR(Zin, Z0) {
        const num = mag(sub(Zin, { re: Z0, im: 0 }));
        const den = mag(add(Zin, { re: Z0, im: 0 }));
        const g = num / den;
        return (1 + g) / (1 - g);
    }

    function returnLoss(Zin, Z0) {
        const num = mag(sub(Zin, { re: Z0, im: 0 }));
        const den = mag(add(Zin, { re: Z0, im: 0 }));
        const g = num / den;
        return -20 * Math.log10(g);
    }

    function runSweep() {
        const fStart = toNumber(startInput.value);
        const fEnd = toNumber(endInput.value);
        const fStep = toNumber(stepInput.value);
        const rad = toNumber(radInput.value);
        const sleeve = toNumber(sleeveInput.value);
        const Z0 = toNumber(feedInput.value);
        const len = toNumber(lenInput.value);
        const Zc = toNumber(chokeInput.value);

        const freqs = [];
        const swrVals = [];
        const rVals = [];
        const xVals = [];
        const rlVals = [];

        for (let f = fStart; f <= fEnd + 1e-6; f += fStep) {
            const Zr = Zradiator(f, rad);
            const Zs = Zsleeve(f, sleeve);
            const Zp = parallel(Zr, Zs);
            const Zload = series(Zp, Zchoke(f, Zc));
            const Zin = Zfeedline(f, Zload, Z0, len);
            const swr = SWR(Zin, Z0);
            const rl = returnLoss(Zin, Z0);

            freqs.push(f);
            swrVals.push(swr);
            rVals.push(Zin.re);
            xVals.push(Zin.im);
            rlVals.push(rl);
        }

        if (chart) chart.destroy();

        const ctx = document.getElementById("fpswr-chart").getContext("2d");
        chart = new Chart(ctx, {
            type: "line",
            data: {
                labels: freqs,
                datasets: [
                    {
                        label: "SWR",
                        data: swrVals,
                        borderColor: "red",
                        fill: false
                    },
                    {
                        label: "Resistance (Ω)",
                        data: rVals,
                        borderColor: "blue",
                        fill: false
                    },
                    {
                        label: "Reactance (Ω)",
                        data: xVals,
                        borderColor: "green",
                        fill: false
                    },
                    {
                        label: "Return Loss (dB)",
                        data: rlVals,
                        borderColor: "purple",
                        fill: false
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    x: { title: { display: true, text: "Frequency (MHz)" } },
                    y: { title: { display: true, text: "Value" } }
                }
            }
        });

        const minSWR = Math.min(...swrVals);
        const minIndex = swrVals.indexOf(minSWR);
        const fRes = freqs[minIndex];

        summaryDiv.innerHTML = `
            <p><strong>Resonant frequency:</strong> ${fRes.toFixed(2)} MHz</p>
            <p><strong>Minimum SWR:</strong> ${minSWR.toFixed(2)}</p>
            <p><strong>Return loss at resonance:</strong> ${rlVals[minIndex].toFixed(1)} dB</p>
        `;
    }

    runBtn.addEventListener("click", runSweep);
}
