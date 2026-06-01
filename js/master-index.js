// js/master-index.js
// HF Antenna Designer — Master Router & UI
// Uses your existing antenna modules; no renaming required.

import { PlotEngine } from "./plot-engine.js";

// ---------------------------------------------------------------------------
// MODULE MANIFEST
// ---------------------------------------------------------------------------
// IMPORTANT: All paths now use "../" because antenna files are in repo root.

const MODULES = [
    // Horizontal / loops / dipoles
    { id: "doublet",        label: "HF Doublet Designer",        category: "Horizontal",   path: "../doublet-designer.js" },
    { id: "skyloop",        label: "Skyloop Designer",           category: "Horizontal",   path: "../skyloop-designer.js" },
    { id: "loop",           label: "Horizontal Loop Designer",   category: "Horizontal",   path: "../loop-designer.js" },
    { id: "fullwave-loop",  label: "Fullwave Loop Designer",     category: "Horizontal",   path: "../fullwave-loop-designer.js" },
    { id: "horizontal-loop",label: "HF Horizontal Loop",         category: "Horizontal",   path: "../horizontal-loop-designer.js" },
    { id: "fan-dipole",     label: "Fan Dipole Designer",        category: "Horizontal",   path: "../fan-dipole-designer.js" },
    { id: "nvis-dipole",    label: "NVIS Dipole Designer",       category: "Horizontal",   path: "../nvis-dipole-designer.js" },
    { id: "ocf-dipole",     label: "OCF Dipole Designer",        category: "Horizontal",   path: "../ocf-dipole-designer.js" },

    // Verticals
    { id: "vertical-dx",    label: "Vertical DX Designer",       category: "Vertical",     path: "../vertical-dx-designer.js" },
    { id: "vertical-nvis",  label: "Vertical NVIS Designer",     category: "Vertical",     path: "../vertical-nvis-designer.js" },
    { id: "vertical",       label: "General Vertical Designer",  category: "Vertical",     path: "../vertical-designer.js" },
    { id: "quarterwave",    label: "Quarter-wave Vertical",      category: "Vertical",     path: "../quarterwave-designer.js" },
    { id: "58wave",         label: "5/8-wave Vertical",          category: "Vertical",     path: "../58wave-designer.js" },
    { id: "vertical-array-2el", label: "Vertical Array 2el",     category: "Vertical",     path: "../vertical-array-2el-designer.js" },
    { id: "vertical-array-3el", label: "Vertical Array 3el",     category: "Vertical",     path: "../vertical-array-3el-designer.js" },
    { id: "rybakov",        label: "Rybakov Vertical Designer",  category: "Vertical",     path: "../rybakov-designer.js" },

    // Arrays / beams / quads
    { id: "yagi",           label: "Yagi Designer",              category: "Arrays & Beams", path: "../yagi-designer.js" },
    { id: "lpda",           label: "LPDA Designer",              category: "Arrays & Beams", path: "../lpda-designer.js" },
    { id: "quad",           label: "Quad Designer",              category: "Arrays & Beams", path: "../quad-designer.js" },
    { id: "moxon",          label: "Moxon Designer",             category: "Arrays & Beams", path: "../moxon-designer.js" },
    { id: "curtain",        label: "Curtain Array Designer",     category: "Arrays & Beams", path: "../curtainarray-designer.js" },
    { id: "rhombic",        label: "Rhombic Designer",           category: "Arrays & Beams", path: "../rhombic-designer.js" },
    { id: "sterba",         label: "Sterba Curtain Designer",    category: "Arrays & Beams", path: "../sterba-designer.js" },
    { id: "vbeam",          label: "V-Beam Designer",            category: "Arrays & Beams", path: "../vbeam-designer.js" },
    { id: "foursquare",     label: "Foursquare Designer",        category: "Arrays & Beams", path: "../foursquare-designer.js" },
    { id: "bobtail",        label: "Bobtail Curtain Designer",   category: "Arrays & Beams", path: "../bobtail-designer.js" },

    // End-fed / EFHW / random wire
    { id: "efhw",           label: "EFHW Designer",              category: "End-Fed & Random", path: "../efhw-designer.js" },
    { id: "efhw-lab",       label: "EFHW Lab",                   category: "End-Fed & Random", path: "../efhw-lab.js" },
    { id: "randomwire",     label: "Random Wire Designer",       category: "End-Fed & Random", path: "../randomwire-designer.js" },
    { id: "terminated-dipole", label: "Terminated Dipole",       category: "End-Fed & Random", path: "../terminated-dipole.js" },
    { id: "hf-randomwire-9to1", label: "Random Wire 9:1",        category: "End-Fed & Random", path: "../hf-random-wire-9to1.js" },

    // Long wires / beverages
    { id: "beverage",       label: "Beverage Designer",          category: "Long Wire & Beverage", path: "../beverage-designer.js" },
    { id: "hf-beverage",    label: "HF Beverage",                category: "Long Wire & Beverage", path: "../hf-beverage.js" },
    { id: "hf-beverage-reverse-fed", label: "HF Beverage Reverse-fed", category: "Long Wire & Beverage", path: "../hf-beverage-reverse-fed.js" },
    { id: "hf-longwire",    label: "HF Longwire",                category: "Long Wire & Beverage", path: "../hf-longwire.js" },
    { id: "hf-sloping-longwire-directional", label: "Sloping Longwire Directional", category: "Long Wire & Beverage", path: "../hf-sloping-longwire-directional.js" },

    // Labs & tools
    { id: "feedline-lab",   label: "Feedline Lab",               category: "Labs & Tools",  path: "../coax-lab.js" },
    { id: "ground-lab",     label: "Ground Lab",                 category: "Labs & Tools",  path: "../ground-lab.js" },
    { id: "ground-loss-lab",label: "Ground Loss Lab",            category: "Labs & Tools",  path: "../ground-loss-lab.js" },
    { id: "pattern-lab",    label: "Pattern Lab",                category: "Labs & Tools",  path: "../pattern-lab.js" },
    { id: "swr-lab",        label: "SWR Lab",                    category: "Labs & Tools",  path: "../swr-lab.js" },
    { id: "noise-lab",      label: "Noise Lab",                  category: "Labs & Tools",  path: "../noise-lab.js" },
    { id: "noise-snr-lab",  label: "Noise SNR Lab",              category: "Labs & Tools",  path: "../noise-snr-lab.js" },
    { id: "link-budget",    label: "Link Budget",                category: "Labs & Tools",  path: "../link-budget.js" },
    { id: "loss-budget",    label: "Loss Budget",                category: "Labs & Tools",  path: "../loss-budget.js" },
    { id: "propagation",    label: "Propagation Explorer",       category: "Labs & Tools",  path: "../propagation.js" },
    { id: "muf-luf",        label: "MUF/LUF Explorer",           category: "Labs & Tools",  path: "../muf-luf-explorer.js" },
    { id: "system-gain",    label: "System Gain",                category: "Labs & Tools",  path: "../system-gain.js" },
    { id: "rf-safety",      label: "RF Safety",                  category: "Labs & Tools",  path: "../rf-safety.js" },

    // Docs
    { id: "quick-start",    label: "Quick Start Guide",          category: "Documentation", path: "../quick-start.js" },
    { id: "user-manual",    label: "User Manual",                category: "Documentation", path: "../user-manual.js" },
    { id: "glossary",       label: "Glossary",                   category: "Documentation", path: "../glossary.js" }
];

// ---------------------------------------------------------------------------
// (The rest of the file stays exactly the same as the previous version.)
// ---------------------------------------------------------------------------

// ... [KEEP ALL OTHER CODE EXACTLY AS IS] ...
