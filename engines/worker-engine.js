/* ============================================================
   HF Antenna Designer — Worker Engine (Background Thread)
   NEC-Style Segmented Solver
   ============================================================ */

self.onmessage = (event) => {
    const { type, geometry, config, currents } = event.data;

    try {
        if (type === "SOLVE") {
            const Z = buildImpedanceMatrix(geometry, config);
            const I = solveMatrix(Z, geometry.feedVector);
            const impedance = computeFeedImpedance(I, geometry);

            self.postMessage({ currents: I, impedance });
        }

        if (type === "PATTERN") {
            const pattern = computeFarField(currents, geometry, config);
            self.postMessage({ pattern });
        }

    } catch (err) {
        self.postMessage({ error: err.toString() });
    }
};

/* ------------------------------
   NEC-Style Core Math Functions
   ------------------------------ */

function buildImpedanceMatrix(geometry, config) {
    const N = geometry.segments.length;
    const Z = new Array(N).fill(0).map(() => new Array(N).fill(0));

    for (let m = 0; m < N; m++) {
        for (let n = 0; n < N; n++) {
            Z[m][n] = mutualImpedance(geometry.segments[m], geometry.segments[n], config);
        }
    }
    return Z;
}

function solveMatrix(Z, V) {
    // Gaussian elimination
    const N = Z.length;
    const A = Z.map((row, i) => [...row, V[i]]);

    for (let i = 0; i < N; i++) {
        let pivot = A[i][i];
        for (let j = i; j <= N; j++) A[i][j] /= pivot;

        for (let k = 0; k < N; k++) {
            if (k === i) continue;
            let factor = A[k][i];
            for (let j = i; j <= N; j++) {
                A[k][j] -= factor * A[i][j];
            }
        }
    }

    return A.map(row => row[N]);
}

function computeFeedImpedance(currents, geometry) {
    const I = currents[geometry.feedSegment];
    const V = 1.0; // 1V excitation
    return V / I;
}

function computeFarField(currents, geometry, config) {
    const pattern = [];
    for (let theta = 0; theta <= 180; theta += 2) {
        pattern.push({
            theta,
            gain: farFieldGain(theta, currents, geometry, config)
        });
    }
    return pattern;
}
