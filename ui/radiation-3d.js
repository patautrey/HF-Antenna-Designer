// /ui/radiation-3d.js

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.164/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.164/examples/jsm/controls/OrbitControls.js";

export function renderRadiationPattern3D(container, necOutputText = null) {
  container.innerHTML = "";
  const width = 600;
  const height = 400;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf9f9f9);

  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  camera.position.set(4, 4, 4);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  container.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(5, 5, 5);
  scene.add(light);
  scene.add(new THREE.AmbientLight(0x888888));

  // Parse NEC output or simulate pattern
  const points = [];
  const stepsTheta = 36;
  const stepsPhi = 72;

  for (let i = 0; i <= stepsTheta; i++) {
    const theta = (i / stepsTheta) * Math.PI;
    for (let j = 0; j <= stepsPhi; j++) {
      const phi = (j / stepsPhi) * 2 * Math.PI;

      // Simulated gain pattern (simple dipole figure‑8)
      const gain = Math.abs(Math.sin(theta)) * (1 + 0.2 * Math.cos(phi));
      const r = gain;

      const x = r * Math.sin(theta) * Math.cos(phi);
      const y = r * Math.sin(theta) * Math.sin(phi);
      const z = r * Math.cos(theta);

      points.push(new THREE.Vector3(x, y, z));
    }
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.PointsMaterial({ color: 0xff6600, size: 0.03 });
  const mesh = new THREE.Points(geometry, material);
  scene.add(mesh);

  const axes = new THREE.AxesHelper(1.5);
  scene.add(axes);

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }

  animate();
}
