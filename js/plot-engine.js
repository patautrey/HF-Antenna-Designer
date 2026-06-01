// js/plot-engine.js
// HF Antenna Designer — Enhanced Plot Engine
// Adds grid lines, tick marks, numeric labels, and clearer rendering.

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
        let canvas = container.querySelector("canvas");
        if (!canvas) {
            canvas = document.createElement("canvas");
            canvas.width = 900;
            canvas.height = 350;
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
        const padding = 60;
        const left = padding;
        const right = canvas.width - padding;
        const top = padding;
        const bottom = canvas.height - padding;

        // Title
        ctx.fillStyle = "#fff";
        ctx.font = "18px Arial";
        if (title) ctx.fillText(title, left, top - 25);

        // Axis labels
        ctx.font = "14px Arial";
        if (xLabel) ctx.fillText(xLabel, (left + right) / 2 - 40, bottom + 40);
        if (yLabel) ctx.fillText(yLabel, left - 50, (top + bottom) / 2);

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

        // ⭐ GRID LINES ⭐
        ctx.strokeStyle = "#222";
        ctx.lineWidth = 1;

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

        // ⭐ TICK MARKS + NUMBERS ⭐
        ctx.fillStyle = "#ccc";
        ctx.font = "12px Arial";

        for (let i = 0; i <= gridLines; i++) {
            const gx = left + (i / gridLines) * (right - left);
            const gy = bottom - (i / gridLines) * (bottom - top);

            const xVal = minX + (i / gridLines) * spanX;
            const yVal = minY + (i / gridLines) * spanY;

            // X-axis ticks
            ctx.fillText(xVal.toFixed(0), gx - 10, bottom + 20);

            // Y-axis ticks
            ctx.fillText(yVal.toFixed(1), left - 45, gy + 4);
        }

        // ⭐ AXES ⭐
        ctx.strokeStyle = "#888";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(left, top);
        ctx.lineTo(left, bottom);
        ctx.lineTo(right, bottom);
        ctx.stroke();

        // ⭐ DATA LINE ⭐
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

    return {
        clearPlot,
        drawLinePlot
    };
})();
