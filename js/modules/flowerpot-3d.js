/* ---------------------------------------------------------
   HF Workbench — Flowerpot Coaxial 3D Viewer (T2LT)
   - Three.js-based 3D visualization
   - Radiator, sleeve, choke, PVC mast, ground plane
   - Orbit controls + dynamic resizing
--------------------------------------------------------- */

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export default function initFlowerpot3D(root) {
    const container = document.querySelector("#content") || root;
    if (!container) return;

    container.innerHTML = `
        <section class="tool">
            <h2>Flowerpot Coaxial — 3D Viewer</h2>

            <div class="field-grid">
                <label>Radiator length (m)
                    <input id="fp3d-rad" type="number" step="0.01" value="0.49">
                </label>

                <label>Sleeve length (m)
                    <input id="fp3d-sleeve" type="number" step="0.01" value="0.49">
                </label>

                <label>Base height (m)
                    <input id="fp3d-height" type="number" step="0.1" value="2.0">
                </label>
            </div>

            <button id="fp3d-update" style="margin-top:1rem;">Update Model</button>

            <div id="fp3d-canvas" style="width:100%; height:600px; margin-top:1rem;"></div>
        </section>
    `;

    const radInput = document.getElementById("fp3d-rad");
    const sleeveInput = document.getElementById("fp3d-sleeve");
    const heightInput = document.getElementById("fp3d-height");
    const updateBtn = document.getElementById("fp3d-update");
    const canvasDiv = document.getElementById("fp3d-canvas");

    let scene, camera, renderer, controls;
    let radiatorMesh, sleeveMesh, chokeMesh, mastMesh, groundMesh;

    function initScene() {
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf0f0f0);

        camera = new THREE.PerspectiveCamera(
            45,
            canvasDiv.clientWidth / canvasDiv.clientHeight,
            0.1,
            1000
        );
        camera.position.set(2, 2, 4);

        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(canvasDiv.clientWidth, canvasDiv.clientHeight);
        canvasDiv.appendChild(renderer.domElement);

        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;

        const light1 = new THREE.DirectionalLight(0xffffff, 1);
        light1.position.set(5, 10, 7);
        scene.add(light1);

        const light2 = new THREE.AmbientLight(0x888888);
        scene.add(light2);

        createGround();
        createModel();

        animate();
    }

    function createGround() {
        const grid = new THREE.GridHelper(10, 20, 0x444444, 0xcccccc);
        grid.position.y = 0;
        scene.add(grid);
        groundMesh = grid;
    }

    function createModel() {
        const radLen = parseFloat(radInput.value);
        const sleeveLen = parseFloat(sleeveInput.value);
        const baseHeight = parseFloat(heightInput.value);

        if (radiatorMesh) scene.remove(radiatorMesh);
        if (sleeveMesh) scene.remove(sleeveMesh);
        if (chokeMesh) scene.remove(chokeMesh);
        if (mastMesh) scene.remove(mastMesh);

        const coaxRadius = 0.01;
        const pvcRadius = 0.03;

        const radGeom = new THREE.CylinderGeometry(coaxRadius, coaxRadius, radLen, 32);
        const radMat = new THREE.MeshStandardMaterial({ color: 0xff3333 });
        radiatorMesh = new THREE.Mesh(radGeom, radMat);
        radiatorMesh.position.y = baseHeight + radLen / 2;
        scene.add(radiatorMesh);

        const sleeveGeom = new THREE.CylinderGeometry(coaxRadius * 1.4, coaxRadius * 1.4, sleeveLen, 32);
        const sleeveMat = new THREE.MeshStandardMaterial({ color: 0x3333ff });
        sleeveMesh = new THREE.Mesh(sleeveGeom, sleeveMat);
        sleeveMesh.position.y = baseHeight + sleeveLen / 2;
        scene.add(sleeveMesh);

        const chokeGeom = new THREE.TorusGeometry(coaxRadius * 3, coaxRadius * 0.6, 16, 100);
        const chokeMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
        chokeMesh = new THREE.Mesh(chokeGeom, chokeMat);
        chokeMesh.position.y = baseHeight;
        chokeMesh.rotation.x = Math.PI / 2;
        scene.add(chokeMesh);

        const mastGeom = new THREE.CylinderGeometry(pvcRadius, pvcRadius, baseHeight, 32);
        const mastMat = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
        mastMesh = new THREE.Mesh(mastGeom, mastMat);
        mastMesh.position.y = baseHeight / 2;
        scene.add(mastMesh);
    }

    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }

    updateBtn.addEventListener("click", () => {
        createModel();
    });

    window.addEventListener("resize", () => {
        if (!renderer) return;
        camera.aspect = canvasDiv.clientWidth / canvasDiv.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(canvasDiv.clientWidth, canvasDiv.clientHeight);
    });

    initScene();
}
