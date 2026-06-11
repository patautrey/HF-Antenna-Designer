// HF-Antenna-Designer/ui/panels/InvertedVPanel.js

export default function InvertedVPanel(onRun) {
    const id = "iv_" + Math.random().toString(36).substring(2, 10);

    return `
    <div class="bg-white border border-amber-300 rounded-xl p-5 shadow">

        <h3 class="text-xl font-bold text-amber-800 mb-4">
            Inverted‑V Dipole Configuration
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>
                <label class="text-sm font-medium text-amber-700">Frequency (MHz)</label>
                <input id="${id}_freq" type="number" value="146"
                       class="mt-1 w-full border border-amber-300 rounded px-2 py-1" />
            </div>

            <div>
                <label class="text-sm font-medium text-amber-700">Apex Angle (deg)</label>
                <input id="${id}_angle" type="number" value="120" min="60" max="170"
                       class="mt-1 w-full border border-amber-300 rounded px-2 py-1" />
            </div>

            <div>
                <label class="text-sm font-medium text-amber-700">Height (m)</label>
                <input id="${id}_height" type="number" value="6"
                       class="mt-1 w-full border border-amber-300 rounded px-2 py-1" />
            </div>

            <div>
                <label class="text-sm font-medium text-amber-700">End‑Effect Factor</label>
                <input id="${id}_eef" type="number" value="0.96" step="0.01"
                       class="mt-1 w-full border border-amber-300 rounded px-2 py-1" />
            </div>

            <div>
                <label class="text-sm font-medium text-amber-700">Seaside Mode</label>
                <select id="${id}_sea"
                        class="mt-1 w-full border border-amber-300 rounded px-2 py-1">
                    <option value="false">Normal</option>
                    <option value="true">Seaside Boost</option>
                </select>
            </div>

        </div>

        <div class="mt-6">
            <button class="px-5 py-2 bg-amber-600 text-white rounded shadow"
                onclick="
                    const config = {
                        type: 'invertedV',
                        frequency: Number(document.getElementById('${id}_freq').value) * 1e6,
                        angleDeg: Number(document.getElementById('${id}_angle').value),
                        height: Number(document.getElementById('${id}_height').value),
                        endEffectFactor: Number(document.getElementById('${id}_eef').value),
                        seaside: document.getElementById('${id}_sea').value === 'true'
                    };
                    (${onRun.toString()})(config);
                ">
                Run Simulation
            </button>
        </div>

    </div>
    `;
}
