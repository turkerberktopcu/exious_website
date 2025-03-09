document.addEventListener('DOMContentLoaded', () => {
    // Load CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'components/header/header.css';
    document.head.appendChild(link);
  
    // Load HTML
    fetch('components/header/header.html')
      .then(response => response.text())
      .then(html => {
        document.body.insertAdjacentHTML('afterbegin', html);
        
        // Now that the header is loaded, add the event listener
        const hamburger = document.querySelector('.hamburger');
        const navLinks = document.querySelector('.nav-links');
        
        if (hamburger && navLinks) {
          hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
          });
        }
      })
      .catch(error => console.error('Error loading header:', error));
  });
  