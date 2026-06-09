export default {

    id: "vertical-boost-glossary",
    name: "Vertical Antenna Boost Glossary",
    category: "Documentation",

    entries: [

        {
            term: "Seaside Boost",
            value: "+10 dB",
            explanation: `
A vertical antenna placed directly at the saltwater shoreline experiences a dramatic increase in low‑angle radiation efficiency.
Saltwater has extremely high conductivity (~5 S/m), acting as a near‑perfect ground plane.
This produces a +10 dB boost at 0–5° takeoff angles, making seaside locations the most powerful DX sites on Earth.
`
        },

        {
            term: "Elevated Radials",
            explanation: `
Radials raised above ground (0.5–3 m) reduce ground losses and increase radiation resistance.
More radials = higher efficiency.
0 radials = worst efficiency.
64 radials = near‑perfect ground system.
Elevated radials outperform buried radials at all frequencies.
`
        },

        {
            term: "Radial Count (0–64)",
            explanation: `
The number of radials dramatically affects efficiency.
0 radials: 10–30% efficiency.
4 radials: 40–60% efficiency.
16 radials: 70–85% efficiency.
32–64 radials: 90–98% efficiency.
`
        },

        {
            term: "Elevated Radiating Element",
            explanation: `
Raising the entire vertical above ground reduces ground absorption and lowers the takeoff angle.
Height increases DX performance and reduces high‑angle NVIS energy.
`
        },

        {
            term: "DX Turbo (70% Low‑Angle Weighting)",
            explanation: `
DX Turbo applies a propagation weighting model that emphasizes 0–10° radiation.
This simulates long‑distance HF/VHF DX conditions.
Low‑angle gain is multiplied by ~1.7.
High‑angle energy is suppressed.
`
        },

        {
            term: "Reflector Element",
            explanation: `
A parasitic element placed behind the vertical.
Increases forward gain by 2–4 dB.
Improves front‑to‑back ratio.
Narrows beamwidth.
`
        },

        {
            term: "Director Element",
            explanation: `
A parasitic element placed in front of the vertical.
Increases forward gain by 3–6 dB.
Lowers takeoff angle.
Improves DX performance.
`
        },

        {
            term: "Saltwater Horizon Enhancement",
            explanation: `
When a vertical is placed at the edge of saltwater, the reflection coefficient approaches +1.
This produces a near‑perfect in‑phase ground reflection.
Result: extremely strong low‑angle launch.
`
        },

        {
            term: "Ground Conductivity Boost",
            explanation: `
Better ground conductivity reduces ground losses.
Saltwater: 5 S/m (best)
Wet soil: 0.03 S/m
Dry soil: 0.001 S/m
Rock/sand: 0.0001 S/m (worst)
`
        },

        {
            term: "Urban Attenuation",
            explanation: `
Buildings, metal structures, and noise sources reduce vertical performance.
Typical loss: 3–12 dB depending on frequency and density.
`
        },

        {
            term: "Terrain Slope Gain",
            explanation: `
If the antenna is placed on a slope facing the DX direction, the effective horizon is lowered.
This increases low‑angle gain by 1–6 dB.
`
        },

        {
            term: "Time‑of‑Day Propagation Weighting",
            explanation: `
Models ionospheric behavior:
Daytime: higher MUF, higher absorption.
Nighttime: lower MUF, lower absorption.
Low‑angle weighting increases at night.
`
        },

        {
            term: "Seasonal Foliage Loss",
            explanation: `
Trees absorb RF.
Summer: −1 to −6 dB depending on frequency.
Winter: minimal loss.
`
        },

        {
            term: "Radial Efficiency",
            explanation: `
A measure of how effectively the radial system reduces ground losses.
More radials = higher efficiency.
Elevated radials outperform buried radials.
`
        },

        {
            term: "Low‑Angle Launch Optimization",
            explanation: `
Vertical antennas excel at low‑angle radiation.
Boost features such as elevated radials, saltwater, and DX Turbo enhance this further.
`
        }
    ]
};
