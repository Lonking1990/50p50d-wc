class ExpandingCards extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.expand = 0;
        this.numElements = 5;
        this.template = document.createElement("template");
        this.template.innerHTML = /*html*/ `
            <style>
                :root {
                    --height: 100%;
                    --collapseWidth: 20%;
                    --expandedWidth: 80%;
                    --itemMargin: 10px;
                }

                .list {
                    height: var(--height);
                    display: flex;
                    flex-direction: row;
                }
                
                .list-entry {
                    margin: var(--itemMargin);
                    height: 100%;
                    width: var(--collapseWidth);
                    border-radius: 50px;
                    box-shadow: 0px 0px 3px inset black;
                    transition: width .75s ease-in-out;
                }

                .list .list-entry.expand { width: var(--expandedWidth); }
            </style>
            <div class="list"></div>
        `;
        this.templateElement = document.createElement("template");
        this.templateElement.innerHTML = /*html*/ `
            <div class="list-entry"></div>
        `;
    }

    expandSelected(){
        const list = this.shadowRoot.querySelectorAll(".list-entry");
        list.forEach(e => e.classList.remove("expand"));
        list[this.expand].classList.add("expand");
    }

    connectedCallback() {
        const shadowRootDom = this.template.content.cloneNode(true);
        this.numElements = parseInt(this.getAttribute("num-elements") || "5", 10);
        const list = shadowRootDom.querySelector(".list");
        for(let i=0;i<this.numElements;i++){
            const listEntryDom = this.templateElement.content.cloneNode(true);
            const listEntry = listEntryDom.querySelector(".list-entry");
            listEntry.style.background = "#"+Math.floor(Math.random()*16777215).toString(16);
            listEntry.setAttribute('item-number',i);
            list.append(listEntryDom);
        }
        this.shadowRoot.querySelectorAll(".list-entry").onclick = () => this.inc();

        [...list.children].forEach(e => {
            e.addEventListener("click", item => {
                this.expand = parseInt(e.getAttribute("item-number"), 10);
                this.expandSelected();
            });
        });
        
        list.style.setProperty('--height', this.getAttribute("height") || "100%");
        const expandedWidth = parseInt(this.getAttribute("expanded-width") || "80");
        const collapseWidth = (Math.round(((100 - expandedWidth) / (this.numElements-1))*100)/100)+"%";
        list.style.setProperty('--collapseWidth', collapseWidth);
        list.style.setProperty('--expandedWidth', expandedWidth+"%");
        list.style.setProperty('--itemMargin', this.getAttribute("item-margin") || "10px");


        this.shadowRoot.appendChild(shadowRootDom);
        this.expandSelected();
    }

}

customElements.define("expanding-cards", ExpandingCards);