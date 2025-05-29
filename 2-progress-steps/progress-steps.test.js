import './index.js'; // Import for side effects (registers the custom element)

// Mock ResizeObserver (good practice, though not explicitly used by this component)
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

describe('ProgressSteps Component', () => {
  let progressSteps;
  let prevButton;
  let nextButton;
  let stepsContainer;

  beforeEach(() => {
    // Use fake timers for the button lock timeout
    jest.useFakeTimers();

    // Mock customElements.define and get for test isolation, though initial registration is done by top-level import
    global.customElements = {
      define: jest.fn(),
      get: jest.fn((name) => {
        if (name === 'progress-steps') {
          // This is a placeholder; the actual class is registered by the import './index.js'
          // For instanceof checks, we rely on HTMLElement or direct checks of properties/behavior
          return function ProgressStepsMock() {};
        }
        return undefined;
      }),
    };

    progressSteps = document.createElement('progress-steps');
    document.body.appendChild(progressSteps);

    // Get common elements after component is appended and connectedCallback has run
    stepsContainer = progressSteps.shadowRoot.querySelector('.steps-container');
    prevButton = progressSteps.shadowRoot.querySelector('.prev');
    nextButton = progressSteps.shadowRoot.querySelector('.next');
  });

  afterEach(() => {
    if (progressSteps && progressSteps.parentNode) {
      progressSteps.parentNode.removeChild(progressSteps);
    }
    progressSteps = null;
    prevButton = null;
    nextButton = null;
    stepsContainer = null;
    jest.clearAllMocks();
    jest.clearAllTimers(); // Clear all fake timers
  });

  test('should be registered with customElements API', () => {
    const ActualProgressStepsClass = window.customElements.get('progress-steps');
    expect(ActualProgressStepsClass).toBeDefined();
    expect(typeof ActualProgressStepsClass).toBe('function');
    expect(ActualProgressStepsClass.prototype).toBeInstanceOf(HTMLElement);
  });

  test('should create an instance of HTMLElement', () => {
    expect(progressSteps).toBeInstanceOf(HTMLElement);
  });

  test('renders with default number of steps (4) and default initial step (1)', () => {
    const stepElements = progressSteps.shadowRoot.querySelectorAll('.step');
    expect(stepElements.length).toBe(4);
    expect(stepElements[0].classList.contains('active')).toBe(true);
    for (let i = 1; i < stepElements.length; i++) {
      expect(stepElements[i].classList.contains('active')).toBe(false);
    }
    expect(prevButton.disabled).toBe(true);
    expect(nextButton.disabled).toBe(false);
  });

  test('renders with specified num-steps and init-step', () => {
    document.body.removeChild(progressSteps);
    progressSteps = document.createElement('progress-steps');
    progressSteps.setAttribute('num-steps', '5');
    progressSteps.setAttribute('init-step', '2');
    document.body.appendChild(progressSteps);
    
    // Re-query elements
    prevButton = progressSteps.shadowRoot.querySelector('.prev');
    nextButton = progressSteps.shadowRoot.querySelector('.next');

    const stepElements = progressSteps.shadowRoot.querySelectorAll('.step');
    expect(stepElements.length).toBe(5);
    expect(stepElements[0].classList.contains('active')).toBe(true);
    expect(stepElements[1].classList.contains('active')).toBe(true);
    for (let i = 2; i < stepElements.length; i++) {
      expect(stepElements[i].classList.contains('active')).toBe(false);
    }
    expect(prevButton.disabled).toBe(false);
    expect(nextButton.disabled).toBe(false);
  });

  test('updates active step and button states on "next" button click', () => {
    const stepElements = progressSteps.shadowRoot.querySelectorAll('.step');
    
    // Initial state: step 1 active, prev disabled
    expect(stepElements[0].classList.contains('active')).toBe(true);
    expect(prevButton.disabled).toBe(true);

    nextButton.click();
    jest.runAllTimers(); // Advance timers for button lock

    // State after one "next" click: step 1 & 2 active, prev enabled
    expect(stepElements[0].classList.contains('active')).toBe(true);
    expect(stepElements[1].classList.contains('active')).toBe(true);
    expect(prevButton.disabled).toBe(false);

    // Go to the last step
    nextButton.click(); // to step 3
    jest.runAllTimers();
    nextButton.click(); // to step 4 (last step for default 4 steps)
    jest.runAllTimers();

    expect(stepElements[3].classList.contains('active')).toBe(true);
    expect(nextButton.disabled).toBe(true); // Next button should be disabled at the last step
  });

  test('updates active step and button states on "prev" button click', () => {
    // Set initial step to 3 of 4 total steps
    document.body.removeChild(progressSteps);
    progressSteps = document.createElement('progress-steps');
    progressSteps.setAttribute('num-steps', '4');
    progressSteps.setAttribute('init-step', '3');
    document.body.appendChild(progressSteps);
    prevButton = progressSteps.shadowRoot.querySelector('.prev');
    nextButton = progressSteps.shadowRoot.querySelector('.next');
    const stepElements = progressSteps.shadowRoot.querySelectorAll('.step');

    // Initial state: step 1, 2, 3 active, next enabled, prev enabled
    expect(stepElements[0].classList.contains('active')).toBe(true);
    expect(stepElements[1].classList.contains('active')).toBe(true);
    expect(stepElements[2].classList.contains('active')).toBe(true);
    expect(nextButton.disabled).toBe(false);
    expect(prevButton.disabled).toBe(false);
    
    prevButton.click();
    jest.runAllTimers();

    // State after one "prev" click: step 1 & 2 active
    expect(stepElements[0].classList.contains('active')).toBe(true);
    expect(stepElements[1].classList.contains('active')).toBe(true);
    expect(stepElements[2].classList.contains('active')).toBe(false); // Step 3 should no longer be active
    expect(nextButton.disabled).toBe(false);
    expect(prevButton.disabled).toBe(false); // Still on step 2

    prevButton.click();
    jest.runAllTimers();
    
    // State after another "prev" click: step 1 active, prev disabled
    expect(stepElements[0].classList.contains('active')).toBe(true);
    expect(stepElements[1].classList.contains('active')).toBe(false);
    expect(prevButton.disabled).toBe(true); // Prev button should be disabled at the first step
  });

  test('buttons are locked during transition and unlock after timeout', () => {
    const initialStep = progressSteps.currentStep;
    
    nextButton.click(); // First click, currentStep should change
    expect(progressSteps.currentStep).toBe(initialStep + 1);
    
    // Try clicking again immediately (while buttons should be locked)
    nextButton.click(); 
    // currentStep should not change because buttons are locked
    expect(progressSteps.currentStep).toBe(initialStep + 1); 

    jest.runAllTimers(); // Advance timers to unlock buttons

    nextButton.click(); // Click after timeout
    // currentStep should change now
    expect(progressSteps.currentStep).toBe(initialStep + 2);
  });

  test('applies custom CSS properties from attributes', () => {
    document.body.removeChild(progressSteps);
    progressSteps = document.createElement('progress-steps');
    progressSteps.setAttribute('step-color-inactive', 'red');
    progressSteps.setAttribute('step-color-active', 'blue');
    progressSteps.setAttribute('step-width', '2rem');
    progressSteps.setAttribute('step-height', '2rem');
    progressSteps.setAttribute('step-gap', '5rem');
    progressSteps.setAttribute('step-transition', '500'); // 500ms
    document.body.appendChild(progressSteps);

    stepsContainer = progressSteps.shadowRoot.querySelector('.steps-container');

    expect(stepsContainer.style.getPropertyValue('--step-color-inactive')).toBe('red');
    expect(stepsContainer.style.getPropertyValue('--step-color-active')).toBe('blue');
    expect(stepsContainer.style.getPropertyValue('--step-width')).toBe('2rem');
    expect(stepsContainer.style.getPropertyValue('--step-height')).toBe('2rem');
    expect(stepsContainer.style.getPropertyValue('--step-gap')).toBe('5rem');
    expect(stepsContainer.style.getPropertyValue('--step-transition')).toBe('0.5s');
  });
});
