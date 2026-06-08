/* ============================================================
   HF Antenna Designer — Plotly NEC‑Style Chart Engine
   Light Theme • Engineering White‑Paper Style
   ============================================================ */

const ChartEngine = {

    /* ------------------------------------------------------------
       1. AZIMUTH (H‑PLANE) PATTERN
       ------------------------------------------------------------ */
    azimuth(containerId, data) {
        const trace = {
            type: "scatterpolar",
            r: data.gain,
            theta: data.angles,
            mode: "lines",
            line: { color: "#0057b8", width: 2 }
        };

        const layout = {
            title: "Azimuth Pattern (H‑Plane)",
            paper_bgcolor: "#ffffff",
            plot_bgcolor: "#ffffff",
            polar: {
                bgcolor: "#ffffff",
                radialaxis: {
                    showline: true,
                    linewidth: 1,
                    gridcolor: "#dddddd",
                    tickfont: { color: "#111" }
                },
                angularaxis: {
                    gridcolor: "#dddddd",
                    tickfont: { color: "#111" }
                }
            },
            margin: { t: 40, b: 20, l: 20, r: 20 }
        };

        Plotly.newPlot(containerId, [trace], layout, { responsive: true });
    },

    /* ------------------------------------------------------------
       2. ELEVATION (E‑PLANE) PATTERN
       ------------------------------------------------------------ */
    elevation(containerId, data) {
        const trace = {
            type: "scatter",
            x: data.angles,
            y: data.gain,
            mode: "lines",
            line: { color: "#d62728", width: 2 }
        };

        const layout = {
            title: "Elevation Pattern (E‑Plane)",
            paper_bgcolor: "#ffffff",
            plot_bgcolor: "#ffffff",
            xaxis: {
                title: "Elevation (°)",
                gridcolor: "#dddddd",
                color: "#111"
            },
            yaxis: {
                title: "Gain (dBi)",
                gridcolor: "#dddddd",
                color: "#111"
            },
            margin: { t: 40, b: 50, l: 60, r: 20 }
        };

        Plotly.newPlot(containerId, [trace], layout, { responsive: true });
    },

    /* ------------------------------------------------------------
       3. 3D RADIATION PATTERN
       ------------------------------------------------------------ */
    pattern3D(containerId, data) {
        const trace = {
            type: "surface",
            x: data.x,
            y: data.y,
            z: data.z,
            colorscale: "Portland",
            showscale: true
        };

        const layout = {
            title: "3D Radiation Pattern",
            paper_bgcolor: "#ffffff",
            scene: {
                xaxis: { backgroundcolor: "#ffffff", gridcolor: "#dddddd", color: "#111" },
                yaxis: { backgroundcolor: "#ffffff", gridcolor: "#dddddd", color: "#111" },
                zaxis: { backgroundcolor: "#ffffff", gridcolor: "#dddddd", color: "#111" }
            },
            margin: { t: 40, b: 20, l: 20, r: 20 }
        };

        Plotly.newPlot(containerId, [trace], layout, { responsive: true });
    },

    /* ------------------------------------------------------------
       4. SWR CURVE
       ------------------------------------------------------------ */
    swrCurve(containerId, data) {
        const trace = {
            type: "scatter",
            x: data.frequency,
            y: data.swr,
            mode: "lines",
            line: { color: "#0057b8", width: 2 }
        };

        const layout = {
            title: "SWR Curve",
            paper_bgcolor: "#ffffff",
            plot_bgcolor: "#ffffff",
            xaxis: {
                title: "Frequency (MHz)",
                gridcolor: "#dddddd",
                color: "#111"
            },
            yaxis: {
                title: "SWR",
                gridcolor: "#dddddd",
                color: "#111"
            },
            margin: { t: 40, b: 50, l: 60, r: 20 }
        };

        Plotly.newPlot(containerId, [trace], layout, { responsive: true });
    },

    /* ------------------------------------------------------------
       5. BANDWIDTH CURVE
       ------------------------------------------------------------ */
    bandwidth(containerId, data) {
        const trace = {
            type: "scatter",
            x: data.frequency,
            y: data.returnLoss,
            mode: "lines",
            line: { color: "#d62728", width: 2 }
        };

        const layout = {
            title: "Return Loss / Bandwidth",
            paper_bgcolor: "#ffffff",
            plot_bgcolor: "#ffffff",
            xaxis: {
                title: "Frequency (MHz)",
                gridcolor: "#dddddd",
                color: "#111"
            },
            yaxis: {
                title: "Return Loss (dB)",
                gridcolor: "#dddddd",
                color: "#111"
            },
            margin: { t: 40, b: 50, l: 60, r: 20 }
        };

        Plotly.newPlot(containerId, [trace], layout, { responsive: true });
    },

    /* ------------------------------------------------------------
       6. CURRENT DISTRIBUTION
       ------------------------------------------------------------ */
    currentDistribution(containerId, data) {
        const trace = {
            type: "bar",
            x: data.elements,
            y: data.current,
            marker: { color: "#0057b8" }
        };

        const layout = {
            title: "Current Distribution",
            paper_bgcolor: "#ffffff",
            plot_bgcolor: "#ffffff",
            xaxis: { color: "#111" },
            yaxis: { title: "Current (A)", color: "#111", gridcolor: "#dddddd" },
            margin: { t: 40, b: 50, l: 60, r: 20 }
        };

        Plotly.newPlot(containerId, [trace], layout, { responsive: true });
    },

    /* ------------------------------------------------------------
       7. RADIAL LAYOUT
       ------------------------------------------------------------ */
    radialLayout(containerId, data) {
        const trace = {
            type: "scatterpolar",
            r: data.lengths,
            theta: data.angles,
            mode: "lines",
            line: { color: "#0057b8", width: 2 }
        };

        const layout = {
            title: "Radial System Layout",
            paper_bgcolor: "#ffffff",
            polar: {
                bgcolor: "#ffffff",
                radialaxis: { gridcolor: "#dddddd", color: "#111" },
                angularaxis: { gridcolor: "#dddddd", color: "#111" }
            },
            margin: { t: 40, b: 20, l: 20, r: 20 }
        };

        Plotly.newPlot(containerId, [trace], layout, { responsive: true });
    },

    /* ------------------------------------------------------------
       8. BOOM LAYOUT (YAGI)
       ------------------------------------------------------------ */
    boomLayout(containerId, data) {
        const trace = {
            type: "scatter",
            x: data.position,
            y: data.length,
            mode: "markers+lines",
            marker: { size: 10, color: "#0057b8" },
            line: { color: "#0057b8", width: 2 }
        };

        const layout = {
            title: "Boom Layout",
            paper_bgcolor: "#ffffff",
            plot_bgcolor: "#ffffff",
            xaxis: { title: "Position (m)", gridcolor: "#dddddd", color: "#111" },
            yaxis: { title: "Element Length (m)", gridcolor: "#dddddd", color: "#111" },
            margin: { t: 40, b: 50, l: 60, r: 20 }
        };

        Plotly.newPlot(containerId, [trace], layout, { responsive: true });
    }
};

export default ChartEngine;
