// HF-Antenna-Designer/app/runSimulation.js
// Simulation orchestrator: loads engine, runs calculation, renders dashboard

import renderDashboard, { renderDashboardPlots } from "../ui/renderer/renderer.js";

/**
 * Runs a simulation and renders the full NEC-style dashboard.
 *
 * @param {object} app - The engine registry (from app.js)
 * @param {object} config - User-selected antenna configuration
 * @param {string} targetId - DOM element ID where the dashboard will be injected
 */
export default async function runSimulation(app, config, targetId) {
    const target = document.getElementById(targetId);

    if (!target) {
        console.error(`runSimulation: target element '${targetId}' not found`);
        return;
    }

    // ------------------------------------------------------------
    // 1. Load the correct engine factory
    // ------------------------------------------------------------
    const engineFactory = app[config.type];

    if (typeof engineFactory !== "function") {
        target.innerHTML = `
            <div class="p-4 text-red-700 bg-red-100 border border-red-300 rounded">
                Error: Antenna type '${config.type}' is not registered.
            </div>
        `;
        return;
    }

    // ------------------------------------------------------------
    // 2. Instantiate engine
    // ------------------------------------------------------------
    let engine;
    try {
        engine = engineFactory(config);
    } catch (err) {
        target.innerHTML = `
            <div class="p-4 text-red-700 bg-red-100 border border-red-300 rounded">
                Engine initialization failed.<br>${err.message}
            </div>
        `;
        console.error(err);
        return;
    }

    // ------------------------------------------------------------
    // 3. Run simulation
    // ------------------------------------------------------------
    let result;
    try {
        result = await engine.calculate();
    } catch (err) {
        target.innerHTML = `
            <div class="p-4 text-red-700 bg-red-100 border border-red-300 rounded">
                Simulation failed.<br>${err.message}
            </div>
        `;
        console.error(err);
        return;
    }

    // ------------------------------------------------------------
    // 4. Render dashboard HTML
    // ------------------------------------------------------------
    try {
        const html = renderDashboard(result, config);
        target.innerHTML = html;
    } catch (err) {
        target.innerHTML = `
            <div class="p-4 text-red-700 bg-red-100 border border-red-300 rounded">
                Dashboard rendering failed.<br>${err.message}
            </div>
        `;
        console.error(err);
        return;
    }

    // ------------------------------------------------------------
    // 5. Render radiation pattern plots
    // ------------------------------------------------------------
    try {
        renderDashboardPlots(result);
    } catch (err) {
        console.error("Plot rendering failed:", err);
    }
}
