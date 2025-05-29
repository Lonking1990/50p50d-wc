import './index.js'; // Import for side effects (registers the custom element)

// Mock ResizeObserver (good practice)
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Store the original document.querySelector to potentially mock it for the global interval
const originalDocumentQuerySelector = document.querySelector;

describe('BlurryLoading Component', () => {
  let blurryLoadingElement;
  let percentageElement;
  let numberElement;
  let contentElement;

  beforeEach(() => {
    jest.useFakeTimers();

    // Mock customElements.define and get for test isolation
    global.customElements = {
      define: jest.fn(),
      get: jest.fn((name) => {
        if (name === 'blurry-loading') {
          return function BlurryLoadingMock() {};
        }
        return undefined;
      }),
    };

    // Mock document.querySelector to control what the global interval in index.js sees.
    // This is a bit of a hack to prevent interference from the global interval.
    // For most tests, we'll make it return null so the global interval doesn't find our test element.
    document.querySelector = jest.fn((selector) => {
      if (selector === 'blurry-loading') {
        return null; // Prevent global interval from affecting this instance by default
      }
      return originalDocumentQuerySelector.call(document, selector);
    });
    
    blurryLoadingElement = document.createElement('blurry-loading');
    blurryLoadingElement.innerHTML = `<img src="bg.jpg" alt="background" />`;
    // Appending to body triggers connectedCallback, which calls updatePorcentage with initial/default values
    document.body.appendChild(blurryLoadingElement); 
    
    // Query elements after connectedCallback has run and initial updatePorcentage call
    percentageElement = blurryLoadingElement.shadowRoot.querySelector('.percentage');
    numberElement = blurryLoadingElement.shadowRoot.querySelector('.number');
    contentElement = blurryLoadingElement.shadowRoot.querySelector('.content');
  });

  afterEach(() => {
    if (blurryLoadingElement && blurryLoadingElement.parentNode) {
      blurryLoadingElement.parentNode.removeChild(blurryLoadingElement);
    }
    blurryLoadingElement = null;
    percentageElement = null;
    numberElement = null;
    contentElement = null;
    document.querySelector = originalDocumentQuerySelector; // Restore original
    jest.clearAllTimers();
    jest.clearAllMocks(); // Clear customElements mocks too
  });

  test('should be registered with customElements API', () => {
    const ActualBlurryLoadingClass = window.customElements.get('blurry-loading');
    expect(ActualBlurryLoadingClass).toBeDefined();
    expect(typeof ActualBlurryLoadingClass).toBe('function');
    expect(ActualBlurryLoadingClass.prototype).toBeInstanceOf(HTMLElement);
  });

  test('should create an instance of HTMLElement', () => {
    expect(blurryLoadingElement).toBeInstanceOf(HTMLElement);
  });

  test('initial rendering with defaults (0% loaded)', async () => {
    // Defaults: current-value=0, total-value=100, max-blur=10
    await Promise.resolve(); // Wait for microtasks
    expect(numberElement.textContent).toBe('0');
    expect(percentageElement.style.opacity).toBe('100%');
    expect(contentElement.style.filter).toBe('blur(10px)');
    expect(contentElement.innerHTML).toBe('<img src="bg.jpg" alt="background">');
  });

  test('renders correctly with custom initial attributes', async () => {
    // Remove the element created in beforeEach to start fresh
    if (blurryLoadingElement && blurryLoadingElement.parentNode) {
      blurryLoadingElement.parentNode.removeChild(blurryLoadingElement);
    }

    blurryLoadingElement = document.createElement('blurry-loading');
    blurryLoadingElement.innerHTML = `<img src="bg.jpg" alt="background" />`;
    // Set non-observed attributes for connectedCallback BEFORE appendChild
    blurryLoadingElement.setAttribute('total-value', '200'); 
    blurryLoadingElement.setAttribute('max-blur', '5');
    // Note: current-value is NOT set here, so connectedCallback uses default 0.
    
    document.body.appendChild(blurryLoadingElement); 
    
    // Now, set the observed attribute 'current-value'. This triggers attributeChangedCallback.
    blurryLoadingElement.setAttribute('current-value', '20');
    await Promise.resolve(); // Wait for microtasks

    // Query elements after all setup.
    percentageElement = blurryLoadingElement.shadowRoot.querySelector('.percentage');
    numberElement = blurryLoadingElement.shadowRoot.querySelector('.number');
    contentElement = blurryLoadingElement.shadowRoot.querySelector('.content');

    // percentage = floor(20*100/200) = floor(10) = 10
    expect(numberElement.textContent).toBe('10');
    // opacity = (100 - 10)% = 90%
    expect(percentageElement.style.opacity).toBe('90%');
    // blur = floor(5 * (100-10)/100) = floor(5 * 0.9) = floor(4.5) = 4
    expect(contentElement.style.filter).toBe('blur(4px)');
  });

  test('updates percentage and blur when "current-value" attribute changes', async () => {
    // Using the blurryLoadingElement from beforeEach:
    // Initial state from connectedCallback: current-value=0, total-value=100, max-blur=10
    await Promise.resolve(); // Ensure beforeEach updates are flushed

    blurryLoadingElement.setAttribute('current-value', '50'); 
    await Promise.resolve(); // Wait for attributeChangedCallback and updatePorcentage
    
    expect(numberElement.textContent).toBe('50');
    expect(percentageElement.style.opacity).toBe('50%');
    expect(contentElement.style.filter).toBe('blur(5px)');

    blurryLoadingElement.setAttribute('current-value', '100'); 
    await Promise.resolve();
    expect(numberElement.textContent).toBe('100');
    expect(percentageElement.style.opacity).toBe('0%');
    expect(contentElement.style.filter).toBe('blur(0px)');
  });

  test('loading text becomes hidden and background clear at 100%', async () => {
    // Uses the element from beforeEach
    blurryLoadingElement.setAttribute('current-value', '100');
    await Promise.resolve();
    expect(numberElement.textContent).toBe('100');
    expect(percentageElement.style.opacity).toBe('0%');
    expect(contentElement.style.filter).toBe('blur(0px)');
  });

  test('applies custom CSS font/color properties from attributes', async () => {
    // Remove the element from beforeEach
    if (blurryLoadingElement && blurryLoadingElement.parentNode) {
      blurryLoadingElement.parentNode.removeChild(blurryLoadingElement);
    }
    blurryLoadingElement = document.createElement('blurry-loading');
    blurryLoadingElement.innerHTML = `<img src="bg.jpg" alt="background" />`; // Added innerHTML for consistency
    // Set non-observed attributes for connectedCallback BEFORE appendChild
    blurryLoadingElement.setAttribute('font-family', 'Arial');
    blurryLoadingElement.setAttribute('font-size', '5rem');
    blurryLoadingElement.setAttribute('color', 'red');
    
    document.body.appendChild(blurryLoadingElement); // connectedCallback uses these font/color attributes
    await Promise.resolve(); // Wait for connectedCallback visual updates

    const container = blurryLoadingElement.shadowRoot.querySelector('.container');
    expect(container.style.getPropertyValue('--font-family')).toBe('Arial');
    expect(container.style.getPropertyValue('--font-size')).toBe('5rem');
    expect(container.style.getPropertyValue('--color')).toBe('red');

    // Also check that the default percentage text (0%) is rendered correctly with new color
    numberElement = blurryLoadingElement.shadowRoot.querySelector('.number'); // Query fresh
    percentageElement = blurryLoadingElement.shadowRoot.querySelector('.percentage'); // Query fresh
    expect(numberElement.textContent).toBe('0'); // Default current-value is 0
    expect(percentageElement.style.opacity).toBe('100%'); // Default opacity
  });

  // The duplicate tests were here and have been removed by this diff.

  describe('Global Interval Interaction Test', () => {
    beforeEach(() => {
      // For this specific test, allow the global interval to find the component
      document.querySelector = jest.fn((selector) => {
        if (selector === 'blurry-loading') {
          return blurryLoadingElement; // Let the global interval find this instance
        }
        return originalDocumentQuerySelector.call(document, selector);
      });
    });
    
    test('updates loading percentage over time due to global interval', async () => {
      // This test relies on the global interval defined in index.js
      // Initial state (current-value=0 from connectedCallback, total-value=100, max-blur=10)
      await Promise.resolve(); // Ensure initial render is flushed
      expect(numberElement.textContent).toBe('0');
      expect(percentageElement.style.opacity).toBe('100%');
      expect(contentElement.style.filter).toBe('blur(10px)');

      // Advance by 25ms * 1 step for the global interval
      jest.advanceTimersByTime(25); 
      await Promise.resolve(); // Wait for attribute change and subsequent updatePorcentage
      expect(numberElement.textContent).toBe('1');
      expect(percentageElement.style.opacity).toBe('99%');
      expect(contentElement.style.filter).toBe('blur(9px)');

      // Advance by another 25ms * 1 step
      jest.advanceTimersByTime(25);
      await Promise.resolve();
      expect(numberElement.textContent).toBe('2');
      expect(percentageElement.style.opacity).toBe('98%');
      expect(contentElement.style.filter).toBe('blur(9px)');

      // Advance timers to reach 100%
      jest.advanceTimersByTime(2450); // 98 more steps * 25ms
      await Promise.resolve();
      expect(numberElement.textContent).toBe('100');
      expect(percentageElement.style.opacity).toBe('0%');
      expect(contentElement.style.filter).toBe('blur(0px)');

      // Check if interval stops
      const currentValueBeforeStop = blurryLoadingElement.getAttribute('current-value');
      jest.advanceTimersByTime(100); 
      await Promise.resolve();
      expect(blurryLoadingElement.getAttribute('current-value')).toBe(currentValueBeforeStop); 
      expect(numberElement.textContent).toBe('100'); // Should still be 100
    });
  });
});
