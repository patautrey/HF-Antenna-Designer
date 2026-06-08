HF Antenna Designer
Module Authoring Template
============================================================

Use this template when creating new modules.

File Naming

Place your file in:

/js/modules/

Use lowercase hyphens:

my-new-module.js

Module Template

export default function(container) {

container.innerHTML = `
<h2>Module Title</h2>

<label>Frequency (MHz)</label>
<input id="freq" type="number" value="7.1">

<button id="run">Calculate</button>

<div id="results"></div>
`;

document.getElementById("run").onclick = () => {
const f = parseFloat(document.getElementById("freq").value);
document.getElementById("results").innerHTML =
<p>Calculated at ${f} MHz</p>;
};
}

Sidebar Entry

Add to index.html:

<div class="menu-item" data-module="my-new-module">My New Module</div>

Validation

Run:

validate-modules.js

to ensure:

• Filename matches ID
• Module loads correctly
• No duplicates
