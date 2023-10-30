class RotatingNavigation extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.template = document.createElement("template");
        this.template.innerHTML = /*html*/ `
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Open+Sans&display=swap');

                .content{
                    font-family: 'Open Sans';
                    font-size: 16px;
                    color: #333;
                    --radial-background-color: lightcoral;
                    --radial-color: white;
                    --radial-transition: .5s;
                    --radial-radius: 100px;
                    --menu-background-color: #333;
                    --menu-color: white;
                }

                .menu {
                    position: fixed;
                    top: calc(-1 * var(--radial-radius));
                    left: calc(-1 * var(--radial-radius));
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    grid-template-rows: 1fr 1fr;
                    grid-template-areas: "none none" "close open";
                    justify-items: center;
                    align-items: center;
                    width: calc(2 * var(--radial-radius));
                    height: calc(2 * var(--radial-radius));
                    margin: 0;
                    padding: 0;
                    border-radius: 50%;
                    background-color: var(--radial-background-color);
                }

                .open {
                    grid-area: open;
                    padding: 0 calc(.2 * var(--radial-radius)) calc(.2 * var(--radial-radius)) 0;
                }

                .hamburger {
                    cursor: pointer;
                }

                .hamburger:hover {
                    background-color:rgba(0,0,0,.1);
                }

                .hamburger > span {
                    display: block;
                    width: 1.4rem;
                    height: 3px;
                    background: var(--radial-color);
                }

                .hamburger .h-middle {
                    margin: 4px 0;
                }

                .close {
                    grid-area: close;
                }
            </style>
            <div class="content">
                <div class="menu">
                    <div class="open">
                        <div class="hamburger">
                            <span class="h-top"></span>
                            <span class="h-middle"></span>
                            <span class="h-bottom"></span>
                        </div>
                    </div>
                    <div class="close">
                        <div class="cross">
                            <span class="forwardslash"></span>
                            <span class="backslash"></span>
                        </div>
                    </div>
                </div>
                <nav id="menu"></nav>
                <section class="rotating-container">
                </section>
            </div>
        `;
        this.templateElement = document.createElement("template");
    }

    connectedCallback() {
        const shadowRootDom = this.template.content.cloneNode(true);

        const navSelector = this.getAttribute("nav-selector") || "nav";
        const contentSelector = this.getAttribute("content-selector") || "section";

        shadowRootDom.querySelector("nav").innerHTML = this.querySelector(navSelector).innerHTML;
        shadowRootDom.querySelector("section").innerHTML = this.querySelector(contentSelector).innerHTML;

        this.shadowRoot.appendChild(shadowRootDom);
    }
}

customElements.define("rotating-navigation", RotatingNavigation);