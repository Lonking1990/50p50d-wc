class HiddenSearchComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.template = document.createElement("template");
        this.template.innerHTML = /*html*/ `
        <style>
            .container {
                --background-color: white;
                --icon-size: 40px;
                --icon-color: black;
                --icon-padding: 0px;
                --input-font-size:20px;
                --input-color: #333;
                --input-padding: 15px;
                --input-background-color: white;
                --max-width: 200px;

                display: flex;
                flex-direction: row;
                justify-content: center;
                align-items: center;
                background-color: var(--background-color);
            }
            .icon {
                width: var(--icon-size);
                height: var(--icon-size);
                padding: 0 var(--icon-padding);
                cursor: pointer;
            }
            .icon path {
                fill: var(--icon-color);
            }
            input {
                border: 0;
                padding: 0;
                width: 0;
                outline: 0;
                height: var(--icon-size);
                font-size: var(--input-font-size);
                transition: width .5s, padding .5s;
                color: var(--input-color);
                background-color: var(--input-background-color);
            }

            .active input {
                width: calc(var(--max-width) - var(--icon-size) - calc(2 * var(--input-padding)));
                padding: 0 var(--input-padding);
            }

            input:focus, input:active {
                outline: 0;
            }
        </style>
        <div class="container">
            <input type="text" class="" placeholder="Search..."/>
            <svg class="icon" fill="#000000" height="800px" width="800px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
                <path class="cls-1" d="M13.07336,12.29053,10.14679,9.364a3.9711,3.9711,0,1,0-.78284.78284l2.92658,2.92657Zm-6.064-2.4516A2.82914,2.82914,0,1,1,9.8385,7.00934,2.83286,2.83286,0,0,1,7.00934,9.83893Z"/>
            </svg>
        </div>
        `;
        this.templateElement = document.createElement("template");
    }

    connectedCallback() {
        const shadowRootDom = this.template.content.cloneNode(true);
        
        this.backgroundColor =  this.getAttribute("background-color") || "white";
        this.iconSize =  this.getAttribute("icon-size") || "40px";
        this.iconColor =  this.getAttribute("icon-color") || "black";
        this.iconPadding =  this.getAttribute("icon-padding") || "0px";
        this.inputFontSize =  this.getAttribute("input-font-size") || "20px";
        this.inputColor =  this.getAttribute("input-color") || "#333";
        this.inputPadding =  this.getAttribute("input-padding") || "15px";
        this.inputBackgroundColor =  this.getAttribute("input-background-color") || "white";
        this.maxWidth =  this.getAttribute("max-width") || "200px";

        const container = shadowRootDom.querySelector(".container");
        container.style.setProperty('--background-color', this.backgroundColor);
        container.style.setProperty('--icon-size', this.iconSize);
        container.style.setProperty('--icon-color', this.iconColor);
        container.style.setProperty('--icon-padding', this.iconPadding);
        container.style.setProperty('--input-font-size', this.inputFontSize);
        container.style.setProperty('--input-color', this.inputColor);
        container.style.setProperty('--input-padding', this.inputPadding);
        container.style.setProperty('--input-background-color', this.inputBackgroundColor);
        container.style.setProperty('--max-width', this.maxWidth);

        shadowRootDom.querySelector(".icon").addEventListener("click", e => {
            e.target.closest(".icon").parentElement.classList.toggle("active");
        });

        this.shadowRoot.appendChild(shadowRootDom);
    }
}

customElements.define("hidden-search-component", HiddenSearchComponent);