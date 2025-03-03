class FooterComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    async connectedCallback() {
        try {
            const response = await fetch('components/footer/footer-component.html');
            const footerTemplate = await response.text();
            this.shadowRoot.innerHTML = `
                <style>
                    @import url('components/footer/footer.css');
                </style>
                ${footerTemplate}
            `;

            // FAQ Accordion Toggle
            const faqHeaders = this.shadowRoot.querySelectorAll('.faq-header');
            faqHeaders.forEach(header => {
                header.addEventListener('click', () => {
                    const faqItem = header.parentElement;
                    faqItem.classList.toggle('active');
                });
            });

            // Typewriter Animation Trigger using Intersection Observer
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
}

customElements.define('footer-component', FooterComponent);
