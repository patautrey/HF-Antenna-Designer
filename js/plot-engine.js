// js/plot-engine.js
// HF Antenna Designer — Enhanced Plot Engine (Bigger Labels + Multi‑Plot Safe)

export const PlotEngine = (() => {

    function ensureContainer(containerId = "plot-area") {
        let container = document.getElementById(containerId);
        if (!container) {
            container = document.createElement("div");
            container.id = containerId;
            container.style.marginTop = "1rem";
            container.style.padding = "0.5rem 0";
            document.getElementById("content")?.appendChild(container);
        }
        return container;
    }

    function ensureCanvas(containerId = "plot-area") {
        const container = ensureContainer(containerId);

        // ⭐ Each plot gets its own canvas — no overwriting
        let canvas = container.querySelector("canvas");
        if (!canvas) {
            canvas = document.createElement("canvas");
            canvas.width = 1000;
            canvas.height = 420;
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

        // Plot area
        const padding = 80;
        const left = padding;
        const right = canvas.width - padding;
        const top = padding;
        const bottom = canvas.height - padding;

        // ⭐ Title (bigger)
        ctx.fillStyle = "#fff";
        ctx.font = "22px Arial";
        if (title) ctx.fillText(title, left, top - 35);

        // ⭐ Axis labels (bigger)
        ctx.font = "18px Arial";
        if (xLabel) ctx.fillText(xLabel, (left + right) / 2 - 40, bottom + 50);
        if (yLabel) ctx.fillText(yLabel, left - 70, (top + bottom) / 2);

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

        // ⭐ Grid lines (bigger, clearer)
        ctx.strokeStyle = "#222";
        ctx.lineWidth = 1.5;

        const gridLines = 10;

        for (let i = 0; i <= gridLines; i++) {
            const gx = left + (i / gridLines) * (right - left);
            const gy = top + (i / gridLines) * (bottom - top);

            // Vertical grid
            ctx.beginPath();
            ctx.moveTo(gx, top);
            ctx.lineTo(gx, bottom);
            ctx.stroke();

            // Horizontal grid
            ctx.beginPath();
            ctx.moveTo(left, gy);
            ctx.lineTo(right, gy);
            ctx.stroke();
        }

        // ⭐ Tick marks + numbers (bigger)
        ctx.fillStyle = "#ccc";
        ctx.font = "16px Arial";

        for (let i = 0; i <= gridLines; i++) {
            const gx = left + (i / gridLines) * (right - left);
            const gy = bottom - (i / gridLines) * (bottom - top);

            const xVal = minX + (i / gridLines) * spanX;
            const yVal = minY + (i / gridLines) * spanY;

            // X-axis ticks
            ctx.fillText(xVal.toFixed(0), gx - 12, bottom + 30);

            // Y-axis ticks
            ctx.fillText(yVal.toFixed(1), left - 55, gy + 5);
        }

        // ⭐ Axes (thicker)
        ctx.strokeStyle = "#888";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(left, top);
        ctx.lineTo(left, bottom);
        ctx.lineTo(right, bottom);
        ctx.stroke();

        // ⭐ Data line (thicker, brighter)
        ctx.strokeStyle = "#00ff88";
        ctx.lineWidth = 3;
        ctx.beginPath();

        data.forEach((p, i) => {
            const px = mapX(p.x);
            const py = mapY(p.y);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        });

        ctx.stroke();
    }

    return {
        clearPlot,
        drawLinePlot
    };
})();
