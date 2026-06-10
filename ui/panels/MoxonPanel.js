// HF-Antenna-Designer/ui/panels/MoxonPanel.js
// Full configuration panel for the Moxon Rectangle antenna

export default function MoxonPanel(onRun) {
    const id = "mx_" + Math.random().toString(36).substring(2, 10);

    return `
    <div id="${id}" class="bg-white border border-amber-300 rounded-xl p-5 shadow">

        <h3 class="text-xl font-bold text-amber-800 mb-4">
            Moxon Rectangle Configuration
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

            <!-- Frequency -->
            <div>
                <label class="block text-sm font-medium text-amber-700">Frequency (MHz)</label>
                <input id="${id}_freq" type="number" value="146"
                       class="mt-1 w-full border border-amber-300 rounded px-2 py-1
                              focus:ring-amber-500 focus:border-amber-500" />
            </div>

            <!-- A Dimension -->
            <div>
                <label class="block text-sm font-medium text-amber-700">A Dimension (λ)</label>
                <input id="${id}_A" type="number" value="0.28" step="0.01" min="0.15" max="0.40"
                       class="mt-1 w-full border border-amber-300 rounded px-2 py-1
                              focus:ring-amber-500 focus:border-amber-500" />
            </div>

            <!-- B Dimension -->
            <div>
                <label class="block text-sm font-medium text-amber-700">B Dimension (λ)</label>
                <input id="${id}_B" type="number" value="0.08" step="0.01" min="0.03" max="0.15"
                       class="mt-1 w-full border border-amber-300 rounded px-2 py-1
                              focus:ring-amber-500 focus:border-amber-500" />
            </div>

            <!-- C Dimension -->
            <div>
                <label class="block text-sm font-medium text-amber-700">C Dimension (λ)</label>
                <input id="${id}_C" type="number" value="0.12" step="0.01" min="0.08" max="0.20"
                       class="mt-1 w-full border border-amber-300 rounded px-2 py-1
                              focus:ring-amber-500 focus:border-amber-500" />
            </div>

            <!-- D Dimension -->
            <div>
                <label class="block text-sm font-medium text-amber-700">D Dimension (λ)</label>
                <input id="${id}_D" type="number" value="0.06" step="0.01" min="0.03" max="0.12"
                       class="mt-1 w-full border border-amber-300 rounded px-2 py-1
                              focus:ring-amber-500 focus:border-amber-500" />
            </div>

            <!-- DX Turbo -->
            <div>
                <label class="block text-sm font-medium text-amber-700">DX Turbo Mode</label>
                <select id="${id}_dx"
                        class="mt-1 w-full border border-amber-300 rounded px-2 py-1
                               focus:ring-amber-500 focus:border-amber-500">
                    <option value="false">Disabled</option>
                    <option value="true">Enabled</option>
                </select>
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
                        type: 'moxon',
                        frequency: Number(document.getElementById('${id}_freq').value) * 1e6,
                        A: Number(document.getElementById('${id}_A').value),
                        B: Number(document.getElementById('${id}_B').value),
                        C: Number(document.getElementById('${id}_C').value),
                        D: Number(document.getElementById('${id}_D').value),
                        dxTurbo: document.getElementById('${id}_dx').value === 'true',
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
