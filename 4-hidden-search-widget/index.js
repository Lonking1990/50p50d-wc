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
            input {
                border: 0;
                padding: 0;
                width: 0;
                outline: 0;
                height: var(--icon-size);
                max-width: calc(var(--max-width) - var(--icon-size) - calc(2 * var(--input-padding)));
                font-size: var(--input-font-size);
                transition: width .5s, padding .5s;
            }

            .active input {
                width: 100%;
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

        shadowRootDom.querySelector(".icon").addEventListener("click", e => {
            e.target.parentElement.classList.toggle("active");
        });

        this.shadowRoot.appendChild(shadowRootDom);
    }
}

customElements.define("hidden-search-component", HiddenSearchComponent);