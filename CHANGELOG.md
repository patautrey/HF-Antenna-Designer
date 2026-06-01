# HF Workbench — Changelog

All notable changes to this project are documented here.  
This project uses milestone-based versioning aligned with major feature integrations.

---

## [v1.0-workbench-stable] — 2026‑06‑01
### First unified, fully functional release

#### Added
- Horizontal Loop Designer v2 (complete modernization)
- Unified Boost Panel across Doublet, Skyloop, and Loop
- Feedline Engine (family, type, length, loss modeling)
- Transformer Engine (automatic impedance recommendations)
- Geometry Engine (shared across all horizontal antennas)
- Band Engine (frequency-dependent calculations)
- Logging Engine (structured diagnostics)
- Full help system: User Manual, Quick Start, Glossary

#### Updated
- `workbench-loader.js` updated to load `loop-designer-v2.js`
- Loop Designer UI replaced with modern layout
- Skyloop and Doublet summaries aligned with Loop v2

#### Fixed
- GitHub Pages caching issue (module rename strategy)
- Inconsistent TOA calculations across modules
- Feedline loss discrepancy between coax and ladder line

#### Notes
This is the known-good baseline.  
All modules load correctly, all engines are aligned, and all summaries follow the same structure.

---

## [Unreleased]
### Planned
- Height vs. TOA charts
- Loop vs. Skyloop comparison block
- Band-by-band loop behavior tables
- Geometry diagrams for loop shapes
- Vertical system modernization
- DX Pattern Explorer module
