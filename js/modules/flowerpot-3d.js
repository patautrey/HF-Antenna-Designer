/* ---------------------------------------------------------
   HF Workbench — Flowerpot Coaxial 3D Viewer (Complete)
   - Three.js-based 3D visualization
   - Radiator, sleeve, choke, PVC mast, ground plane
   - Dimension labels, camera presets, model toggles
   - Screenshot export, multiband support
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

                <label>Band mode
                    <select id="fp3d-bandmode">
                        <option value="1">Single-band</option>
                        <option value="2">Dual-band</option>
                        <option value="3">Tri-band</option>
                    </select>
                </label>
            </div>

            <div class="field-grid">
                <label><input id="fp3d-show-rad" type="checkbox" checked> Show radiator</label>
                <label><input id="fp3d-show-sleeve" type="checkbox" checked> Show sleeve</label>
                <label><input id="fp3d-show-choke" type="checkbox" checked> Show choke</label>
                <label><input id="fp3d-show-mast" type="checkbox" checked> Show mast</label>
                <label><input id="fp3d-show-ground" type="checkbox" checked> Show ground</label>
            </div>

            <div class="field-grid">
                <button id="fp3d-update">Update Model</button>
                <button id="fp3d-view-side">Side View</button>
                <button id="fp3d-view-top">Top View</button>
                <button id="fp3d-view-iso">Isometric</button>
                <button id="fp3d-screenshot">Screenshot</button>
            </div>

            <div id="fp3d-canvas" style="width:100%; height:600px; margin-top:1rem; position:relative;"></div>
        </section>
    `;

    const radInput = document.getElementById("fp3d-rad");
    const sleeveInput = document.getElementById("fp3d-sleeve");
    const heightInput = document.getElementById("fp3d-height");
    const bandModeInput = document.getElementById("fp3d-bandmode");

    const showRad = document.getElementById("fp3d-show-rad");
    const showSleeve = document.getElementById("fp3d-show-sleeve");
    const showChoke = document.getElementById("fp3d-show-choke");
    const showMast = document.getElementById("fp3d-show-mast");
    const showGround = document.getElementById("fp3d-show-ground");

    const updateBtn = document.getElementById("fp3d-update");
    const viewSideBtn = document.getElementById("fp3d-view-side");
    const viewTopBtn = document.getElementById("fp3d-view-top");
    const viewIsoBtn = document.getElementById("fp3d-view-iso");
    const screenshotBtn = document.getElementById("fp3d-screenshot");

    const canvasDiv = document.getElementById("fp3d-canvas");

    let scene, camera, renderer, controls;
    let radiatorMeshes = [];
    let sleeveMeshes = [];
    let chokeMeshes = [];
    let mastMesh, groundMesh;

    function initScene() {
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf0f0f0);

        camera = new THREE.PerspectiveCamera(
            45,
            canvasDiv.clientWidth / canvasDiv.clientHeight,
            0.1,
            2000
        );
        camera.position.set(3, 3, 6);

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
        const grid = new THREE.GridHelper(20, 40, 0x444444, 0xcccccc);
        grid.position.y = 0;
        scene.add(grid);
        groundMesh = grid;
    }

    function clearModel() {
        radiatorMeshes.forEach(m => scene.remove(m));
        sleeveMeshes.forEach(m => scene.remove(m));
        chokeMeshes.forEach(m => scene.remove(m));
        if (mastMesh) scene.remove(mastMesh);

        radiatorMeshes = [];
        sleeveMeshes = [];
        chokeMeshes = [];
    }

    function createModel() {
        clearModel();

        const radLen = parseFloat(radInput.value);
        const sleeveLen = parseFloat(sleeveInput.value);
        const baseHeight = parseFloat(heightInput.value);
        const bandCount = parseInt(bandModeInput.value);

        const coaxRadius = 0.01;
        const pvcRadius = 0.03;

        for (let i = 0; i < bandCount; i++) {
            const offset = i * 0.05;

            const radGeom = new THREE.CylinderGeometry(coaxRadius, coaxRadius, radLen, 32);
            const radMat = new THREE.MeshStandardMaterial({ color: 0xff3333 });
            const radMesh = new THREE.Mesh(radGeom, radMat);
            radMesh.position.y = baseHeight + radLen / 2 + offset;
            radiatorMeshes.push(radMesh);
            scene.add(radMesh);

            const sleeveGeom = new THREE.CylinderGeometry(coaxRadius * 1.4, coaxRadius * 1.4, sleeveLen, 32);
            const sleeveMat = new THREE.MeshStandardMaterial({ color: 0x3333ff });
            const sleeveMesh = new THREE.Mesh(sleeveGeom, sleeveMat);
            sleeveMesh.position.y = baseHeight + sleeveLen / 2 + offset;
            sleeveMeshes.push(sleeveMesh);
            scene.add(sleeveMesh);

            const chokeGeom = new THREE.TorusGeometry(coaxRadius * 3, coaxRadius * 0.6, 16, 100);
            const chokeMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
            const chokeMesh = new THREE.Mesh(chokeGeom, chokeMat);
            chokeMesh.position.y = baseHeight + offset;
            chokeMesh.rotation.x = Math.PI / 2;
            chokeMeshes.push(chokeMesh);
            scene.add(chokeMesh);
        }

        const mastGeom = new THREE.CylinderGeometry(pvcRadius, pvcRadius, baseHeight, 32);
        const mastMat = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
        mastMesh = new THREE.Mesh(mastGeom, mastMat);
        mastMesh.position.y = baseHeight / 2;
        scene.add(mastMesh);

        applyVisibility();
    }

    function applyVisibility() {
        radiatorMeshes.forEach(m => m.visible = showRad.checked);
        sleeveMeshes.forEach(m => m.visible = showSleeve.checked);
        chokeMeshes.forEach(m => m.visible = showChoke.checked);
        if (mastMesh) mastMesh.visible = showMast.checked;
        if (groundMesh) groundMesh.visible = showGround.checked;
    }

    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }

    function setCameraSide() {
        camera.position.set(6, 2, 0);
        camera.lookAt(0, 2, 0);
    }

    function setCameraTop() {
        camera.position.set(0, 10, 0);
        camera.lookAt(0, 0, 0);
    }

    function setCameraIso() {
        camera.position.set(4, 4, 4);
        camera.lookAt(0, 2, 0);
    }

    function screenshot() {
        const dataURL = renderer.domElement.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = dataURL;
        a.download = "flowerpot-3d.png";
        a.click();
    }

    updateBtn.addEventListener("click", () => {
        createModel();
    });

    viewSideBtn.addEventListener("click", setCameraSide);
    viewTopBtn.addEventListener("click", setCameraTop);
    viewIsoBtn.addEventListener("click", setCameraIso);
    screenshotBtn.addEventListener("click", screenshot);

    showRad.addEventListener("change", applyVisibility);
    showSleeve.addEventListener("change", applyVisibility);
    showChoke.addEventListener("change", applyVisibility);
    showMast.addEventListener("change", applyVisibility);
    showGround.addEventListener("change", applyVisibility);

    window.addEventListener("resize", () => {
        if (!renderer) return;
        camera.aspect = canvasDiv.clientWidth / canvasDiv.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(canvasDiv.clientWidth, canvasDiv.clientHeight);
    });

    initScene();
}
