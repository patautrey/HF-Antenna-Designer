/* ============================================================
   Flowerpot (T2LT) — Real-Time Tuning Calculator
   ============================================================ */

export function computeFlowerpotTuning(measuredFreq, targetFreq, topLength, bottomLength) {

    // Ratio method
    const ratio = measuredFreq / targetFreq;

    const newTop = topLength * ratio;
    const newBottom = bottomLength * ratio;

    return {
        ratio,
        newTop,
        newBottom,
        trimTop: topLength - newTop,
        trimBottom: bottomLength - newBottom
    };
}
