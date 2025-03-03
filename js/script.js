// js/script.js
window.addEventListener('load', () => {
    // Verify loading
    console.log('GSAP:', window.gsap);
    console.log('ScrollTrigger:', window.ScrollTrigger);

    // Register ScrollTrigger safely
    if (typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
    } else {
        console.error('ScrollTrigger is not defined');
        return; // Exit if ScrollTrigger isn't available
    }

    // Hero animation
    gsap.from(".hero-content", {
        duration: 1.5,
        y: 100,
        opacity: 0,
        ease: "power4.out"
    });

    // Enhanced Cards animation
    const cards = document.querySelectorAll('.card');
    const cardsContainer = document.querySelector('.cards-container');
    
    // Set initial card styles
    cards.forEach((card, index) => {
        card.style.setProperty('--index', index);
    });
    
    // Create timeline for cards section
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: ".cards-section",
            start: "top top",
            end: "+=300%",
            scrub: 1,
            pin: true
        }
    });
    
    // Initial animation - cards coming from bottom
    cards.forEach((card, index) => {
        tl.fromTo(card,
            { y: '100vh', opacity: 0, rotation: index === 0 ? 15 : index === 2 ? -15 : 0 }, 
            { 
                y: 0, 
                opacity: 1, 
                duration: 1,
                onComplete: () => {
                    // Set final positions once animation is complete
                    if (index === 0) {
                        gsap.set(card, { x: -220, z: -50, rotationY: 15 });
                    } else if (index === 2) {
                        gsap.set(card, { x: 220, z: -50, rotationY: -15 });
                    } else {
                        gsap.set(card, { z: 50, rotationY: 0 });
                    }
                }
            },
            index * 0.5 // Staggered timing
        );
    });
    
    // Add 3D effect on mouse movement (for desktop)
    if (window.innerWidth > 992) {
        cardsContainer.addEventListener('mousemove', (e) => {
            // Calculate mouse position relative to container
            const rect = cardsContainer.getBoundingClientRect();
            const xPos = ((e.clientX - rect.left) / rect.width) - 0.5;
            const yPos = ((e.clientY - rect.top) / rect.height) - 0.5;
            
            cards.forEach((card, index) => {
                // Different intensity based on card position
                const modifier = index === 1 ? 0.5 : 1;
                const baseRotationY = index === 0 ? 15 : index === 2 ? -15 : 0;
                
                gsap.to(card, {
                    rotationY: baseRotationY + (xPos * 10 * modifier),
                    rotationX: -yPos * 8 * modifier,
                    duration: 0.5,
                    ease: "power1.out"
                });
            });
        });
        
        // Reset rotations when mouse leaves
        cardsContainer.addEventListener('mouseleave', () => {
            cards.forEach((card, index) => {
                if (index === 0) {
                    gsap.to(card, { rotationY: 15, rotationX: 0, duration: 0.5 });
                } else if (index === 1) {
                    gsap.to(card, { rotationY: 0, rotationX: 0, duration: 0.5 });
                } else if (index === 2) {
                    gsap.to(card, { rotationY: -15, rotationX: 0, duration: 0.5 });
                }
            });
        });
        
        // Add click handler to bring selected card to front
        cards.forEach((card) => {
            card.addEventListener('click', () => {
                // Reset all cards first
                cards.forEach((c) => {
                    gsap.to(c, { 
                        scale: 1, 
                        z: c === card ? 80 : -20,
                        duration: 0.5
                    });
                });
                
                // Then highlight the clicked card
                gsap.to(card, { 
                    scale: 1.1, 
                    z: 100, 
                    x: 0, 
                    rotationY: 0, 
                    duration: 0.5,
                    onComplete: () => {
                        card.style.zIndex = 10;
                        
                        // Reset card position on second click
                        card.addEventListener('click', () => {
                            cards.forEach((c, i) => {
                                card.style.zIndex = i === 1 ? 3 : 1;
                                if (i === 0) {
                                    gsap.to(c, { x: -220, z: -50, rotationY: 15, scale: 1, duration: 0.5 });
                                } else if (i === 1) {
                                    gsap.to(c, { x: 0, z: 50, rotationY: 0, scale: 1, duration: 0.5 });
                                } else if (i === 2) {
                                    gsap.to(c, { x: 220, z: -50, rotationY: -15, scale: 1, duration: 0.5 });
                                }
                            });
                        }, { once: true });
                    }
                });
            });
        });
    }

    // Intersection Observer (unchanged)
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
});