// HF-Antenna-Designer/ui/panels/DipolePanel.js
// Full configuration panel for the Half-Wave Dipole antenna

export default function DipolePanel(onRun) {
    const id = "dp_" + Math.random().toString(36).substring(2, 10);

    return `
    <div id="${id}" class="bg-white border border-amber-300 rounded-xl p-5 shadow">

        <h3 class="text-xl font-bold text-amber-800 mb-4">
            Half‑Wave Dipole Configuration
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

            <!-- Frequency -->
            <div>
                <label class="block text-sm font-medium text-amber-700">Frequency (MHz)</label>
                <input id="${id}_freq" type="number" value="146"
                       class="mt-1 w-full border border-amber-300 rounded px-2 py-1
                              focus:ring-amber-500 focus:border-amber-500" />
            </div>

            <!-- Height Above Ground -->
            <div>
                <label class="block text-sm font-medium text-amber-700">Height Above Ground (m)</label>
                <input id="${id}_height" type="number" value="6" min="1" max="30"
                       class="mt-1 w-full border border-amber-300 rounded px-2 py-1
                              focus:ring-amber-500 focus:border-amber-500" />
            </div>

            <!-- End-Effect Factor -->
            <div>
                <label class="block text-sm font-medium text-amber-700">End‑Effect Factor</label>
                <input id="${id}_eef" type="number" value="0.96" step="0.01" min="0.85" max="1.0"
                       class="mt-1 w-full border border-amber-300 rounded px-2 py-1
                              focus:ring-amber-500 focus:border-amber-500" />
            </div>

            <!-- Seaside Mode -->
            <div>
                <label class="block text-sm font-medium text-amber-700">Seaside Mode</label>
                <select id="${id}_sea"
                        class="mt-1 w-full border border-amber-300 rounded px-2 py-1
                               focus:ring-amber-500 focus:border-amber-500">
                    <option value="false">Normal Ground</option>
                    <option value="true">Seaside Boost</option>
                </select>
            </div>

        </div>

        <!-- Run Button -->
        <div class="mt-6">
            <button
                class="px-5 py-2 bg-amber-600 text-white rounded shadow hover:bg-amber-700"
                onclick="
                    const config = {
                        type: 'dipole',
                        frequency: Number(document.getElementById('${id}_freq').value) * 1e6,
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
