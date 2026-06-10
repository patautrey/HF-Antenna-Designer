// HF-Antenna-Designer/ui/panels/VerticalYagiPanel.js
// Full configuration panel for the Vertical Yagi antenna

export default function VerticalYagiPanel(onRun) {
    const id = "vy_" + Math.random().toString(36).substring(2, 10);

    return `
    <div id="${id}" class="bg-white border border-amber-300 rounded-xl p-5 shadow">

        <h3 class="text-xl font-bold text-amber-800 mb-4">
            Vertical‑Yagi Configuration
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

            <!-- Frequency -->
            <div>
                <label class="block text-sm font-medium text-amber-700">Frequency (MHz)</label>
                <input id="${id}_freq" type="number" value="146"
                       class="mt-1 w-full border border-amber-300 rounded px-2 py-1
                              focus:ring-amber-500 focus:border-amber-500" />
            </div>

            <!-- Directors -->
            <div>
                <label class="block text-sm font-medium text-amber-700">Number of Directors</label>
                <input id="${id}_directors" type="number" value="2" min="0" max="10"
                       class="mt-1 w-full border border-amber-300 rounded px-2 py-1
                              focus:ring-amber-500 focus:border-amber-500" />
            </div>

            <!-- Director Spacing -->
            <div>
                <label class="block text-sm font-medium text-amber-700">Director Spacing (λ)</label>
                <input id="${id}_spacing" type="number" value="0.15" step="0.01"
                       class="mt-1 w-full border border-amber-300 rounded px-2 py-1
                              focus:ring-amber-500 focus:border-amber-500" />
            </div>

            <!-- Director Length Factor -->
            <div>
                <label class="block text-sm font-medium text-amber-700">Director Length Factor (λ)</label>
                <input id="${id}_dlf" type="number" value="0.45" step="0.01"
                       class="mt-1 w-full border border-amber-300 rounded px-2 py-1
                              focus:ring-amber-500 focus:border-amber-500" />
            </div>

            <!-- Reflector Length Factor -->
            <div>
                <label class="block text-sm font-medium text-amber-700">Reflector Length Factor (λ)</label>
                <input id="${id}_rlf" type="number" value="0.55" step="0.01"
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

            <!-- Seaside -->
            <div>
                <label class="block text-sm font-medium text-amber-700">Seaside Mode</label>
                <select id="${id}_sea"
                        class="mt-1 w-full border border-amber-300 rounded px-2 py-1
                               focus:ring-amber-500 focus:border-amber-500">
                    <option value="false">Normal Ground</option>
                    <option value="true">Seaside Boost</option>
                </select>
            </div>

            <!-- Radials -->
            <div>
                <label class="block text-sm font-medium text-amber-700">Radial Count</label>
                <input id="${id}_radials" type="number" value="4" min="0" max="32"
                       class="mt-1 w-full border border-amber-300 rounded px-2 py-1
                              focus:ring-amber-500 focus:border-amber-500" />
            </div>

            <!-- Radial Length Factor -->
            <div>
                <label class="block text-sm font-medium text-amber-700">Radial Length Factor (λ)</label>
                <input id="${id}_rlf2" type="number" value="0.25" step="0.01"
                       class="mt-1 w-full border border-amber-300 rounded px-2 py-1
                              focus:ring-amber-500 focus:border-amber-500" />
            </div>

            <!-- Elevated Radials -->
            <div>
                <label class="block text-sm font-medium text-amber-700">Elevated Radials</label>
                <select id="${id}_elev"
                        class="mt-1 w-full border border-amber-300 rounded px-2 py-1
                               focus:ring-amber-500 focus:border-amber-500">
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                </select>
            </div>

        </div>

        <!-- Run Button -->
        <div class="mt-6">
            <button
                class="px-5 py-2 bg-amber-600 text-white rounded shadow hover:bg-amber-700"
                onclick="
                    const config = {
                        type: 'verticalYagi',
                        frequency: Number(document.getElementById('${id}_freq').value) * 1e6,
                        directors: Number(document.getElementById('${id}_directors').value),
                        directorSpacing: Number(document.getElementById('${id}_spacing').value),
                        directorLengthFactor: Number(document.getElementById('${id}_dlf').value),
                        reflectorLengthFactor: Number(document.getElementById('${id}_rlf').value),
                        dxTurbo: document.getElementById('${id}_dx').value === 'true',
                        seaside: document.getElementById('${id}_sea').value === 'true',
                        radials: Number(document.getElementById('${id}_radials').value),
                        radialLengthFactor: Number(document.getElementById('${id}_rlf2').value),
                        elevatedRadials: document.getElementById('${id}_elev').value === 'true'
                    };
                    (${onRun.toString()})(config);
                ">
                Run Simulation
            </button>
        </div>

    </div>
    `;
}
