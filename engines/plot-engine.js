/* ============================================================
   HF Antenna Designer — Plot Engine
   ============================================================ */

export default {

    plotAzimuth(canvas, pattern) {
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const maxGain = Math.max(...pattern.map(p => p.gain));

        pattern.forEach(p => {
            const angle = (p.theta * Math.PI) / 180;
            const radius = (p.gain / maxGain) * (canvas.width / 2);

            const x = canvas.width / 2 + radius * Math.cos(angle);
            const y = canvas.height / 2 + radius * Math.sin(angle);

            ctx.fillRect(x, y, 2, 2);
        });
    },

    plotSWR(canvas, swrData) {
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.beginPath();
        swrData.forEach((p, i) => {
            const x = (i / swrData.length) * canvas.width;
            const y = canvas.height - (p.swr / 10) * canvas.height;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();
    }
};
