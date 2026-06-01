// js/plot-engine.js
// HF Antenna Designer — Plot Engine
// Centralized plotting utilities (SWR, gain, TOA, etc.)

export const PlotEngine = (() => {
    function ensureCanvas(containerId = "plot-area") {
        let container = document.getElementById(containerId);
        if (!container) {
            container = document.createElement("div");
            container.id = containerId;
            container.style.marginTop = "1rem";
            document.getElementById("content")?.appendChild(container);
        }

        let canvas = container.querySelector("canvas");
        if (!canvas) {
            canvas = document.createElement("canvas");
            canvas.width = 800;
            canvas.height = 300;
            canvas.style.width = "100%";
            canvas.style.border = "1px solid #333";
            canvas.style.background = "#000";
            container.innerHTML = "";
            container.appendChild(canvas);
        }
        return canvas.getContext("2d");
    }

    function clearPlot(containerId = "plot-area") {
        const container = document.getElementById(containerId);
        if (container) container.innerHTML = "";
    }

    function drawLinePlot({ containerId = "plot-area", title, xLabel, yLabel, data }) {
        const ctx = ensureCanvas(containerId);
        const canvas = ctx.canvas;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Background
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Axes
        const padding = 50;
        const left = padding;
        const right = canvas.width - padding;
        const top = padding;
        const bottom = canvas.height - padding;

        ctx.strokeStyle = "#666";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(left, top);
        ctx.lineTo(left, bottom);
        ctx.lineTo(right, bottom);
        ctx.stroke();

        // Labels
        ctx.fillStyle = "#fff";
        ctx.font = "14px Arial";
        if (title) ctx.fillText(title, left, top - 20);
        if (xLabel) ctx.fillText(xLabel, (left + right) / 2 - 20, bottom + 30);
        if (yLabel) ctx.fillText(yLabel, left - 40, (top + bottom) / 2);

        if (!data || data.length === 0) return;

        const xs = data.map(p => p.x);
        const ys = data.map(p => p.y);
        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const minY = Math.min(...ys);
        const maxY = Math.max(...ys);

        const spanX = maxX - minX || 1;
        const spanY = maxY - minY || 1;

        function mapX(x) {
            return left + ((x - minX) / spanX) * (right - left);
        }
        function mapY(y) {
            return bottom - ((y - minY) / spanY) * (bottom - top);
        }

        ctx.strokeStyle = "#00ff88";
        ctx.lineWidth = 2;
        ctx.beginPath();
        data.forEach((p, i) => {
            const px = mapX(p.x);
            const py = mapY(p.y);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        });
        ctx.stroke();
    }

    // Convenience wrappers

    function drawSWRPlot(points) {
        drawLinePlot({
            title: "SWR vs Frequency",
            xLabel: "Frequency (MHz)",
            yLabel: "SWR",
            data: points
        });
    }

    function drawGainPlot(points) {
        drawLinePlot({
            title: "Gain vs Frequency",
            xLabel: "Frequency (MHz)",
            yLabel: "Gain (dBi)",
            data: points
        });
    }

    function drawTOAPlot(points) {
        drawLinePlot({
            title: "Take-Off Angle vs Height",
            xLabel: "Height (m)",
            yLabel: "TOA (degrees)",
            data: points
        });
    }

    function drawLossPlot(points) {
        drawLinePlot({
            title: "Feedline Loss vs Frequency",
            xLabel: "Frequency (MHz)",
            yLabel: "Loss (dB)",
            data: points
        });
    }

    return {
        clearPlot,
        drawLinePlot,
        drawSWRPlot,
        drawGainPlot,
        drawTOAPlot,
        drawLossPlot
    };
})();
