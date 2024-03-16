class ScrollAnimation extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.template = document.createElement("template");
        this.template.innerHTML = /*html*/ `
            <style>
                #animatedContent {
                    text-align: center;
                }
                #animatedContent > * {
                    transition: translate .5s;
                }
                #animatedContent > *:not(.visible):nth-child(2n){
                    translate: calc(-50vw - 50% + 20px) 0;
                }
                #animatedContent > *:not(.visible):nth-child(2n+1){
                    translate: calc(50vw + 50% - 20px) 0;
                }
            </style>
            <div id="animatedContent"></div>
        `;
        this.templateElement = document.createElement("template");
    }

    connectedCallback() {
        const shadowRootDom = this.template.content.cloneNode(true);
        this.shadowRoot.appendChild(shadowRootDom);

        const animatedContainer = this.shadowRoot.getElementById("animatedContent");
        animatedContainer.innerHTML = this.innerHTML;

        const observer = new IntersectionObserver(this.scrollCallback, {
            root: null,
            rootMargin: "0px",
            threshold: 0.0,
        });
        [...animatedContainer.children].forEach(child => {
            observer.observe(child);
        });
    }

    scrollCallback(intersections) {
        intersections.forEach(intersect => {
            intersect.target.classList.toggle("visible", intersect.isIntersecting)
        });
    }
}

customElements.define("scroll-animation", ScrollAnimation);