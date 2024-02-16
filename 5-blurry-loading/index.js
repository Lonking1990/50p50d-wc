class BlurryLoading extends HTMLElement {

    constructor() {
        super();
        this.totalValue = null;
        this.currentValue = null;
        this.maxBlur = null;

        this.attachShadow({ mode: "open" });
        this.template = document.createElement("template");
        this.template.innerHTML = /*html*/ `
            <style>
                .container {
                    --color: white;
                    --font-size: 10rem;
                    --font-family: sans-serif;
                }
                .percentage {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translateX(-50%) translateY(-50%);
                    font-family: var(--font-family);
                    font-size: var(--font-size);
                    color: var(--color);
                }
            </style>
            <div class="container">
                <div class="content"></div>
                <div class="percentage"><span class="number">0</span>%</div>
            </div>
        `;
        this.templateElement = document.createElement("template");
    }

    connectedCallback() {
        const shadowRootDom = this.template.content.cloneNode(true);

        const container = shadowRootDom.querySelector(".container");
        container.style.setProperty("--font-family", this.getAttribute("font-family") || "sans-serif");
        container.style.setProperty("--font-size", this.getAttribute("font-size") || "10rem");
        container.style.setProperty("--color", this.getAttribute("color") || "white");
        
        const currentValue = parseInt(this.getAttribute("current-value") || "0");
        const totalValue = parseInt(this.getAttribute("total-value") || "100");
        const maxBlur = parseInt(this.getAttribute("max-blur") || "10");
        this.currentValue = currentValue;
        this.totalValue = totalValue;
        this.maxBlur = maxBlur;

        const content = container.querySelector(".content");
        content.innerHTML = this.innerHTML;

        this.shadowRoot.appendChild(shadowRootDom);

        this.updatePorcentage();
    }

    updatePorcentage(){
        const percentage = Math.floor(this.currentValue*100/this.totalValue);
        this.shadowRoot.querySelector(".percentage").style.opacity = (100 - percentage)+"%";
        this.shadowRoot.querySelector(".number").innerText = percentage;
        const blur = Math.floor(this.maxBlur * (100 - percentage)/100); 
        this.shadowRoot.querySelector(".content").style.filter = `blur(${blur}px)`;
    }

    static get observedAttributes () {
        return ['current-value'];
    }

    attributeChangedCallback (name, oldValue, newValue) {
        switch(name){
            case 'current-value':
                this.currentValue = parseInt(newValue,10);
                this.updatePorcentage();
                break;
            default:
                // Do nothing
        }
    }
}

customElements.define("blurry-loading", BlurryLoading);

let currentValue = 0;
const maxValue = 100;

const interval = setInterval(() => {
    if(currentValue >= maxValue){
        clearInterval(interval);
        return;
    }
    currentValue++;
    document.querySelector("blurry-loading").setAttribute("current-value", currentValue);
}, 25);