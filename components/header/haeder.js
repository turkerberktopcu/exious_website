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
        })
        .catch(error => console.error('Error loading header:', error));
});