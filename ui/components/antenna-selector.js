/* ============================================================
   Antenna Selector Component
   ============================================================ */

export function antennaSelector() {
    return `
    <select id="antenna_select">
        <option value="flowerpot">Flowerpot (T2LT)</option>
        <option value="flowerpot-diagram">Flowerpot Diagram</option>
        <option value="flowerpot-buildsheet">Flowerpot Build Sheet</option>
    </select>
    `;
}
