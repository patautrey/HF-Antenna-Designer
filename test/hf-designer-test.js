/* ============================================================
   HF Antenna Designer — Full System Test Harness
   Tests: Geometry → Segmentation → Solver → Pattern → SWR
   ============================================================ */

import MagneticLoopEngine from "/engines/magnetic-loop.js";
import G5RVEngine from "/engines/g5rv.js";
import GothamVerticalEngine from "/engines/gotham-vertical.js";

async function runTest(name, EngineClass, config) {
    console.group(`🔧 Testing ${name}`);

    try {
        const engine = new EngineClass(config);

        console.log("→ Building geometry...");
        const geometry = engine.buildGeometry();
        console.log("   Segments:", geometry.segments.length);
        console.log("   Feed segment:", geometry.feedSegment);

        console.log("→ Solving NEC-style current matrix...");
        const { currents, impedance } = await engine.solve(geometry);
        console.log("   Feed impedance:", impedance);

        console.log("→ Computing far-field pattern...");
        const pattern = await engine.computePattern(currents, geometry);
        console.log("   Pattern points:", pattern.length);

        console.log("→ Computing SWR...");
        const swr = await engine.computeSWR(impedance);
        console.log("   SWR:", swr);

        console.log("→ Test complete ✔");
    }
    catch (err) {
        console.error("❌ Test failed:", err);
    }

    console.groupEnd();
}

/* ============================================================
   Run all antenna tests
   ============================================================ */

export async function runAllTests() {

    console.log("============================================================");
    console.log(" HF Antenna Designer — NEC-Style Engine Test Suite");
    console.log("============================================================");

    await runTest(
        "Magnetic Loop",
        MagneticLoopEngine,
        {
            frequency: 7.1,
            loopDiameter: 1.0,
            wireDiameter: 0.005,
            feedImpedance: 50,
            groundType: "medium",
            boostHighEfficiency: false,
            boostRealGround: true,
            boostHighResolution: false
        }
    );

    await runTest(
        "G5RV",
        G5RVEngine,
        {
            frequency: 14.2,
            wireDiameter: 0.002,
            feedImpedance: 50,
            groundType: "medium",
            boostHighEfficiency: false,
            boostRealGround: true,
            boostHighResolution: false
        }
    );

    await runTest(
        "Gotham Vertical",
        GothamVerticalEngine,
        {
            frequency: 7.1,
            height: 6.7,
            wireDiameter: 0.002,
            radialCount: 16,
            radialLength: 3.0,
            feedImpedance: 50,
            groundType: "medium",
            boostHighEfficiency: false,
            boostRealGround: true,
            boostHighResolution: false
        }
    );

    console.log("============================================================");
    console.log(" All tests completed.");
    console.log("============================================================");
}
