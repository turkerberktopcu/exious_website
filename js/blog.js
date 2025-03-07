import { db } from '../firebase-config.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

const blogListContainer = document.querySelector('.blog-list-container');
const modalOverlay = document.querySelector('.blog-modal-overlay');
const modalBox = document.querySelector('.blog-modal');
const modalCloseBtn = document.querySelector('.blog-modal-close');
const modalTitle = document.querySelector('.blog-modal-title');
const modalContent = document.querySelector('.blog-modal-content');

// Loader functions
function showLoader() {
  const loaderEl = document.getElementById('loader');
  if (loaderEl) loaderEl.style.display = 'flex';
}
function hideLoader() {
  const loaderEl = document.getElementById('loader');
  if (loaderEl) loaderEl.style.display = 'none';
}

// Fetch and display blogs
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
    } else {
      let html = '';
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        const docId = docSnap.id;
        const title = data.title || "Untitled";
        const excerpt = data.excerpt || "";
        const dateString = data.createdAt?.toDate().toLocaleString("tr-TR", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        }) || 'Tarih Yok';

        // We DO NOT render the <img> in the card. Instead, we only store the image in a data attribute.
        html += `
          <div class="blog-card"
               data-id="${docId}"
               data-title="${encodeURIComponent(title)}"
               data-content="${encodeURIComponent(data.content || '')}"
               data-image="${encodeURIComponent(data.image || '')}">
            <div class="blog-card-header">
              <h3>${title}</h3>
              <span class="blog-card-date">${dateString}</span>
            </div>
            <p class="blog-excerpt">${excerpt}</p>
          </div>
        `;
      });
      blogListContainer.innerHTML = html;
    }
  } catch (error) {
    console.error("Error fetching blogs:", error);
  } finally {
    hideLoader();
  }
});

// Event delegation for blog card clicks
blogListContainer.addEventListener('click', (e) => {
  const card = e.target.closest('.blog-card');
  if (card) {
    const cardTitle = decodeURIComponent(card.getAttribute('data-title'));
    const cardContent = decodeURIComponent(card.getAttribute('data-content'));
    const cardImage = decodeURIComponent(card.getAttribute('data-image'));
    openBlogModal(cardTitle, cardContent, cardImage);
  }
});

// Open modal and include image if available
function openBlogModal(title, content, image) {
  modalTitle.textContent = title;
  let modalHtml = '';
  if (image) {
    modalHtml += `<img class="blog-modal-image" src="${image}" alt="${title}">`;
  }
  modalHtml += content;
  modalContent.innerHTML = modalHtml;
  modalOverlay.classList.add('active');
}

// Close modal
function closeBlogModal() {
  modalOverlay.classList.remove('active');
}

modalCloseBtn.addEventListener('click', closeBlogModal);
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) {
    closeBlogModal();
  }
});
