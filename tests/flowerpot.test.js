/* ---------------------------------------------------------
   HF Workbench — Flowerpot Module Test Suite
--------------------------------------------------------- */

import { GeometryEngine } from "../js/engines/geometry-engine.js";
import { BoostEngine } from "../js/engines/boost-engine.js";

describe("Flowerpot Coaxial Modules", () => {

    test("GeometryEngine computes span correctly", () => {
        const geom = GeometryEngine.computeGeometry({
            freqMHz: 146.52,
            heightM: 2,
            spanM: 0.98
        });
        expect(geom.spanM).toBeCloseTo(0.98, 3);
    });

    test("BoostEngine seaside boost applies +10 dB", () => {
        const boost = BoostEngine.computeBoost({
            reflectorCount: 0,
            directorCount: 0,
            timeOfDay: "day",
            seaside: true,
            groundScreen: false,
            elevatedRadials: false,
            nvisReflector: false,
            feedlineFamily: "coax",
            feedlineType: "RG-58",
            feedlineLengthFt: 50,
            dxTurboPatternBonus: false
        });
        expect(boost.totalBoost).toBeGreaterThanOrEqual(9.9);
    });

    test("Feedline loss increases with length", () => {
        const shortLine = BoostEngine.computeBoost({
            reflectorCount: 0,
            directorCount: 0,
            timeOfDay: "day",
            seaside: false,
            groundScreen: false,
            elevatedRadials: false,
            nvisReflector: false,
            feedlineFamily: "coax",
            feedlineType: "RG-58",
            feedlineLengthFt: 10,
            dxTurboPatternBonus: false
        });

        const longLine = BoostEngine.computeBoost({
            reflectorCount: 0,
            directorCount: 0,
            timeOfDay: "day",
            seaside: false,
            groundScreen: false,
            elevatedRadials: false,
            nvisReflector: false,
            feedlineFamily: "coax",
            feedlineType: "RG-58",
            feedlineLengthFt: 100,
            dxTurboPatternBonus: false
        });

        expect(longLine.feedlineLossDb).toBeGreaterThan(shortLine.feedlineLossDb);
    });

});
