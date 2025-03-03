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
        } catch (error) {
            console.error('Error loading footer template:', error);
        }
    }
}

customElements.define('footer-component', FooterComponent);
