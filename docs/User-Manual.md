# Antenna Workbench — User Manual

This manual explains how the Workbench thinks, what each control does, and how to interpret the results.

---

## 1. Core concepts

### 1.1 Frequency and band

- You enter **frequency in MHz**.
- The Workbench maps it to an HF band (e.g., 3.5–4.0 MHz → 80m).
- Wavelength λ is derived from frequency and used for:
  - Electrical height
  - Electrical length
  - Loop perimeter fraction

### 1.2 Geometry vs. Boost

- **Geometry**:
  - Physical dimensions (height, length, perimeter).
  - Loading (top hats, coils, linear loading).
  - Radials and ground interaction.
  - This is handled by the **GeometryEngine**.

- **Boost**:
  - Environmental and system factors:
    - Time of day
    - Ground quality
    - Seaside / saltwater
    - Ground screens
    - Elevated radials
    - Feedline losses
    - NVIS reflector flag
  - This is handled by the **BoostEngine**.

### 1.3 NVIS reflector

- Some tools support an **NVIS reflector**:
  - A wire grid or reflector placed below the antenna.
  - It can increase high‑angle gain and shape the TOA.
  - Modeled by the **NVIS Reflector Engine**.

### 1.4 Transformer and matching

- Many designs require a **matching transformer** or tuner.
- The **TransformerEngine** provides:
  - Notes on likely impedance ranges.
  - Suggested transformer ratios or tuner requirements.
  - Warnings when a design is difficult to match.

---

## 2. Vertical DX Designer

### 2.1 Purpose

- Models a **1/4‑wave style vertical** with radials, optimized for DX.
- Focuses on **low takeoff angles** and ground‑dependent performance.

### 2.2 Inputs

- **Frequency (MHz)** — design frequency.
- **Radiator height (m)** — physical height of the vertical.
- **Radial count** — number of radials.
- **Radial length (m)** — length of each radial.
- **Ground type** — average, poor, good, saltwater.
- **DX Turbo height override** — forces modeling near 0.7λ height.

**Boost panel:**

- **Time of day** — day, night, dawn, dusk.
- **Seaside** — models strong sea gain.
- **Ground screen** — radial mesh or screen under the antenna.
- **Elevated radials** — radials raised above ground.
- **Saltwater enhancement** — extra gain for saltwater environments.
- **Feedline type** — coax type.
- **Feedline length (ft)** — coax length.
- **DX Turbo pattern bonus** — extra pattern shaping for DX.

### 2.3 Outputs

- **Base Gain (dBi)** — from geometry alone.
- **Geometry adjustments** — notes from GeometryEngine.
- **Boost breakdown** — each boost component and its dB contribution.
- **Total estimated gain (dBi)** — combined result.
- **Estimated DX TOA (°)** — main lobe elevation angle.
- **Transformer note** — matching guidance.

---

## 3. Vertical NVIS Designer

### 3.1 Purpose

- Models a **short vertical** optimized for **NVIS** (high‑angle) coverage.
- Useful for regional HF coverage on 80m/40m.

### 3.2 Inputs

- **Frequency (MHz)**.
- **Radiator height (m)** — typically low.
- **Top-hat length (m)** — optional capacitive loading.
- **Ground loss (Ω)** — estimated ground resistance.
- **Radial count / length (m)** — ground system.

**NVIS reflector:**

- **Enable NVIS reflector** — toggles reflector modeling.
- **Reflector wires** — number of wires in the grid.
- **Reflector spacing (m)** — spacing between wires.
- **Reflector height (m)** — height above ground.

**Boost panel:**

- **Time of day**.
- **Seaside**, **Ground screen**, **Elevated radials**.
- **Feedline type**, **Feedline length (ft)**.

### 3.3 Outputs

- **Base Gain (dBi)** — from geometry.
- **Geometry adjustments**.
- **Boost breakdown**.
- **NVIS reflector** — gain and TOA effects.
- **Total estimated gain (dBi)**.
- **Estimated NVIS TOA (°)** — usually high (60–90°).
- **Transformer note**.

---

## 4. Doublet Designer

### 4.1 Purpose

- Models a **center‑fed doublet** with balanced feedline.
- Designed for **multiband use** with a tuner and ladder line.

### 4.2 Inputs

- **Frequency (MHz)**.
- **Total wire length (m)** — full tip‑to‑tip length.
- **Height (m)** — center height.
- **Feedline type** — 450Ω, 300Ω, 600Ω.
- **Feedline length (ft)**.

**NVIS reflector:**

- Same controls as NVIS vertical.

**Boost panel:**

- **Time of day**.
- **Seaside**, **Ground screen**.
- **Coax jumper type** and **length (ft)** — short coax run to tuner.

### 4.3 Outputs

- **Electrical length (% of λ)**.
- **Base Gain (dBi)**.
- **Geometry adjustments**.
- **Boost breakdown**.
- **NVIS reflector** (if enabled).
- **Total estimated gain (dBi)**.
- **Estimated TOA (°)**.
- **Transformer note** — tuner and matching hints.

---

## 5. Skyloop Designer

### 5.1 Purpose

- Models a **full‑wave horizontal loop** (“skyloop”) with optional NVIS reflector.
- Often used for quiet, all‑band HF operation.

### 5.2 Inputs

- **Frequency (MHz)**.
- **Loop perimeter (m)** — total loop length.
- **Height (m)** — loop height above ground.

**NVIS reflector:**

- Same controls as Doublet/NVIS.

**Boost panel:**

- **Time of day**.
- **Seaside**, **Ground screen**.
- **Feedline type** (ladder line) and **length (ft)**.

### 5.3 Outputs

- **Electrical length (% of λ)**.
- **Base Gain (dBi)**.
- **Geometry adjustments**.
- **Boost breakdown**.
- **NVIS reflector**.
- **Total estimated gain (dBi)**.
- **Estimated NVIS TOA (°)**.
- **Transformer note**.

---

## 6. Interpreting results

- **High gain + low TOA** → good for DX.
- **Moderate gain + high TOA** → good for NVIS/regional.
- **Large positive geometry adjustments** → your physical design is doing real work.
- **Large boost contributions** → environment/feedline are strongly affecting performance.
- **Challenging transformer notes** → expect more complex matching hardware.

---

## 7. Limitations

- Models are **engineering approximations**, not full 3D EM simulations.
- Ground and environment are simplified.
- Use results as **design guidance**, not absolute guarantees.
