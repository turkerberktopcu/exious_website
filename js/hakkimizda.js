// 1) Import Three.js module
import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.module.js';

// 2) Import GSAP and ScrollTrigger
import { gsap } from 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js';
import { ScrollTrigger } from 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js';
gsap.registerPlugin(ScrollTrigger);

// =========================================================
// BG CANVAS PARTICLE SYSTEM
// =========================================================
(function createBackgroundParticles() {
  // Arka plan canvas'ı
  const canvas = document.getElementById('bg-canvas');
  const bgScene = new THREE.Scene();
  
  const bgCamera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  bgCamera.position.z = 20;
  
  const bgRenderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true
  });
  bgRenderer.setSize(window.innerWidth, window.innerHeight);
  bgRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  
  // Particle sistem oluştur
  const particlesGeometry = new THREE.BufferGeometry();
  const particleCount = 1500;
  
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);
  
  const primaryColor = new THREE.Color(0xff4757);  // --primary-color
  const secondaryColor = new THREE.Color(0xff6b81); // --secondary-color
  
  for(let i = 0; i < particleCount; i++) {
    // Pozisyon
    positions[i * 3] = (Math.random() - 0.5) * 50;     // x
    positions[i * 3 + 1] = (Math.random() - 0.5) * 50; // y
    positions[i * 3 + 2] = (Math.random() - 0.5) * 40; // z
    
    // Renk (primary ve secondary arasında)
    const mixRatio = Math.random();
    const particleColor = new THREE.Color().lerpColors(primaryColor, secondaryColor, mixRatio);
    colors[i * 3] = particleColor.r;
    colors[i * 3 + 1] = particleColor.g;
    colors[i * 3 + 2] = particleColor.b;
    
    // Boyut
    sizes[i] = Math.random() * 3 + 1;
  }
  
  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  particlesGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  
  // Materyal
  const particlesMaterial = new THREE.PointsMaterial({
    size: 0.15,
    sizeAttenuation: true,
    transparent: true,
    alphaTest: 0.01,
    vertexColors: true,
  });
  
  // Nokta bulutları
  const particles = new THREE.Points(particlesGeometry, particlesMaterial);
  bgScene.add(particles);
  
  // Animasyon
  function animateParticles() {
    requestAnimationFrame(animateParticles);
    
    // Scroll hareketine duyarlı
    const scrollPos = window.scrollY;
    particles.rotation.y = scrollPos * 0.0002;
    particles.rotation.x = scrollPos * 0.0001;
    
    // Partikül gruplarını hafifçe hareket ettir
    particles.rotation.y += 0.0005;
    particles.rotation.x += 0.0002;
    
    bgRenderer.render(bgScene, bgCamera);
  }
  
  animateParticles();
  
  // Yeniden boyutlandırma
  window.addEventListener('resize', () => {
    bgCamera.aspect = window.innerWidth / window.innerHeight;
    bgCamera.updateProjectionMatrix();
    bgRenderer.setSize(window.innerWidth, window.innerHeight);
    bgRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  });
  
})();

// =========================================================
// Story 3D Canvas
// =========================================================
(function createStory3DCanvas() {
  const storyCanvas = document.getElementById('story-3d-canvas');
  if (storyCanvas) {
    const storyScene = new THREE.Scene();

    // Camera
    const storyCamera = new THREE.PerspectiveCamera(
      75,
      storyCanvas.clientWidth / storyCanvas.clientHeight,
      0.1,
      1000
    );
    storyCamera.position.z = 25;

    // Renderer
    const storyRenderer = new THREE.WebGLRenderer({
      canvas: storyCanvas,
      alpha: true,
      antialias: true
    });
    storyRenderer.setSize(storyCanvas.clientWidth, storyCanvas.clientHeight);
    storyRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Ambient Light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    storyScene.add(ambientLight);
    
    // Directional Light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    storyScene.add(directionalLight);
    
    // Create a 3D object - for example, a simple mesh
    const geometry = new THREE.IcosahedronGeometry(10, 1);
    const material = new THREE.MeshStandardMaterial({ 
      color: 0xff4757,
      wireframe: true
    });
    const mesh = new THREE.Mesh(geometry, material);
    storyScene.add(mesh);
    
    // Animation
    function animateStory() {
      requestAnimationFrame(animateStory);
      
      // Rotate the mesh
      mesh.rotation.y += 0.005;
      mesh.rotation.x += 0.002;
      
      // Render
      storyRenderer.render(storyScene, storyCamera);
    }
    
    animateStory();
    
    // Resize handling
    window.addEventListener('resize', () => {
      // Update camera
      storyCamera.aspect = storyCanvas.clientWidth / storyCanvas.clientHeight;
      storyCamera.updateProjectionMatrix();
      
      // Update renderer
      storyRenderer.setSize(storyCanvas.clientWidth, storyCanvas.clientHeight);
      storyRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });
    
    // Scroll animations with GSAP
    gsap.to(mesh.rotation, {
      y: Math.PI * 2,
      scrollTrigger: {
        trigger: storyCanvas,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      }
    });
  }
})();