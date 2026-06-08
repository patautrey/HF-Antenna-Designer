
HF Antenna Designer
Maintenance & File Management Guide
============================================================

This document explains how HF_Antenna_Designer is structured, how automatic module discovery works, and how to safely maintain a large system containing 150+ antenna modules, labs, calculators, and engineering tools.

Project Structure Overview

HF_Antenna_Designer uses a clean, scalable directory layout:

/css
style.css

/js
app.js
master-index.js
validate-modules.js
/modules
(all antenna modules live here)

/docs
Maintenance_and_File_Management.md
User_Manual.md
Quick_Start.md
Glossary.md
Developer_Notes.md
Module_Template.md

index.html

The /js/modules/ folder is the heart of the system.
Every antenna module, lab, calculator, and tool lives there.

Automatic Module Discovery

HF_Antenna_Designer uses automatic module discovery, meaning:

• Every .js file inside /js/modules/ is automatically loaded
• No manual imports are required
• No updates to master-index.js are required
• Adding or removing modules is instant

The discovery engine lives in:

/js/master-index.js

It scans the folder and builds a module map dynamically.

Module Naming Rules

To ensure automatic discovery works reliably:

• Filenames must be lowercase
• Use hyphens (-), not spaces or underscores
• Filenames must match the sidebar data-module ID
• Every module must export a default function
• One module per file

Example:

vertical-designer.js
must match:
data-module="vertical-designer"

Adding a New Module

Create a file in /js/modules/

Name it using the naming rules

Add a default export:

export default function(container) {
container.innerHTML = <h2>My New Module</h2>;
}

Add a sidebar entry in index.html:

<div class="menu-item" data-module="my-new-module">My New Module</div>

Done.

Removing a Module

Delete the file from /js/modules/

Remove the corresponding sidebar entry

No other steps are required.

Validation Script

The validation script helps maintain system integrity as the project grows.

File: /js/validate-modules.js

Run it in the browser console to check:

• Missing modules
• Unused modules
• Duplicate module IDs
• Mismatched filenames
• Sidebar entries pointing to non‑existent modules

This is especially useful when adding or renaming modules.

Sidebar Maintenance

The sidebar lives in index.html.
It is intentionally static for clarity and stability.

To add a module:

<div class="menu-item" data-module="my-module">My Module</div>

To remove a module, delete its <div>.

Categories are manually organized for readability.

CSS & Layout Maintenance

All UI styling lives in:

/css/style.css

This stylesheet is intentionally:

• Simple
• Stable
• Predictable
• Easy to maintain

It defines:

• Sidebar layout
• Content area
• Fonts
• Tables
• Forms
• Buttons
• Scrollbars

No JavaScript controls layout.

Versioning & Backups

Recommended best practices:

• Tag releases in GitHub
• Use semantic versioning (v1.4.2)
• Update /docs/ with each release
• Keep a backup of /js/modules/

Developer Workflow Summary

Adding a module:
• Create file → /js/modules/
• Add sidebar entry → index.html
• Done

Removing a module:
• Delete file
• Remove sidebar entry
• Done

Checking system health:
• Run validate-modules.js

Updating UI:
• Edit /css/style.css

Updating router:
• Edit /js/app.js

Updating discovery engine:
• Edit /js/master-index.js

Philosophy of the System

HF_Antenna_Designer is designed to be:

• Modular
• Scalable
• Stable
• Easy to maintain
• Future‑proof

Automatic discovery eliminates 90% of maintenance overhead.
A clean sidebar keeps the UI intuitive.
Simple CSS keeps the layout predictable.

This document ensures the system stays healthy as it grows.
