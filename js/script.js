// GSAP Animasyonları
gsap.from(".hero-content", {
    duration: 1.5,
    y: 100,
    opacity: 0,
    ease: "power4.out"
});

// Intersection Observer
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, { threshold: 0.3 });

document.querySelectorAll('section').forEach(section => {
    observer.observe(section);
});
