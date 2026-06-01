// js/plot-engine.js
// HF Antenna Designer — Polar + Line Plot Engine
// - Full-circle polar plots (azimuth & elevation)
// - EZNEC-style rings: 0, -3, -6, -10, -20 dB
// - Also keeps a generic line plot for other uses

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
            canvas.width = 600;
            canvas.height = 600;
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

    // ---------- LINE PLOT (for SWR, etc.) ----------

    function drawLinePlot({ containerId = "plot-area", title, xLabel, yLabel, data }) {
        const ctx = ensureCanvas(containerId);
        const canvas = ctx.canvas;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const padding = 80;
        const left = padding;
        const right = canvas.width - padding;
        const top = padding;
        const bottom = canvas.height - padding;

        ctx.fillStyle = "#fff";
        ctx.font = "20px Arial";
        if (title) ctx.fillText(title, left, top - 35);

        ctx.font = "16px Arial";
        if (xLabel) ctx.fillText(xLabel, (left + right) / 2 - 40, bottom + 45);
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

        ctx.strokeStyle = "#222";
        ctx.lineWidth = 1.5;
        const gridLines = 10;

        for (let i = 0; i <= gridLines; i++) {
            const gx = left + (i / gridLines) * (right - left);
            const gy = top + (i / gridLines) * (bottom - top);

            ctx.beginPath();
            ctx.moveTo(gx, top);
            ctx.lineTo(gx, bottom);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(left, gy);
            ctx.lineTo(right, gy);
            ctx.stroke();
        }

        ctx.fillStyle = "#ccc";
        ctx.font = "14px Arial";

        for (let i = 0; i <= gridLines; i++) {
            const gx = left + (i / gridLines) * (right - left);
            const gy = bottom - (i / gridLines) * (bottom - top);

            const xVal = minX + (i / gridLines) * spanX;
            const yVal = minY + (i / gridLines) * spanY;

            ctx.fillText(xVal.toFixed(0), gx - 12, bottom + 25);
            ctx.fillText(yVal.toFixed(1), left - 55, gy + 5);
        }

        ctx.strokeStyle = "#888";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(left, top);
        ctx.lineTo(left, bottom);
        ctx.lineTo(right, bottom);
        ctx.stroke();

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

    // ---------- POLAR PLOT (EZNEC-style) ----------

    function drawPolarPlot({ containerId = "plot-area", title, data }) {
        const ctx = ensureCanvas(containerId);
        const canvas = ctx.canvas;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const maxRadius = Math.min(cx, cy) - 40;

        ctx.fillStyle = "#fff";
        ctx.font = "20px Arial";
        if (title) ctx.fillText(title, 20, 30);

        if (!data || data.length === 0) return;

        const gains = data.map(p => p.gain);
        const maxGain = Math.max(...gains);
        const minGain = maxGain - 20; // 0 to -20 dB window

        const rings = [0, -3, -6, -10, -20];

        ctx.strokeStyle = "#333";
        ctx.lineWidth = 1.5;
        ctx.fillStyle = "#aaa";
        ctx.font = "14px Arial";

        rings.forEach(dB => {
            const frac = (maxGain - (maxGain + dB)) / (maxGain - minGain || 1);
            const r = maxRadius * (1 - frac);
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.fillText(`${dB} dB`, cx + r + 5, cy);
        });

        ctx.strokeStyle = "#444";
        for (let deg = 0; deg < 360; deg += 30) {
            const rad = (deg - 90) * Math.PI / 180;
            const x = cx + maxRadius * Math.cos(rad);
            const y = cy + maxRadius * Math.sin(rad);
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(x, y);
            ctx.stroke();

            const labelR = maxRadius + 20;
            const lx = cx + labelR * Math.cos(rad);
            const ly = cy + labelR * Math.sin(rad);
            ctx.fillText(`${deg}°`, lx - 12, ly + 5);
        }

        ctx.strokeStyle = "#00ff88";
        ctx.lineWidth = 3;
        ctx.beginPath();

        data.forEach((p, i) => {
            const angleRad = (p.angle - 90) * Math.PI / 180;
            const clampedGain = Math.max(minGain, Math.min(maxGain, p.gain));
            const frac = (clampedGain - minGain) / (maxGain - minGain || 1);
            const r = maxRadius * frac;
            const x = cx + r * Math.cos(angleRad);
            const y = cy + r * Math.sin(angleRad);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });

        ctx.closePath();
        ctx.stroke();

        const maxIndex = gains.indexOf(maxGain);
        const maxPoint = data[maxIndex];
        const maxAngleRad = (maxPoint.angle - 90) * Math.PI / 180;
        const maxR = maxRadius;
        const mx = cx + maxR * Math.cos(maxAngleRad);
        const my = cy + maxR * Math.sin(maxAngleRad);

        ctx.fillStyle = "#ff4444";
        ctx.beginPath();
        ctx.arc(mx, my, 5, 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = "#fff";
        ctx.font = "16px Arial";
        ctx.fillText(
            `Max: ${maxGain.toFixed(2)} dBi @ ${maxPoint.angle.toFixed(0)}°`,
            20,
            canvas.height - 30
        );
    }

    function plotAzimuth(pattern, { elementId = "plot-area", title } = {}) {
        drawPolarPlot({
            containerId: elementId,
            title: title || "Azimuth Pattern",
            data: pattern
        });
    }

    function plotElevation(pattern, { elementId = "plot-area", title } = {}) {
        drawPolarPlot({
            containerId: elementId,
            title: title || "Elevation Pattern",
            data: pattern
        });
    }

    return {
        clearPlot,
        drawLinePlot,
        plotAzimuth,
        plotElevation
    };
})();
