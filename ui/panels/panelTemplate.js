// HF-Antenna-Designer/ui/panels/panelTemplate.js
// Universal antenna configuration panel (Tailwind + Amber theme)

export default function panelTemplate(onRun) {
    const id = "panel_" + Math.random().toString(36).substring(2, 10);

    return `
    <div id="${id}" class="bg-white border border-amber-300 rounded-xl p-5 shadow">

        <h3 class="text-xl font-bold text-amber-800 mb-4">
            Antenna Configuration
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

            <!-- Frequency -->
            <div>
                <label class="block text-sm font-medium text-amber-700">Frequency (MHz)</label>
                <input id="${id}_freq" type="number" value="146"
                       class="mt-1 w-full border border-amber-300 rounded px-2 py-1
                              focus:ring-amber-500 focus:border-amber-500" />
            </div>

            <!-- Coax Type -->
            <div>
                <label class="block text-sm font-medium text-amber-700">Coax Type</label>
                <select id="${id}_coax"
                        class="mt-1 w-full border border-amber-300 rounded px-2 py-1
                               focus:ring-amber-500 focus:border-amber-500">
                    <option value="RG-58">RG‑58</option>
                    <option value="RG-8X">RG‑8X</option>
                    <option value="RG-213">RG‑213</option>
                    <option value="LMR-240">LMR‑240</option>
                    <option value="LMR-400">LMR‑400</option>
                </select>
            </div>

            <!-- PVC OD -->
            <div>
                <label class="block text-sm font-medium text-amber-700">PVC OD (mm)</label>
                <input id="${id}_pvc" type="number" value="25"
                       class="mt-1 w-full border border-amber-300 rounded px-2 py-1
                              focus:ring-amber-500 focus:border-amber-500" />
            </div>

            <!-- Mounting Mode -->
            <div>
                <label class="block text-sm font-medium text-amber-700">Mounting Mode</label>
                <select id="${id}_mount"
                        class="mt-1 w-full border border-amber-300 rounded px-2 py-1
                               focus:ring-amber-500 focus:border-amber-500">
                    <option value="center">Center‑Mounted</option>
                    <option value="end">End‑Mounted</option>
                    <option value="side">Side‑Mounted</option>
                </select>
            </div>

            <!-- Target Reactance -->
            <div>
                <label class="block text-sm font-medium text-amber-700">Target Choke Reactance (Ω)</label>
                <input id="${id}_react" type="number" value="500"
                       class="mt-1 w-full border border-amber-300 rounded px-2 py-1
                              focus:ring-amber-500 focus:border-amber-500" />
            </div>

        </div>

        <!-- Run Button -->
        <div class="mt-6">
            <button
                class="px-5 py-2 bg-amber-600 text-white rounded shadow hover:bg-amber-700"
                onclick="
                    const config = {
                        type: document.getElementById('${id}_type')?.value || 'flowerpot',
                        frequency: Number(document.getElementById('${id}_freq').value) * 1e6,
                        coaxType: document.getElementById('${id}_coax').value,
                        pvcOD: Number(document.getElementById('${id}_pvc').value),
                        pvcMode: document.getElementById('${id}_mount').value,
                        targetReactance: Number(document.getElementById('${id}_react').value)
                    };
                    (${onRun.toString()})(config);
                ">
                Run Simulation
            </button>
        </div>

    </div>
    `;
}
