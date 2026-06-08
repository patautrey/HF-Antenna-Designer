HF Antenna Designer
Developer Notes
============================================================

This document provides internal guidance for developers working on HF_Antenna_Designer.

Module Requirements

Every module must:

• Live in /js/modules/
• Be named using lowercase hyphens
• Match its data-module ID
• Export a default function

Example:

export default function(container) {
container.innerHTML = <h2>Example Module</h2>;
}

Automatic Discovery

master-index.js scans /js/modules/ and loads all modules automatically.
No manual imports are required.

Router

app.js handles:

• Module loading
• Active menu highlighting
• Default startup module

Sidebar

Sidebar is static HTML in index.html.
Categories are manually organized.

CSS

All UI styling lives in:

/css/style.css

The layout is intentionally simple and stable.

Validation

Use:

validate-modules.js

to check:

• Missing modules
• Unused modules
• Duplicates
• Mismatched IDs
