/* ---------------------------------------------------------
   HF Workbench — Master Antenna Index
   Includes ALL antennas added so far:
   - 19 new HF modules
   - All verticals
   - All loops
   - All dipoles
   - All arrays
   - All EFHWs
   - All NVIS antennas
   - All specialty antennas
   - All designers + calculators
--------------------------------------------------------- */

export default function initMasterIndex(root) {
    const container = document.querySelector("#content") || root;
    if (!container) return;

    container.innerHTML = `
        <section class="tool">
            <h2>Antenna Workbench — Master Index</h2>
            <p>Select any antenna or tool below to open its module.</p>

            <h3>Dipoles & Multiband Wires</h3>
            <ul class="index-list">
                <li><button data-module="hf-fan-dipole">Fan Dipole</button></li>
                <li><button data-module="hf-multiband-dipole">Multiband Dipole</button></li>
                <li><button data-module="hf-ocf-dipole">OCF Dipole</button></li>
                <li><button data-module="hf-doublet">Doublet (Ladder-line)</button></li>
                <li><button data-module="hf-extended-double-zepp">Extended Double Zepp</button></li>
                <li><button data-module="hf-random-wire">Random Wire</button></li>
                <li><button data-module="hf-efhw">EFHW (49:1)</button></li>
                <li><button data-module="hf-rybakov">Rybakov Vertical Wire</button></li>
            </ul>

            <h3>Loops</h3>
            <ul class="index-list">
                <li><button data-module="hf-horizontal-loop">Horizontal Loop / Skywire</button></li>
                <li><button data-module="hf-fullwave-loop">Full-Wave Loop</button></li>
                <li><button data-module="hf-vertical-delta-loop">Vertical Delta Loop</button></li>
                <li><button data-module="hf-quad-loop">Quad Loop (Single Element)</button></li>
            </ul>

            <h3>Verticals</h3>
            <ul class="index-list">
                <li><button data-module="hf-quarter-wave-vertical">1/4-Wave Vertical</button></li>
                <li><button data-module="hf-half-wave-vertical">1/2-Wave Vertical</button></li>
                <li><button data-module="hf-five-eighths-vertical">5/8-Wave Vertical</button></li>
                <li><button data-module="hf-loaded-vertical">Loaded Vertical</button></li>
                <li><button data-module="hf-trap-vertical">Trap Vertical</button></li>
                <li><button data-module="hf-multiband-vertical">Multiband Vertical</button></li>
                <li><button data-module="hf-dx-commander">DX Commander Style Vertical</button></li>
                <li><button data-module="hf-passive-radiator-vertical">Passive Radiator Vertical</button></li>
            </ul>

            <h3>Beams</h3>
            <ul class="index-list">
                <li><button data-module="hf-moxon">Moxon Rectangle</button></li>
                <li><button data-module="hf-hexbeam">Hexbeam</button></li>
            </ul>

            <h3>Arrays</h3>
            <ul class="index-list">
                <li><button data-module="hf-lazy-h">Lazy-H</button></li>
                <li><button data-module="hf-sterba-curtain">Sterba Curtain</button></li>
                <li><button data-module="hf-bobtail-curtain">Bobtail Curtain</button></li>
                <li><button data-module="hf-2el-vertical-array">2-Element Vertical Array</button></li>
                <li><button data-module="hf-phased-verticals">Phased Verticals</button></li>
            </ul>

            <h3>NVIS Antennas</h3>
            <ul class="index-list">
                <li><button data-module="hf-nvis-dipole">NVIS Dipole</button></li>
                <li><button data-module="hf-nvis-inverted-v">NVIS Inverted-V</button></li>
                <li><button data-module="hf-nvis-loop">NVIS Loop</button></li>
                <li><button data-module="hf-nvis-reflector">NVIS Reflector Panels</button></li>
            </ul>

            <h3>Designers & Calculators</h3>
            <ul class="index-list">
                <li><button data-module="vertical-designer">Vertical Designer</button></li>
                <li><button data-module="doublet-designer">Doublet Designer</button></li>
                <li><button data-module="nvis-designer">NVIS Designer</button></li>
                <li><button data-module="feedline-calculator">Feedline Calculator</button></li>
                <li><button data-module="dx-propagation">DX Propagation Tool</button></li>
            </ul>

        </section>
    `;

    // Module loader
    container.querySelectorAll("button[data-module]").forEach(btn => {
        btn.addEventListener("click", () => {
            const moduleName = btn.getAttribute("data-module");
            import(`./${moduleName}.js`).then(mod => {
                mod.default(root);
            });
        });
    });
}
