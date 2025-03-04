import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.module.js';

// Three.js sahnesi
const scene = new THREE.Scene();

// Kamera ayarları
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 20;

// Renderer
const canvas = document.getElementById('bg-canvas');
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true
});
renderer.setSize(window.innerWidth, window.innerHeight);

// TorusKnot geometri ve materyali
const geometry = new THREE.TorusKnotGeometry(6, 1.5, 120, 16);
const material = new THREE.MeshBasicMaterial({
  color: 0xff4757,
  wireframe: true
});
const torusKnot = new THREE.Mesh(geometry, material);
scene.add(torusKnot);

// Animasyon döngüsü
function animate() {
  requestAnimationFrame(animate);

  // TorusKnot'u yavaşça döndür
  torusKnot.rotation.x += 0.003;
  torusKnot.rotation.y += 0.006;

  renderer.render(scene, camera);
}
animate();

// Ekran boyutu değişince yeniden boyutlandırma
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// GSAP ile küçük bir giriş animasyonu (isteğe bağlı)
gsap.from('.about-hero-container', {
  duration: 1.5,
  y: 50,
  opacity: 0,
  ease: 'power4.out'
});
