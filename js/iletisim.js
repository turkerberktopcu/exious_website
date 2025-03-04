import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.167.1/build/three.module.js';
import { db } from '../firebase-config.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

// Three.js Setup for 3D Background
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('hero-canvas'), alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);

const geometry = new THREE.TorusKnotGeometry(10, 3, 100, 16);
const material = new THREE.MeshBasicMaterial({ color: 0xff4757, wireframe: true });
const torusKnot = new THREE.Mesh(geometry, material);
scene.add(torusKnot);

camera.position.z = 30;

function animate() {
  requestAnimationFrame(animate);
  torusKnot.rotation.x += 0.01;
  torusKnot.rotation.y += 0.01;
  renderer.render(scene, camera);
}
animate();

// Handle Window Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Form Animation on Scroll
const contactSection = document.querySelector('.contact-section');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      contactSection.classList.add('animate-in');
    }
  });
}, { threshold: 0.5 });
observer.observe(contactSection);

// Real-time Email Validation
const emailInput = document.getElementById('email');
emailInput.addEventListener('input', () => {
  if (!emailInput.checkValidity()) {
    emailInput.classList.add('invalid');
  } else {
    emailInput.classList.remove('invalid');
  }
});

// Form Submission with Firebase
const contactForm = document.querySelector('.contact-form');
contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const nameValue = document.getElementById('name').value;
  const emailValue = document.getElementById('email').value;
  const messageValue = document.getElementById('message').value;

  try {
    await addDoc(collection(db, 'contact_messages'), {
      name: nameValue,
      email: emailValue,
      message: messageValue,
      createdAt: serverTimestamp()
    });
    showMessage('Mesajınız başarıyla gönderildi!', 'success');
    contactForm.reset();
  } catch (error) {
    showMessage('Gönderim hatası: ' + error.message, 'error');
  }
});

// Display Success/Error Messages
function showMessage(text, type) {
  const messageDiv = document.createElement('div');
  messageDiv.textContent = text;
  messageDiv.className = `message ${type}`;
  contactForm.appendChild(messageDiv);
  setTimeout(() => messageDiv.remove(), 3000);
}