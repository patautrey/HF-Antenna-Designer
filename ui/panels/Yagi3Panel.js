// HF-Antenna-Designer/ui/panels/Yagi3Panel.js

export default function Yagi3Panel(onRun) {
    const id = "y3_" + Math.random().toString(36).substring(2, 10);

    return `
    <div class="bg-white border border-amber-300 rounded-xl p-5 shadow">

        <h3 class="text-xl font-bold text-amber-800 mb-4">
            3‑Element Yagi Configuration
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>
                <label class="text-sm font-medium text-amber-700">Frequency (MHz)</label>
                <input id="${id}_freq" type="number" value="146"
                       class="mt-1 w-full border border-amber-300 rounded px-2 py-1" />
            </div>

            <div>
                <label class="text-sm font-medium text-amber-700">Spacing Factor (λ)</label>
                <input id="${id}_spacing" type="number" value="0.15" step="0.01"
                       class="mt-1 w-full border border-amber-300 rounded px-2 py-1" />
            </div>

            <div>
                <label class="text-sm font-medium text-amber-700">DX Turbo</label>
                <select id="${id}_dx"
                        class="mt-1 w-full border border-amber-300 rounded px-2 py-1">
                    <option value="false">Disabled</option>
                    <option value="true">Enabled</option>
                </select>
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
                        type: 'yagi3',
                        frequency: Number(document.getElementById('${id}_freq').value) * 1e6,
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
