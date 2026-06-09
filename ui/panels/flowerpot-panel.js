render() {
    return `
    <div class="antenna-panel">
        <h2>Flowerpot (T2LT) Antenna</h2>

        <label>Band Preset</label>
        <select id="fp_preset">
            <option value="">Custom</option>
            <option value="2m">2m (146 MHz)</option>
            <option value="70cm">70cm (446 MHz)</option>
            <option value="6m">6m (52 MHz)</option>
            <option value="10m">10m (28.5 MHz)</option>
            <option value="gmrs">GMRS (462 MHz)</option>
            <option value="cb">CB (27 MHz)</option>
        </select>

        <label>Frequency (MHz)</label>
        <input id="fp_freq" type="number" value="146">

        <label>Coax Type</label>
        <select id="fp_coax">
            <option>RG58</option>
            <option>RG8X</option>
            <option>RG174</option>
            <option>LMR240</option>
            <option>LMR400</option>
            <option>RG6</option>
        </select>

        <label>PVC Outside Diameter (mm)</label>
        <input id="fp_pvc_od" type="number" value="25">

        <label>Mounting Mode</label>
        <select id="fp_pvc_mode">
            <option value="outside">Outside PVC</option>
            <option value="inside">Inside PVC</option>
        </select>

        <label>Target Choke Reactance (Ω)</label>
        <input id="fp_xl" type="number" value="500">

        <button id="fp_run">Run Simulation</button>

        <h3>Tuning Guide</h3>
        <div class="tuning-guide">
            <p><b>1.</b> Build slightly long.</p>
            <p><b>2.</b> Sweep with a NanoVNA.</p>
            <p><b>3.</b> Find lowest SWR.</p>
            <p><b>4.</b> If resonance is low, trim.</p>
            <p><b>5.</b> Ratio method:</p>
            <pre>Lnew = Lold × (f_current / f_target)</pre>
            <p><b>6.</b> Trim in small increments.</p>
            <p><b>7.</b> Add choke turns if SWR shifts when touching coax.</p>
        </div>

        <div id="fp_results"></div>
    </div>
    `;
}
