import { db } from '../firebase-config.js';
import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

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

// Fetch and Display Blogs
window.addEventListener('DOMContentLoaded', async () => {
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
      // GSAP animasyonu kaldırıldı
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
              <span class="blog-card-date">${dateString}</span>
            </div>
            <p class="blog-excerpt">${excerpt}</p>
          </div>
        `;
      });

      blogListContainer.innerHTML = html;
      
      // GSAP animasyonu kaldırıldı
    }
  } catch (error) {
    console.error("Error fetching blogs:", error);
  } finally {
    hideLoader();
  }
});

// Event Delegation for Blog Card Click
blogListContainer.addEventListener('click', (e) => {
  const card = e.target.closest('.blog-card');
  if (card) {
    const cardTitle = decodeURIComponent(card.getAttribute('data-title'));
    const cardContent = decodeURIComponent(card.getAttribute('data-content'));
    openBlogModal(cardTitle, cardContent);
  }
});

// Hover animasyonları kaldırıldı

// Open Modal (animasyonlar kaldırıldı)
function openBlogModal(title, content) {
  modalTitle.textContent = title;
  modalContent.innerHTML = content;
  modalOverlay.classList.add('active');
  // GSAP animasyonu kaldırıldı
}

// Close Modal (animasyonlar kaldırıldı)
function closeBlogModal() {
  modalOverlay.classList.remove('active');
  // GSAP animasyonu kaldırıldı
}

modalCloseBtn.addEventListener('click', closeBlogModal);
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeBlogModal();
});