// footer-component.js
import { db } from '../../firebase-config.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

class FooterComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  async connectedCallback() {
    try {
      // 1) Fetch the base HTML template
      const response = await fetch('components/footer/footer-component.html');
      let footerTemplate = await response.text();

      // 2) Fetch the 'faq' doc (which also has socialLinks)
      const faqData = await this.getFAQData();

      // 3) Build the FAQ HTML
      let faqHTML = '';
      if (faqData && faqData.items) {
        faqData.items.forEach(item => {
          faqHTML += `
            <div class="faq-item">
              <div class="faq-header">
                <p class="faq-question">${item.question}</p>
                <span class="faq-toggle">+</span>
              </div>
              <p class="faq-answer">${item.answer}</p>
            </div>
          `;
        });
      } else {
        // Fallback if no FAQ doc
        faqHTML = `
          <div class="faq-item">
            <div class="faq-header">
              <p class="faq-question">Soru bulunamadı</p>
              <span class="faq-toggle">+</span>
            </div>
            <p class="faq-answer">Henüz bir SSS eklenmedi.</p>
          </div>
        `;
      }

      // 4) Replace the FAQ block in footer HTML
      footerTemplate = footerTemplate.replace(
        /<div class="footer-section faq-section">[\s\S]*?<\/div>/,
        `<div class="footer-section faq-section">
           <h4>Sık Sorulan Sorular</h4>
           ${faqHTML}
         </div>`
      );

      // 5) Build the Social Links HTML
      let socialHTML = '';
      if (faqData && faqData.socialLinks) {
        faqData.socialLinks.forEach(link => {
          socialHTML += `
            <a href="${link.url}" class="social-icon" target="_blank">
              ${link.label}
            </a>
          `;
        });
      }

      // 6) Replace the existing .social-links block
      footerTemplate = footerTemplate.replace(
        /<div class="social-links">[\s\S]*?<\/div>/,
        `<div class="social-links">
           ${socialHTML}
         </div>`
      );

      // 7) Insert final template + styles into Shadow DOM
      this.shadowRoot.innerHTML = `
        <style>
          @import url('components/footer/footer.css');
        </style>
        ${footerTemplate}
      `;

      // FAQ accordion toggle
      const faqHeaders = this.shadowRoot.querySelectorAll('.faq-header');
      faqHeaders.forEach(header => {
        header.addEventListener('click', () => {
          header.parentElement.classList.toggle('active');
        });
      });

      // Typewriter animation
      const typewriterEl = this.shadowRoot.querySelector('.typewriter');
      if (typewriterEl) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              typewriterEl.classList.add('animate-typewriter');
              observer.unobserve(entry.target);
            }
          });
        }, { threshold: 0.5 });
        observer.observe(typewriterEl);
      }
    } catch (error) {
      console.error('Error loading footer template:', error);
    }
  }

  /** Fetch the 'faq' doc from Firestore */
  async getFAQData() {
    try {
      const docRef = doc(db, 'site_content', 'faq');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data(); // { items: [...], socialLinks: [...] }
      } else {
        console.warn('No FAQ document found in Firestore.');
        return null;
      }
    } catch (error) {
      console.error('Error fetching FAQ data:', error);
      return null;
    }
  }
}

customElements.define('footer-component', FooterComponent);
