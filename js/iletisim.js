
  import { db } from '../firebase-config.js'; 
  import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

  // 1) Grab the form
  const contactForm = document.querySelector('.contact-form');

  // 2) Listen for form submit
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // prevent default page reload

    // 3) Get input values
    const nameValue = document.getElementById('name').value;
    const emailValue = document.getElementById('email').value;
    const messageValue = document.getElementById('message').value;

    try {
      // 4) Add a new doc in "contact_messages" collection (create if not exist)
      await addDoc(collection(db, 'contact_messages'), {
        name: nameValue,
        email: emailValue,
        message: messageValue,
        createdAt: serverTimestamp() // optional timestamp
      });

      // 5) Alert or show success message
      alert('Mesajınız başarıyla gönderildi!');

      // 6) Reset the form
      contactForm.reset();
    } catch (error) {
      console.error('Form gönderilirken hata oluştu:', error);
      alert('Gönderim hatası: ' + error.message);
    }
  });

