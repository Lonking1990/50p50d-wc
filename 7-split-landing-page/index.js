class SplitContent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.template = document.createElement("template");
        this.template.innerHTML = /*html*/ `
            <style>
                #split-content {
                    display: flex;
                    flex-direction: row;
                    gap: 0px;
                    height: 100%;
                }

                .split-content-left,
                .split-content-right{
                    width: 50%;
                    transition: width 1s;
                }

                .split-content-left:hover,
                .split-content-right:hover {
                    width: 90%;
                }
            </style>
            <div id="split-content"></div>
        `;
        this.templateElement = document.createElement("template");
    }

    connectedCallback() {
        const shadowRootDom = this.template.content.cloneNode(true);
        this.shadowRoot.appendChild(shadowRootDom);

        const splitContent = this.shadowRoot.getElementById("split-content");
        splitContent.innerHTML = this.innerHTML;
        const leftContent = this.shadowRoot.querySelector(this.getAttribute("selector-left") || ".left");
        const rightContent = this.shadowRoot.querySelector(this.getAttribute("selector-right") || ".right");
        leftContent.classList.add("split-content-left");
        rightContent.classList.add("split-content-right");        
    }
}

customElements.define("split-content", SplitContent);