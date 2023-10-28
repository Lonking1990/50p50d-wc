class ProgressSteps extends HTMLElement {
    constructor() {
        super();
        this.buttonsLocked = false;
        this.currentStep = 0;
        this.attachShadow({ mode: "open" });
        this.template = document.createElement("template");
        this.template.innerHTML = /*html*/ `
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Open+Sans&display=swap');

                .steps-container {
                    --step-color-inactive: lightgray;
                    --step-color-active: #3498db;
                    --step-width: 1.5rem;
                    --step-height: 1.5rem;
                    --step-gap: 4rem;
                    --step-transition: .3s;
                    font-family: 'Open Sans', sans-serif;
                }

                .steps {
                    display: flex;
                    justify-content: center;
                    flex-direction: row;
                    color: #00000080;
                    line-height: 1rem;
                }

                .step {
                    display: grid;
                    width: var(--step-width);
                    height: var(--step-height);
                    place-items: center;
                    border: 3px solid var(--step-color-inactive);
                    border-radius: 50%;
                    transition: border var(--step-transition);
                }
                
                .step.active {
                    border: 3px solid var(--step-color-active);
                }

                .step + .step {
                    position: relative;
                    margin-left: var(--step-gap);
                }

                .step + .step:before,
                .step + .step:after {
                    content:'';
                    position: absolute;
                    height:3px;
                    width:var(--step-gap);
                    left: calc(-1 * var(--step-gap) - 2px);
                }
                
                .step + .step:before {
                    background-color: var(--step-color-inactive);
                }
                .step + .step:after {
                    width:0px;
                    z-index:1;
                    background-color: var(--step-color-active);
                    transition: width var(--step-transition);
                }
                .step + .step.active:after {
                    width: var(--step-gap);
                }

                .buttons { 
                    display: flex;
                    flex-direction: row;
                    justify-content: center;
                    margin: 2rem auto;
                }

                button {
                    border:0;
                    border-radius:4px;
                    padding: 0.5rem 2rem;
                    background-color: var(--step-color-active);
                    color: white;
                    cursor: pointer;
                }

                button:active{
                    scale: 0.98;
                }
                
                button[disabled] {
                    background-color: var(--step-color-inactive);
                }

                button.next {
                    margin-left: 2rem;
                }

            </style>
            <div class="steps-container">
                <div class="steps"></div>
                <div class="buttons">
                    <button class="prev">Prev</button>
                    <button class="next">Next</button>
                </div>
            </div> 
        `;
        this.templateElement = document.createElement("template");
        this.templateStep = document.createElement("template");
        this.templateStep.innerHTML = /*html*/`
            <div class="step">
                <span class="number">#</span>
            </div> 
        `;
    }

    lockButtons(){
        this.buttonsLocked = true;
        setTimeout(() => {
            this.buttonsLocked = false;
        }, 333);
    }

    next(){
        if(this.buttonsLocked) return;
        this.lockButtons();
        if(this.currentStep < this.steps) {
            this.currentStep++;
        }
        this.updateStatus();
    }

    prev(){
        
        if(this.buttonsLocked) return;
        this.lockButtons();
        if(this.currentStep > 1) {
            this.currentStep--;
        }
        this.updateStatus();
    }

    updateStatus(){
        this.shadowRoot.querySelector("button.prev").disabled = this.currentStep == 1;
        this.shadowRoot.querySelector("button.next").disabled = this.currentStep == this.steps;
        
        const steps = this.shadowRoot.querySelectorAll(".step");
        for(let i=0;i<steps.length;i++){
            steps[i].classList.remove("active");
            if(i < this.currentStep){
                steps[i].classList.add("active");
            } 
        }
    }

    connectedCallback() {
        this.steps = parseInt(this.getAttribute("num-steps") || "4");
        this.currentStep = parseInt(this.getAttribute("init-step") || "1");

        const shadowRootDom = this.template.content.cloneNode(true);
        const stepsDiv = shadowRootDom.querySelector(".steps");
        for(let i=1;i<=this.steps;i++){
            const step = this.templateStep.content.cloneNode(true);
            step.querySelector(".number").innerText = i + "";
            stepsDiv.append(step);
        }

        
        this.stepColorInactive = this.getAttribute("step-color-inactive") || "lightgray";
        this.stepColorActive = this.getAttribute("step-color-active") || "#3498db";
        this.stepWidth = this.getAttribute("step-width") || "1.5rem";
        this.stepHeight = this.getAttribute("step-height") || "1.5rem";
        this.stepGap = this.getAttribute("step-gap") || "4rem";
        this.stepTransition = (parseInt(this.getAttribute("step-transition") || "300") / 1000) +  "s";

        const stepsContainer = shadowRootDom.querySelector(".steps-container");
        stepsContainer.style.setProperty('--step-color-inactive', this.stepColorInactive);
        stepsContainer.style.setProperty('--step-color-active', this.stepColorActive);
        stepsContainer.style.setProperty('--step-width', this.stepWidth);
        stepsContainer.style.setProperty('--step-height', this.stepHeight);
        stepsContainer.style.setProperty('--step-gap', this.stepGap);
        stepsContainer.style.setProperty('--step-transition', this.stepTransition);

        shadowRootDom.querySelector(".prev").addEventListener("click", this.prev.bind(this));
        shadowRootDom.querySelector(".next").addEventListener("click", this.next.bind(this));
        this.shadowRoot.appendChild(shadowRootDom);
        this.updateStatus();
    }
}

customElements.define("progress-steps", ProgressSteps);