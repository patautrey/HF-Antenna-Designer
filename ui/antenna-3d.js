// /ui/antenna-3d.js

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.164/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.164/examples/jsm/controls/OrbitControls.js";

export function renderAntenna3D(deckText, container) {
  container.innerHTML = ""; // Clear previous render

  const width = 600;
  const height = 400;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf9f9f9);

  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  camera.position.set(5, 5, 5);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  container.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  const axesHelper = new THREE.AxesHelper(2);
  scene.add(axesHelper);

  const lines = deckText.split("\n").filter(l => l.startsWith("GW"));

  const material = new THREE.LineBasicMaterial({ color: 0x1e3a5f });

  const group = new THREE.Group();

  lines.forEach(line => {
    const parts = line.split(" ").filter(Boolean);

    const x1 = parseFloat(parts[3]);
    const y1 = parseFloat(parts[4]);
    const z1 = parseFloat(parts[5]);

    const x2 = parseFloat(parts[6]);
    const y2 = parseFloat(parts[7]);
    const z2 = parseFloat(parts[8]);

    const geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(x1, z1, y1),
      new THREE.Vector3(x2, z2, y2)
    ]);

    const segment = new THREE.Line(geometry, material);
    group.add(segment);
  });

  scene.add(group);

  const box = new THREE.Box3().setFromObject(group);
  const size = box.getSize(new THREE.Vector3()).length();
  const center = box.getCenter(new THREE.Vector3());

  controls.target.copy(center);
  camera.position.set(center.x + size, center.y + size, center.z + size);
  camera.lookAt(center);

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }

  animate();
}
