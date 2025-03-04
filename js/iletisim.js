import { db } from '../firebase-config.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";





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