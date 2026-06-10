// HF-Antenna-Designer/ui/panels/FlowerpotPanel.js
// Full configuration panel for the Flowerpot antenna

export default function FlowerpotPanel(onRun) {
    const id = "fp_" + Math.random().toString(36).substring(2, 10);

    return `
    <div id="${id}" class="bg-white border border-amber-300 rounded-xl p-5 shadow">

        <h3 class="text-xl font-bold text-amber-800 mb-4">
            Flowerpot Antenna Configuration
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

            <!-- Frequency -->
            <div>
                <label class="block text-sm font-medium text-amber-700">Frequency (MHz)</label>
                <input id="${id}_freq" type="number" value="146"
                       class="mt-1 w-full border border-amber-300 rounded px-2 py-1
                              focus:ring-amber-500 focus:border-amber-500" />
            </div>

            <!-- Velocity Factor -->
            <div>
                <label class="block text-sm font-medium text-amber-700">Coax Velocity Factor</label>
                <input id="${id}_vf" type="number" value="0.66" step="0.01" min="0.5" max="0.9"
                       class="mt-1 w-full border border-amber-300 rounded px-2 py-1
                              focus:ring-amber-500 focus:border-amber-500" />
            </div>

            <!-- PVC OD -->
            <div>
                <label class="block text-sm font-medium text-amber-700">PVC Outer Diameter (mm)</label>
                <input id="${id}_pvc" type="number" value="25" min="10" max="60"
                       class="mt-1 w-full border border-amber-300 rounded px-2 py-1
                              focus:ring-amber-500 focus:border-amber-500" />
            </div>

            <!-- Target Choke Reactance -->
            <div>
                <label class="block text-sm font-medium text-amber-700">Target Choke Reactance (Ω)</label>
                <input id="${id}_react" type="number" value="500" min="100" max="2000"
                       class="mt-1 w-full border border-amber-300 rounded px-2 py-1
                              focus:ring-amber-500 focus:border-amber-500" />
            </div>

            <!-- Radials -->
            <div>
                <label class="block text-sm font-medium text-amber-700">Radial Count</label>
                <input id="${id}_radials" type="number" value="0" min="0" max="32"
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
                        type: 'flowerpot',
                        frequency: Number(document.getElementById('${id}_freq').value) * 1e6,
                        vf: Number(document.getElementById('${id}_vf').value),
                        pvcOD: Number(document.getElementById('${id}_pvc').value),
                        targetReactance: Number(document.getElementById('${id}_react').value),
                        radials: Number(document.getElementById('${id}_radials').value),
                        elevatedRadials: document.getElementById('${id}_elev').value === 'true',
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
