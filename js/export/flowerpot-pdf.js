/* ---------------------------------------------------------
   HF Workbench — Flowerpot PDF Export Builder
--------------------------------------------------------- */

export function exportFlowerpotPDF(data) {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Flowerpot Coaxial Antenna Report", 14, 20);

    doc.setFontSize(12);
    let y = 35;

    for (const [key, value] of Object.entries(data)) {
        doc.text(`${key}: ${value}`, 14, y);
        y += 8;
        if (y > 270) {
            doc.addPage();
            y = 20;
        }
    }

    doc.save("flowerpot-report.pdf");
}
