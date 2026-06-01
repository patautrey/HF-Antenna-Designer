<!DOCTYPE html>
<html>
<head>
    <title>User Manual — Antenna Workbench</title>
    <meta charset="utf-8">
    <style>
        body { font-family: sans-serif; max-width: 900px; margin: auto; line-height: 1.6; }
        h1, h2, h3 { color: #003366; }
    </style>
</head>
<body>

<h1>Antenna Workbench — User Manual</h1>

<p>This manual explains how each tool works, what the controls mean, and how to interpret the results.</p>

<h2>1. Core Concepts</h2>
<p><strong>Geometry Engine</strong> models physical antenna dimensions, loading, radials, and ground interaction.</p>
<p><strong>Boost Engine</strong> models environmental and system factors such as time of day, ground screen, seaside, and feedline losses.</p>
<p><strong>NVIS Reflector Engine</strong> models reflector grids for high-angle radiation.</p>
<p><strong>Transformer Engine</strong> provides matching notes and impedance guidance.</p>

<h2>2. Vertical DX Designer</h2>
<p>Models a low-angle DX vertical with radials and ground interaction.</p>
<ul>
    <li>Inputs: frequency, height, radials, ground type</li>
    <li>Boosts: seaside, ground screen, elevated radials, feedline</li>
    <li>Outputs: gain, TOA, geometry adjustments, transformer notes</li>
</ul>

<h2>3. Vertical NVIS Designer</h2>
<p>Models a short vertical optimized for high-angle NVIS coverage.</p>

<h2>4. Doublet Designer</h2>
<p>Models a multiband center-fed doublet with ladder line.</p>

<h2>5. Skyloop Designer</h2>
<p>Models a full-wave horizontal loop with optional NVIS reflector.</p>

<h2>6. Interpreting Results</h2>
<ul>
    <li><strong>Gain (dBi)</strong> — signal strength</li>
    <li><strong>TOA</strong> — DX (low), NVIS (high)</li>
    <li><strong>Geometry adjustments</strong> — physical effects</li>
    <li><strong>Boost breakdown</strong> — environmental/system effects</li>
    <li><strong>Transformer notes</strong> — matching difficulty</li>
</ul>

</body>
</html>
