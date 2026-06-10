// HF-Antenna-Designer/ui/panels/QuadPanel.js
// Full configuration panel for the Quad antenna

export default function QuadPanel(onRun) {
    const id = "qd_" + Math.random().toString(36).substring(2, 10);

    return `
    <div id="${id}" class="bg-white border border-amber-300 rounded-xl p-5 shadow">

        <h3 class="text-xl font-bold text-amber-800 mb-4">
            Quad Antenna Configuration
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

            <!-- Frequency -->
            <div>
                <label class="block text-sm font-medium text-amber-700">Frequency (MHz)</label>
                <input id="${id}_freq" type="number" value="146"
                       class="mt-1 w-full border border-amber-300 rounded px-2 py-1
                              focus:ring-amber-500 focus:border-amber-500" />
            </div>

            <!-- Driven Perimeter Factor -->
            <div>
                <label class="block text-sm font-medium text-amber-700">Driven Loop Perimeter (λ)</label>
                <input id="${id}_dpf" type="number" value="1.0" step="0.01" min="0.8" max="1.2"
                       class="mt-1 w-full border border-amber-300 rounded px-2 py-1
                              focus:ring-amber-500 focus:border-amber-500" />
            </div>

            <!-- Reflector Perimeter Factor -->
            <div>
                <label class="block text-sm font-medium text-amber-700">Reflector Loop Perimeter (λ)</label>
                <input id="${id}_rpf" type="number" value="1.05" step="0.01" min="0.9" max="1.3"
                       class="mt-1 w-full border border-amber-300 rounded px-2 py-1
                              focus:ring-amber-500 focus:border-amber-500" />
            </div>

            <!-- Director Perimeter Factor -->
            <div>
                <label class="block text-sm font-medium text-amber-700">Director Loop Perimeter (λ)</label>
                <input id="${id}_dirpf" type="number" value="0.95" step="0.01" min="0.7" max="1.1"
                       class="mt-1 w-full border border-amber-300 rounded px-2 py-1
                              focus:ring-amber-500 focus:border-amber-500" />
            </div>

            <!-- Number of Directors -->
            <div>
                <label class="block text-sm font-medium text-amber-700">Number of Directors</label>
                <input id="${id}_directors" type="number" value="1" min="0" max="10"
                       class="mt-1 w-full border border-amber-300 rounded px-2 py-1
                              focus:ring-amber-500 focus:border-amber-500" />
            </div>

            <!-- Spacing Factor -->
            <div>
                <label class="block text-sm font-medium text-amber-700">Boom Spacing (λ)</label>
                <input id="${id}_spacing" type="number" value="0.15" step="0.01" min="0.05" max="0.3"
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
                        type: 'quad',
                        frequency: Number(document.getElementById('${id}_freq').value) * 1e6,
                        drivenPerimeterFactor: Number(document.getElementById('${id}_dpf').value),
                        reflectorPerimeterFactor: Number(document.getElementById('${id}_rpf').value),
                        directorPerimeterFactor: Number(document.getElementById('${id}_dirpf').value),
                        directors: Number(document.getElementById('${id}_directors').value),
                        spacingFactor: Number(document.getElementById('${id}_spacing').value),
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
