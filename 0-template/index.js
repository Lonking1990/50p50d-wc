class {{COMPONENT_PASCAL_CASE_NAME}}WebComponent extends HTMLElement {
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

customElements.define("{{COMPONENT_NAME}}-web-component", {{COMPONENT_PASCAL_CASE_NAME}}WebComponent);