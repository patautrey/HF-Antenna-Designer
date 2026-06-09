/* ============================================================
   HF Antenna Designer — Module: COCO (Coaxial Collinear)
   ============================================================ */

export default {

    name: "COCO Coaxial Collinear",

    async init(container) {
        const engine = await import("/engines/coco-collinear.js");

        if (!engine || !engine.default) {
            console.error("COCO Coaxial Collinear engine missing");
            return;
        }

        const COCO = engine.default;

        const defaults = {
            frequency: 446.0,               // MHz baseline (UHF typical)
            elementCount: 8,                // number of coax segments
            coaxType: "RG-58",              // RG-58, RG-6, RG-174
            velocityFactor: 0.66,           // RG-58 typical VF 
            segmentLength: 0.0,             // auto-calculated 1/2λ * VF
            phasingMethod: "alternating",   // alternating, Franklin-style
            enclosure: "PVC",               // PVC radome common in COCO builds 
            mountingMethod: "vertical",     // vertical omni pattern
            mountingHeight: 3.0,
            orientation: 0,
            groundType: "none"
        };

        COCO.render(container, defaults);
    }
};
