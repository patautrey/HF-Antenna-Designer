# Antenna Workbench — Quick Start

This Quick Start is for operators who want to get useful answers fast, without reading the full manual.

---

## 1. General workflow

1. **Open the Workbench**
   - Load the Antenna Workbench in your browser.
   - Use the navigation to choose a tool:
     - Vertical DX Designer
     - Vertical NVIS Designer
     - Doublet Designer
     - Skyloop Designer

2. **Set the design frequency**
   - Enter the **frequency in MHz**.
   - The Workbench automatically finds the HF band and wavelength.

3. **Enter geometry**
   - Fill in height, length, perimeter, or other geometry fields.
   - These define the physical antenna you’re modeling.

4. **Adjust boost options**
   - Choose time of day, ground conditions, feedline, and special options.
   - These model real‑world “environmental” and system boosts/losses.

5. **Click the Compute button**
   - The tool calculates:
     - Base gain
     - Geometry adjustments
     - Boost contributions
     - Estimated takeoff angle (TOA)
   - A summary appears with all key results.

---

## 2. Vertical DX Designer (fast recipe)

1. Open **Vertical DX Designer**.
2. Set **Frequency (MHz)** (e.g., 14.2 for 20m).
3. Set **Radiator height (m)** (e.g., 10 m).
4. Set **Radial count** and **Radial length (m)**.
5. Choose **Ground type** (average, poor, good, saltwater).
6. (Optional) Enable **DX Turbo height override** for ~0.7λ height modeling.
7. In **Boost**:
   - Set **Time of day**.
   - Toggle **Seaside**, **Ground screen**, **Elevated radials**, **Saltwater** as appropriate.
   - Choose **Feedline type** and **Feedline length (ft)**.
   - (Optional) Enable **DX Turbo pattern bonus**.
8. Click **Compute Vertical DX**.
9. Read:
   - Total gain (dBi)
   - Estimated DX TOA (degrees)
   - Geometry and boost breakdown.

---

## 3. Vertical NVIS Designer (fast recipe)

1. Open **Vertical NVIS Designer**.
2. Set **Frequency (MHz)** (e.g., 7.1 for 40m NVIS).
3. Set **Radiator height (m)** (short vertical, often 3–6 m).
4. (Optional) Set **Top-hat length (m)** for capacitive loading.
5. Set **Ground loss (Ω)** and **Radial system** (count + length).
6. (Optional) Enable **NVIS reflector** and set:
   - Reflector wires
   - Spacing (m)
   - Height (m)
7. In **Boost**:
   - Set **Time of day**.
   - Toggle **Seaside**, **Ground screen**, **Elevated radials**.
   - Choose **Feedline type** and **Feedline length (ft)**.
8. Click **Compute Vertical NVIS**.
9. Read:
   - Total gain
   - NVIS TOA (usually high, 60–90°)
   - Reflector contribution and notes.

---

## 4. Doublet Designer (fast recipe)

1. Open **Doublet Designer**.
2. Set **Frequency (MHz)**.
3. Set **Total wire length (m)** (e.g., 40 m for a multiband 80/40/20 doublet).
4. Set **Height (m)** (center height above ground).
5. Choose **Feedline type** (ladder line / twinlead / open wire).
6. Set **Feedline length (ft)**.
7. (Optional) Enable **NVIS reflector** and configure it.
8. In **Boost**:
   - Set **Time of day**.
   - Toggle **Seaside**, **Ground screen**.
   - Set **Coax jumper type** and **length (ft)** if you use a short coax run to the tuner.
9. Click **Compute Doublet**.
10. Read:
    - Electrical length (% of λ)
    - Total gain
    - TOA
    - Reflector and boost breakdown
    - Transformer notes (matching requirements).

---

## 5. Skyloop Designer (fast recipe)

1. Open **Skyloop Designer**.
2. Set **Frequency (MHz)** (e.g., 3.55 for 80m).
3. Set **Loop perimeter (m)** (e.g., ~1λ at the design band).
4. Set **Height (m)** (loop height above ground).
5. (Optional) Enable **NVIS reflector** and configure it.
6. In **Boost**:
   - Set **Time of day**.
   - Toggle **Seaside**, **Ground screen**.
   - Choose **Feedline type** and **Feedline length (ft)**.
7. Click **Compute Skyloop**.
8. Read:
   - Electrical length (% of λ)
   - Total gain
   - NVIS TOA
   - Reflector and boost breakdown
   - Transformer notes.

---

## 6. What to look at first

- **Total Gain (dBi)** — how strong the signal is in the favored direction.
- **Estimated TOA (degrees)** — how high or low the main lobe is.
- **Geometry adjustments** — what your physical choices are doing.
- **Boost breakdown** — what the environment and feedline are doing.
- **Transformer notes** — what matching hardware you’ll likely need.
