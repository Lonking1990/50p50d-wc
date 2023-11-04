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
                    background-color: var(--menu-background-color);
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
                    transition: rotate var(--radial-transition);
                    z-index: 100;
                }

                .menu.active {
                    rotate: -90deg;
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
                    padding: 0 0 calc(.2 * var(--radial-radius)) calc(.2 * var(--radial-radius));
                }

                .cross {
                    cursor: pointer;
                    width: 1.4rem;
                    height: 1.4rem;
                }

                .cross:hover {
                    background-color:rgba(0,0,0,.1);
                }

                .cross > span {
                    display: block;
                    height: 3px;
                    background: var(--radial-color);
                    width: 1.4rem;
                }
                
                .cross span.forwardslash {
                    rotate: 45deg;
                    translate: 0 10px;
                }

                .cross span.backslash {
                    rotate: -45deg;
                    translate: 0 7px;
                }

                section {
                    background: white;
                    min-height: 100vh;
                    padding: 4rem;
                    transform-origin: top left;
                    transition: rotate var(--radial-transition), translate var(--radial-transition);
                }

                .menu.active + section {
                    rotate: -20deg;
                    translate: 0 2rem;
                }

                nav {
                    position: fixed;
                    right:100%;
                    bottom: 0px;
                    padding: 2rem;
                    color: var(--menu-color);
                    width:300px;
                }

                nav li {
                    --delayTransition: var(--radial-transition);
                    transition: translate var(--delayTransition);
                }

                .menu.active ~ nav li {
                    translate: 120% 0;
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
                <section class="rotating-container"></section>
                <nav></nav>
            </div>
        `;
        this.templateElement = document.createElement("template");
    }

    connectedCallback() {
        const shadowRootDom = this.template.content.cloneNode(true);

        const navSelector = this.getAttribute("nav-selector") || "nav";
        const contentSelector = this.getAttribute("content-selector") || "section";
        
        const nav = shadowRootDom.querySelector("nav");
        const section = shadowRootDom.querySelector("section"); 
        const menu = shadowRootDom.querySelector(".menu");
        const content = shadowRootDom.querySelector(".content");

        content.style.setProperty("--radial-background-color", this.getAttribute("radial-background-color") || "lightcoral");
        content.style.setProperty("--radial-color", this.getAttribute("radial-color") || "white");
        content.style.setProperty("--radial-transition", ((this.getAttribute("radial-transition") || 500)/1000)+"s");
        content.style.setProperty("--radial-radius", (this.getAttribute("radial-radius") || "100")+"px");
        content.style.setProperty("--menu-background-color", this.getAttribute("menu-background-color") || "#333");
        content.style.setProperty("--menu-color", this.getAttribute("menu-color") || "white");
        
        nav.innerHTML = this.querySelector(navSelector).innerHTML;
        section.innerHTML = this.querySelector(contentSelector).innerHTML;
        shadowRootDom.querySelector(".open").addEventListener("click", e => {
            menu.classList.add("active");
        });
        shadowRootDom.querySelector(".close").addEventListener("click", e => {
            menu.classList.remove("active");
        });

        nav.querySelectorAll("li").forEach(li => {
            const index = [...li.parentElement.children].indexOf(li);
            li.style.setProperty("--delayTransition", (((this.getAttribute("radial-transition") || 500)/1000) + 0.1*index)+"s");
        });

        this.shadowRoot.appendChild(shadowRootDom);
    }
}

customElements.define("rotating-navigation", RotatingNavigation);