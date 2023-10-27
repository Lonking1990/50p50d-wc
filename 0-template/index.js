class TemplateWebComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.template = document.createElement("template");
        this.template.innerHTML = /*html*/ `
        `;
        this.templateElement = document.createElement("template");
    }

    connectedCallback() {
        const shadowRootDom = this.template.content.cloneNode(true);
        this.shadowRoot.appendChild(shadowRootDom);
    }
}

customElements.define("template-web-component", TemplateWebComponent);