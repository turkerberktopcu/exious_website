import { db } from '../firebase-config.js';
import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

// GSAP and Three.js are loaded via CDN in HTML

const blogListContainer = document.querySelector('.blog-list-container');
const modalOverlay = document.querySelector('.blog-modal-overlay');
const modalBox = document.querySelector('.blog-modal');
const modalCloseBtn = document.querySelector('.blog-modal-close');
const modalTitle = document.querySelector('.blog-modal-title');
const modalContent = document.querySelector('.blog-modal-content');

// Loader
function showLoader() {
  const loaderEl = document.getElementById('loader');
  if (loaderEl) loaderEl.style.display = 'flex';
}
function hideLoader() {
  const loaderEl = document.getElementById('loader');
  if (loaderEl) loaderEl.style.display = 'none';
}

// Three.js Background Setup
function initThreeJS() {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const canvas = document.getElementById('bg-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Particle System - Reduced particle count for optimization
  const particlesGeometry = new THREE.BufferGeometry();
  const particleCount = 500; // reduced from 1000
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 1000; // Spread particles in 3D space
  }
  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particlesMaterial = new THREE.PointsMaterial({ color: 0xff4757, size: 2, transparent: true, opacity: 0.5 });
  const particles = new THREE.Points(particlesGeometry, particlesMaterial);
  scene.add(particles);

  camera.position.z = 200;

  function animate() {
    requestAnimationFrame(animate);
    // Only animate if document is visible to reduce CPU load
    if (!document.hidden) {
      particles.rotation.y += 0.001;
      renderer.render(scene, camera);
    }
  }
  animate();

  // Debounced Resize Handler
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    }, 100);
  });
}

// Fetch and Display Blogs
window.addEventListener('DOMContentLoaded', async () => {
  initThreeJS(); // Start 3D background
  showLoader();
  try {
    const snapshot = await getDocs(collection(db, 'blogs'));

    if (snapshot.empty) {
      blogListContainer.innerHTML = `
        <div class="empty-blog-state">
          <h2>Henüz bir blog eklenmedi</h2>
          <p>Yakında neon ışıkları altında efsanevi içerikler sizi bekliyor.</p>
          <div class="empty-blog-deco"></div>
        </div>
      `;
      gsap.from('.empty-blog-state', { opacity: 0, y: 50, duration: 1, ease: 'power3.out' });
    } else {
      let html = '';
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        const docId = docSnap.id;
        const title = data.title || "Untitled";
        const excerpt = data.excerpt || "";
        let dateString = data.createdAt?.toDate().toLocaleString("tr-TR", {
          year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
        }) || 'Tarih Yok';

        html += `
          <div class="blog-card"
               data-id="${docId}"
               data-title="${encodeURIComponent(title)}"
               data-content="${encodeURIComponent(data.content || '')}">
            <div class="blog-card-header">
              <h3>${title}</h3>
              <span class="blog-date">${dateString}</span>
            </div>
            <p class="blog-excerpt">${excerpt}</p>
          </div>
        `;
      });

      blogListContainer.innerHTML = html;

      // Animate Blog Cards with GSAP
      gsap.from('.blog-card', {
        opacity: 0,
        y: 50,
        stagger: 0.1,
        duration: 0.8,
        ease: 'power3.out'
      });
    }
  } catch (error) {
    console.error("Error fetching blogs:", error);
  } finally {
    hideLoader();
  }
});

// Event Delegation for Blog Card Click and Hover Animations
blogListContainer.addEventListener('click', (e) => {
  const card = e.target.closest('.blog-card');
  if (card) {
    const cardTitle = decodeURIComponent(card.getAttribute('data-title'));
    const cardContent = decodeURIComponent(card.getAttribute('data-content'));
    openBlogModal(cardTitle, cardContent);
  }
});

blogListContainer.addEventListener('mouseover', (e) => {
  const card = e.target.closest('.blog-card');
  if (card) {
    gsap.to(card, { scale: 1.05, duration: 0.3, ease: 'power2.out' });
  }
});

blogListContainer.addEventListener('mouseout', (e) => {
  const card = e.target.closest('.blog-card');
  if (card) {
    gsap.to(card, { scale: 1, duration: 0.3, ease: 'power2.out' });
  }
});

// Open Modal with GSAP Animation
function openBlogModal(title, content) {
  modalTitle.textContent = title;
  modalContent.innerHTML = content;

  modalOverlay.classList.add('active');
  gsap.fromTo(modalBox, 
    { scale: 0.9, opacity: 0, y: 20 },
    { scale: 1, opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
  );
}


// Close Modal with GSAP Animation
function closeBlogModal() {
  gsap.to(modalBox, {
    scale: 0.8,
    opacity: 0,
    y: 50,
    duration: 0.5,
    ease: 'power3.in',
    onComplete: () => {
      modalOverlay.classList.remove('active');
    }
  });
}

modalCloseBtn.addEventListener('click', closeBlogModal);
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeBlogModal();
});
