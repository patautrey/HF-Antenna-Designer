# Antenna Workbench — User Manual

This manual explains how the Workbench models antennas, what each control does, and how to interpret the results.

---

# 1. Core Concepts

## 1.1 Frequency and Wavelength
- You enter frequency in MHz.
- The Workbench computes wavelength λ.
- Electrical height/length = physical dimension ÷ λ.

## 1.2 Geometry Engine
Handles:
- Height
- Length / perimeter
- Loading (top hats, coils)
- Radials
- Ground interaction
- Effective height
- Geometry gain adjustments

## 1.3 Boost Engine
Models:
- Time of day
- Ground screen
- Elevated radials
- Seaside / saltwater
- Feedline losses
- NVIS reflector flag

## 1.4 NVIS Reflector Engine
Models:
- Wire count
- Spacing
- Height
- Gain contribution
- TOA shift

## 1.5 Transformer Engine
Provides:
- Matching notes
- Expected impedance ranges
- Tuner/transformer guidance

---

# 2. Tool Reference

## 2.1 Vertical DX Designer
Purpose: Low‑angle DX vertical.

Inputs:
- Frequency
- Radiator height
- Radial count/length
- Ground type
- DX Turbo height override

Boost:
- Time of day
- Seaside
- Ground screen
- Elevated radials
- Saltwater enhancement
- Feedline type/length
- DX Turbo pattern bonus

Outputs:
- Base gain
- Geometry adjustments
- Boost breakdown
- Total gain
- DX TOA
- Transformer notes

---

## 2.2 Vertical NVIS Designer
Purpose: High‑angle regional NVIS.

Inputs:
- Frequency
- Radiator height
- Top hat
- Ground loss
- Radials

NVIS Reflector:
- Wires
- Spacing
- Height

Boost:
- Time of day
- Seaside
- Ground screen
- Elevated radials
- Feedline type/length

Outputs:
- Base gain
- Geometry adjustments
- Reflector contribution
- Boost breakdown
- Total gain
- NVIS TOA
- Transformer notes

---

## 2.3 Doublet Designer
Purpose: Multiband center‑fed doublet.

Inputs:
- Frequency
- Total wire length
- Height
- Ladder line type/length

NVIS Reflector:
- Wires
- Spacing
- Height

Boost:
- Time of day
- Seaside
- Ground screen
- Coax jumper type/length

Outputs:
- Electrical length
- Base gain
- Geometry adjustments
- Boost breakdown
- Reflector contribution
- Total gain
- TOA
- Transformer notes

---

## 2.4 Skyloop Designer
Purpose: Full‑wave horizontal loop.

Inputs:
- Frequency
- Loop perimeter
- Height

NVIS Reflector:
- Wires
- Spacing
- Height

Boost:
- Time of day
- Seaside
- Ground screen
- Ladder line type/length

Outputs:
- Electrical length
- Base gain
- Geometry adjustments
- Boost breakdown
- Reflector contribution
- Total gain
- NVIS TOA
- Transformer notes

---

# 3. Interpreting Results

## 3.1 Gain (dBi)
Higher = stronger signal in the favored direction.

## 3.2 TOA (degrees)
- Low (5–20°): DX
- Medium (20–40°): mid‑range
- High (60–90°): NVIS

## 3.3 Geometry Adjustments
Shows how physical design affects performance.

## 3.4 Boost Breakdown
Shows environmental/system contributions.

## 3.5 Transformer Notes
Indicates matching difficulty and hardware needs.

---

# 4. Limitations
- Engineering approximations, not NEC‑2/NEC‑4.
- Ground models simplified.
- Use results as guidance, not absolute prediction.
