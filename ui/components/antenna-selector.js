/* ============================================================
   Antenna Selector Component
   ============================================================ */

export function antennaSelector() {
    return `
    <select id="antenna_select">
        <option value="flowerpot">Flowerpot (T2LT)</option>
        <option value="flowerpot-diagram">Flowerpot Diagram</option>
        <option value="flowerpot-buildsheet">Flowerpot Build Sheet</option>
        <option value="flowerpot-multiband">Multi‑Band Flowerpot Designer</option>
        <option value="flowerpot-performance">Flowerpot Performance Analyzer</option>
    </select>
    `;
}
