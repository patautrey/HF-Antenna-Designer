// HF-Antenna-Designer/ui/panels/EndFedPanel.js
// Full configuration panel for the End-Fed Half-Wave antenna

export default function EndFedPanel(onRun) {
    const id = "ef_" + Math.random().toString(36).substring(2, 10);

    return `
    <div id="${id}" class="bg-white border border-amber-300 rounded-xl p-5 shadow">

        <h3 class="text-xl font-bold text-amber-800 mb-4">
            End‑Fed Half‑Wave Configuration
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

            <!-- Frequency -->
            <div>
                <label class="block text-sm font-medium text-amber-700">Frequency (MHz)</label>
                <input id="${id}_freq" type="number" value="146"
                       class="mt-1 w-full border border-amber-300 rounded px-2 py-1
                              focus:ring-amber-500 focus:border-amber-500" />
            </div>

            <!-- Transformer Ratio -->
            <div>
                <label class="block text-sm font-medium text-amber-700">Transformer Ratio (N:1)</label>
                <input id="${id}_ratio" type="number" value="49" min="9" max="64"
                       class="mt-1 w-full border border-amber-300 rounded px-2 py-1
                              focus:ring-amber-500 focus:border-amber-500" />
            </div>

            <!-- End Loading Factor -->
            <div>
                <label class="block text-sm font-medium text-amber-700">End‑Loading Factor</label>
                <input id="${id}_elf" type="number" value="0.96" step="0.01" min="0.85" max="1.0"
                       class="mt-1 w-full border border-amber-300 rounded px-2 py-1
                              focus:ring-amber-500 focus:border-amber-500" />
            </div>

            <!-- Counterpoise Length Factor -->
            <div>
                <label class="block text-sm font-medium text-amber-700">Counterpoise Length Factor (λ)</label>
                <input id="${id}_cpf" type="number" value="0.05" step="0.01" min="0" max="0.25"
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
                        type: 'endFed',
                        frequency: Number(document.getElementById('${id}_freq').value) * 1e6,
                        transformerRatio: Number(document.getElementById('${id}_ratio').value),
                        endLoadingFactor: Number(document.getElementById('${id}_elf').value),
                        counterpoiseLengthFactor: Number(document.getElementById('${id}_cpf').value),
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
