// HF-Antenna-Designer/ui/panels/JPolePanel.js
// Full configuration panel for the J-Pole antenna

export default function JPolePanel(onRun) {
    const id = "jp_" + Math.random().toString(36).substring(2, 10);

    return `
    <div id="${id}" class="bg-white border border-amber-300 rounded-xl p-5 shadow">

        <h3 class="text-xl font-bold text-amber-800 mb-4">
            J‑Pole Antenna Configuration
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

            <!-- Frequency -->
            <div>
                <label class="block text-sm font-medium text-amber-700">Frequency (MHz)</label>
                <input id="${id}_freq" type="number" value="146"
                       class="mt-1 w-full border border-amber-300 rounded px-2 py-1
                              focus:ring-amber-500 focus:border-amber-500" />
            </div>

            <!-- Radiator Factor -->
            <div>
                <label class="block text-sm font-medium text-amber-700">Radiator Factor (λ/2 ×)</label>
                <input id="${id}_rad" type="number" value="1.0" step="0.01" min="0.85" max="1.15"
                       class="mt-1 w-full border border-amber-300 rounded px-2 py-1
                              focus:ring-amber-500 focus:border-amber-500" />
            </div>

            <!-- Stub Factor -->
            <div>
                <label class="block text-sm font-medium text-amber-700">Stub Factor (λ/4 ×)</label>
                <input id="${id}_stub" type="number" value="1.0" step="0.01" min="0.85" max="1.15"
                       class="mt-1 w-full border border-amber-300 rounded px-2 py-1
                              focus:ring-amber-500 focus:border-amber-500" />
            </div>

            <!-- Feed Offset Factor -->
            <div>
                <label class="block text-sm font-medium text-amber-700">Feed Offset Factor (stub ×)</label>
                <input id="${id}_fo" type="number" value="0.20" step="0.01" min="0.05" max="0.40"
                       class="mt-1 w-full border border-amber-300 rounded px-2 py-1
                              focus:ring-amber-500 focus:border-amber-500" />
            </div>

            <!-- Choke Radials -->
            <div>
                <label class="block text-sm font-medium text-amber-700">Choke Radials (optional)</label>
                <input id="${id}_radials" type="number" value="0" min="0" max="8"
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
                        type: 'jPole',
                        frequency: Number(document.getElementById('${id}_freq').value) * 1e6,
                        radiatorFactor: Number(document.getElementById('${id}_rad').value),
                        stubFactor: Number(document.getElementById('${id}_stub').value),
                        feedOffsetFactor: Number(document.getElementById('${id}_fo').value),
                        chokeRadials: Number(document.getElementById('${id}_radials').value),
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
