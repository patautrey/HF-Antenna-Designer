// HF-Antenna-Designer/ui/panels/LoopPanel.js
// Full configuration panel for the Single-Turn Loop antenna

export default function LoopPanel(onRun) {
    const id = "lp_" + Math.random().toString(36).substring(2, 10);

    return `
    <div id="${id}" class="bg-white border border-amber-300 rounded-xl p-5 shadow">

        <h3 class="text-xl font-bold text-amber-800 mb-4">
            Single‑Turn Loop Configuration
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

            <!-- Frequency -->
            <div>
                <label class="block text-sm font-medium text-amber-700">Frequency (MHz)</label>
                <input id="${id}_freq" type="number" value="146"
                       class="mt-1 w-full border border-amber-300 rounded px-2 py-1
                              focus:ring-amber-500 focus:border-amber-500" />
            </div>

            <!-- Perimeter Factor -->
            <div>
                <label class="block text-sm font-medium text-amber-700">Perimeter Factor (λ)</label>
                <input id="${id}_pf" type="number" value="1.0" step="0.05" min="0.25" max="1.5"
                       class="mt-1 w-full border border-amber-300 rounded px-2 py-1
                              focus:ring-amber-500 focus:border-amber-500" />
            </div>

            <!-- Orientation -->
            <div>
                <label class="block text-sm font-medium text-amber-700">Orientation</label>
                <select id="${id}_orient"
                        class="mt-1 w-full border border-amber-300 rounded px-2 py-1
                               focus:ring-amber-500 focus:border-amber-500">
                    <option value="vertical">Vertical Loop</option>
                    <option value="horizontal">Horizontal Loop</option>
                </select>
            </div>

            <!-- Loss Resistance -->
            <div>
                <label class="block text-sm font-medium text-amber-700">Loss Resistance (Ω)</label>
                <input id="${id}_loss" type="number" value="2.0" step="0.1" min="0.1" max="10"
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
                        type: 'loop',
                        frequency: Number(document.getElementById('${id}_freq').value) * 1e6,
                        perimeterFactor: Number(document.getElementById('${id}_pf').value),
                        orientation: document.getElementById('${id}_orient').value,
                        lossOhms: Number(document.getElementById('${id}_loss').value),
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
