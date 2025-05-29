import './index.js'; // Import for side effects (registers the custom element)

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));


describe('ExpandingCards Component', () => {
  let expandingCards;

  beforeEach(() => {
    // While the component is registered by the top-level import,
    // individual tests might still want to spy on or mock define/get calls
    // for specific scenarios, though it won't affect the initial registration.
    global.customElements = {
      define: jest.fn(), // This mock will likely not capture the initial define
      get: jest.fn((name) => {
        // Simulate a basic get that might return the actual class if defined
        // This is tricky because the real `customElements.get` is not easily accessible here to call
        // For now, this mock `get` won't be very useful for retrieving the actual class.
        if (name === 'expanding-cards') {
          // We can't return the actual ExpandingCards class easily here as it's not exported.
          return function ExpandingCardsMock() {}; // Return a dummy constructor
        }
        return undefined;
      }),
    };

    expandingCards = document.createElement('expanding-cards');
    document.body.appendChild(expandingCards);
  });

  afterEach(() => {
    if (expandingCards && expandingCards.parentNode) {
      expandingCards.parentNode.removeChild(expandingCards);
    }
    expandingCards = null;
    jest.clearAllMocks();
    // No need to jest.resetModules() if we rely on the single top-level import for registration.
  });

  test('should be registered with customElements API', () => {
    // The import './index.js' at the top should have registered the component.
    // We access the browser's `customElements.get` directly, not the mock.
    const ActualExpandingCardsClass = window.customElements.get('expanding-cards');
    expect(ActualExpandingCardsClass).toBeDefined();
    expect(typeof ActualExpandingCardsClass).toBe('function');
    // Check if it looks like a constructor (custom element classes are functions)
    expect(ActualExpandingCardsClass.prototype).toBeInstanceOf(HTMLElement);
  });

  test('should create an instance of HTMLElement', () => {
    expect(expandingCards).toBeInstanceOf(HTMLElement);
  });
  
  test('renders with default number of panels (5) if num-elements is not provided', () => {
    // connectedCallback should run when appended to body
    const panels = expandingCards.shadowRoot.querySelectorAll('.list-entry');
    expect(panels.length).toBe(5);
  });

  test('renders with the specified number of panels via num-elements attribute', () => {
    document.body.removeChild(expandingCards); // remove default one
    expandingCards = document.createElement('expanding-cards');
    expandingCards.setAttribute('num-elements', '3');
    document.body.appendChild(expandingCards); // Re-append to trigger attributeChangedCallback if any, and connectedCallback logic

    const panels = expandingCards.shadowRoot.querySelectorAll('.list-entry');
    expect(panels.length).toBe(3);
  });

  test('expands a panel on click and collapses others', async () => {
    // Ensure component is fully initialized
    await Promise.resolve(); // Wait for microtasks like connectedCallback internals

    const panels = expandingCards.shadowRoot.querySelectorAll('.list-entry');
    expect(panels.length).toBeGreaterThan(1);

    // Default expansion
    expect(panels[0].classList.contains('expand')).toBe(true);
    for (let i = 1; i < panels.length; i++) {
      expect(panels[i].classList.contains('expand')).toBe(false);
    }

    panels[1].click();
    await Promise.resolve(); // allow event handlers and subsequent updates

    expect(panels[1].classList.contains('expand')).toBe(true);
    expect(panels[0].classList.contains('expand')).toBe(false);
    for (let i = 2; i < panels.length; i++) {
      expect(panels[i].classList.contains('expand')).toBe(false);
    }

    panels[0].click();
    await Promise.resolve(); 

    expect(panels[0].classList.contains('expand')).toBe(true);
    expect(panels[1].classList.contains('expand')).toBe(false);
  });

  test('applies default expanded-width (80%) and calculates collapsed width correctly', async () => {
    await Promise.resolve(); // Ensure connectedCallback has run
    // Default num-elements is 5, default expanded-width is 80%
    // Collapsed width should be (100 - 80) / (5 - 1) = 20 / 4 = 5%
    const list = expandingCards.shadowRoot.querySelector('.list');
    expect(list.style.getPropertyValue('--expandedWidth')).toBe('80%');
    expect(list.style.getPropertyValue('--collapseWidth')).toBe('5%');
  });

  test('applies custom expanded-width and calculates collapsed width correctly', () => {
    document.body.removeChild(expandingCards); // remove default one
    expandingCards = document.createElement('expanding-cards');
    expandingCards.setAttribute('num-elements', '4');
    expandingCards.setAttribute('expanded-width', '70'); // 70%
    document.body.appendChild(expandingCards);
    
    // num-elements is 4, expanded-width is 70%
    // Collapsed width should be (100 - 70) / (4 - 1) = 30 / 3 = 10%
    const list = expandingCards.shadowRoot.querySelector('.list');
    expect(list.style.getPropertyValue('--expandedWidth')).toBe('70%');
    expect(list.style.getPropertyValue('--collapseWidth')).toBe('10%');
  });

  test('applies custom height and item-margin', () => {
    document.body.removeChild(expandingCards); // remove default one
    expandingCards = document.createElement('expanding-cards');
    expandingCards.setAttribute('height', '300px');
    expandingCards.setAttribute('item-margin', '5px');
    document.body.appendChild(expandingCards);

    const list = expandingCards.shadowRoot.querySelector('.list');
    expect(list.style.getPropertyValue('--height')).toBe('300px');
    expect(list.style.getPropertyValue('--itemMargin')).toBe('5px');
  });

});
