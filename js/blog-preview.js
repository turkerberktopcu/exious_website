import { db } from '../firebase-config.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

const blogListContainer = document.querySelector('.blog-list-container');

// Loader Functions
function showLoader() {
  const loaderEl = document.getElementById('loader');
  if (loaderEl) loaderEl.style.display = 'flex';
}
function hideLoader() {
  const loaderEl = document.getElementById('loader');
  if (loaderEl) loaderEl.style.display = 'none';
}

// Fetch and Display Latest Blogs
async function loadLatestBlogs() {
  showLoader();
  try {
    const snapshot = await getDocs(collection(db, 'blogs'));
    let blogs = [];

    snapshot.forEach(doc => {
      blogs.push({ id: doc.id, ...doc.data() });
    });

    // Sort by date (descending) - assumes 'createdAt' is a Firestore Timestamp
    blogs.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

    // Only show the latest 3
    const latestBlogs = blogs.slice(0, 3);

    if (latestBlogs.length === 0) {
      // If no blogs exist, show a placeholder
      blogListContainer.innerHTML = `
        <div class="empty-blog-state">
          <h2>Henüz blog eklenmedi</h2>
          <p>Yakında neon ışıkları altında içerikler sizi bekliyor.</p>
        </div>
      `;
    } else {
      // Build blog cards with the same markup & classes as your static sample
      blogListContainer.innerHTML = latestBlogs.map(blog => {
        // Convert Firestore timestamp to a local date string
        const dateText = blog.createdAt
          ? new Date(blog.createdAt.seconds * 1000).toLocaleDateString("tr-TR")
          : '';

        // Use a fallback image if none is provided
        const imageURL = blog.imageURL || 'assets/images/sample-blog.jpg';

        // Link to a blog detail page or external link if you have one
        const readMoreLink = blog.readMoreLink || '#';

        return `
          <div class="blog-card" data-id="${blog.id}">
            <div class="blog-card-content">
              <div class="blog-card-header">
                <h3>${blog.title || 'Untitled Blog'}</h3>
                <span class="blog-card-date">${dateText}</span>
              </div>
              <p class="blog-card-excerpt">${blog.excerpt || ''}</p>
              <a href="blog.html" class="read-more">Devamını Gör</a>
            </div>
          </div>
        `;
      }).join('');

      // Optional GSAP Animations
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
}

// Load Blogs on Page Load
document.addEventListener('DOMContentLoaded', loadLatestBlogs);
