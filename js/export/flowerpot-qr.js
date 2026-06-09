/* ---------------------------------------------------------
   HF Workbench — Flowerpot Build Sheet QR Generator
--------------------------------------------------------- */

export function generateFlowerpotQR(elementId, data) {
    const json = JSON.stringify(data);

    new QRCode(document.getElementById(elementId), {
        text: json,
        width: 256,
        height: 256,
        correctLevel: QRCode.CorrectLevel.M
    });
}
