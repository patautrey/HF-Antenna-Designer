/* ---------------------------------------------------------
   HF Workbench — TransformerEngine
   Returns transformer requirement notes for each antenna type.
--------------------------------------------------------- */

export const TransformerEngine = {
    getTransformerNote(antennaType, feedlineFamily = "coax", options = {}) {
        const { efhwRatio = "49:1" } = options;

        let text;

        switch (antennaType) {
            case "ocf":
                text = "This antenna requires a 4:1 current balun to correct the feedpoint impedance to 50 ohms and suppress common‑mode current.";
                break;

            case "efhw":
                text = `This antenna requires a ${efhwRatio} impedance transformer to match the high‑impedance end‑fed wire to 50 ohms.`;
                break;

            case "randomWire":
                text = "This antenna requires a 9:1 unun to bring the high and variable impedance into the tuner’s matching range.";
                break;

            case "doublet":
                text = "This antenna requires a 1:1 current balun at the tuner to maintain balanced currents and prevent feedline radiation.";
                break;

            case "hLoop":
            case "skyloop":
                text = "This antenna requires a 4:1 current balun to match the loop’s ~120‑ohm feedpoint impedance to 50 ohms.";
                break;

            case "verticalNVIS":
                if (feedlineFamily === "ladder") {
                    text = "This antenna requires a 1:1 current balun at the tuner when transitioning from ladder line to coax.";
                } else {
                    text = "No balun or unun is required when this antenna is fed directly with 50‑ohm coax.";
                }
                break;

            case "verticalDX":
            case "performer":
            case "dominator":
                text = "No balun or unun is required for this antenna.";
                break;

            default:
                if (feedlineFamily === "ladder") {
                    text = "This antenna requires a 1:1 current balun when transitioning from ladder line to 50‑ohm coax.";
                } else {
                    text = "No balun or unun is required for this antenna.";
                }
                break;
        }

        return `
            <h3>⚡ Transformer Requirements</h3>
            <p>${text}</p>
        `;
    }
};
