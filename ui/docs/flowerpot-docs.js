export const FlowerpotDocs = `
<h2>Flowerpot (T2LT) Antenna</h2>

<p>The Flowerpot is a coaxial-sleeve vertical antenna built from a single piece of coax.</p>

<h3>Tuning Instructions</h3>
<ol>
    <li>Assemble the antenna slightly long.</li>
    <li>Use a NanoVNA to sweep the band.</li>
    <li>Find the lowest SWR frequency.</li>
    <li>If resonance is below target, trim the elements.</li>
    <li>Use the ratio method:<br>
        <code>Lnew = Lold × (f_current / f_target)</code>
    </li>
    <li>Trim in 2–3 mm increments (VHF/UHF).</li>
    <li>Ensure the choke has enough turns.</li>
</ol>

<h3>Coax Types Supported</h3>
<p>RG58, RG8X, RG174, LMR240, LMR400, RG6</p>

<h3>PVC Diameter</h3>
<p>The choke turn count is computed automatically based on PVC OD.</p>
`;
