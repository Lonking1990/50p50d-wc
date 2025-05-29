import './index.js'; // Import for side effects (registers the custom element)

// Mock ResizeObserver (good practice)
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
let mockIntersectionObserverCallback;
const mockIntersectionObserverInstances = new Set();

global.IntersectionObserver = jest.fn((callback, options) => {
  mockIntersectionObserverCallback = callback;
  const instance = {
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
    takeRecords: jest.fn(() => []), // Add takeRecords
    root: options?.root || null,
    rootMargin: options?.rootMargin || '0px 0px 0px 0px',
    thresholds: Array.isArray(options?.threshold) ? options.threshold : [options?.threshold || 0],
  };
  mockIntersectionObserverInstances.add(instance);
  return instance;
});

function triggerIntersection(targetElement, isIntersecting) {
  if (mockIntersectionObserverCallback) {
    mockIntersectionObserverCallback([
      {
        target: targetElement,
        isIntersecting: isIntersecting,
        boundingClientRect: targetElement.getBoundingClientRect(), // Provide actual rect
        intersectionRatio: isIntersecting ? 1 : 0,
        intersectionRect: isIntersecting ? targetElement.getBoundingClientRect() : { top: 0, bottom: 0, left: 0, right: 0, width: 0, height: 0, x: 0, y: 0 },
        rootBounds: null, // Or mock if needed
        time: Date.now(),
      },
    ]);
  }
}

describe('ScrollAnimation Component', () => {
  let scrollAnimationElement;
  let child1, child2, child3;

  beforeEach(() => {
    // Clear previous instances and callback
    mockIntersectionObserverInstances.clear();
    mockIntersectionObserverCallback = null;

    // Mock customElements.define and get for test isolation
    global.customElements = {
      define: jest.fn(),
      get: jest.fn((name) => {
        if (name === 'scroll-animation') {
          return function ScrollAnimationMock() {};
        }
        return undefined;
      }),
    };

    scrollAnimationElement = document.createElement('scroll-animation');
    // Add light DOM children for the component to project and observe
    scrollAnimationElement.innerHTML = `
      <div class="box">Box 1</div>
      <div class="box">Box 2</div>
      <div class="box">Box 3</div>
    `;
    document.body.appendChild(scrollAnimationElement);

    // Get references to the projected children (which are now in light DOM of scroll-animation)
    // The component moves this.innerHTML into its shadow DOM's #animatedContent.
    // So, we query the children from where they end up in the shadow DOM.
    const animatedContent = scrollAnimationElement.shadowRoot.getElementById('animatedContent');
    child1 = animatedContent.children[0];
    child2 = animatedContent.children[1];
    child3 = animatedContent.children[2];
  });

  afterEach(() => {
    if (scrollAnimationElement && scrollAnimationElement.parentNode) {
      scrollAnimationElement.parentNode.removeChild(scrollAnimationElement);
    }
    scrollAnimationElement = null;
    child1 = null;
    child2 = null;
    child3 = null;
    jest.clearAllMocks(); // Clear customElements mocks
    // Restore IntersectionObserver if it was changed beyond the mock function itself
    // For this setup, jest.fn() handles reset well.
  });

  test('should be registered with customElements API', () => {
    const ActualScrollAnimationClass = window.customElements.get('scroll-animation');
    expect(ActualScrollAnimationClass).toBeDefined();
    expect(typeof ActualScrollAnimationClass).toBe('function');
    expect(ActualScrollAnimationClass.prototype).toBeInstanceOf(HTMLElement);
  });

  test('should create an instance of HTMLElement', () => {
    expect(scrollAnimationElement).toBeInstanceOf(HTMLElement);
  });

  test('initial state: children are observed but not visible', () => {
    expect(child1.classList.contains('visible')).toBe(false);
    expect(child2.classList.contains('visible')).toBe(false);
    expect(child3.classList.contains('visible')).toBe(false);

    // Verify that IntersectionObserver was created and observe was called for each child
    expect(IntersectionObserver).toHaveBeenCalledTimes(1);
    const observerInstance = [...mockIntersectionObserverInstances][0];
    expect(observerInstance.observe).toHaveBeenCalledWith(child1);
    expect(observerInstance.observe).toHaveBeenCalledWith(child2);
    expect(observerInstance.observe).toHaveBeenCalledWith(child3);
  });

  test('child becomes visible when IntersectionObserver signals intersection', () => {
    expect(child1.classList.contains('visible')).toBe(false);
    triggerIntersection(child1, true); // Simulate child1 intersecting
    expect(child1.classList.contains('visible')).toBe(true);
  });

  test('child loses "visible" class when IntersectionObserver signals it is no longer intersecting', () => {
    // First, make it visible
    triggerIntersection(child1, true);
    expect(child1.classList.contains('visible')).toBe(true);

    // Then, simulate it leaving the viewport
    triggerIntersection(child1, false);
    expect(child1.classList.contains('visible')).toBe(false);
  });

  test('multiple children visibility updates correctly', () => {
    expect(child1.classList.contains('visible')).toBe(false);
    expect(child2.classList.contains('visible')).toBe(false);
    expect(child3.classList.contains('visible')).toBe(false);

    triggerIntersection(child1, true);
    expect(child1.classList.contains('visible')).toBe(true);
    expect(child2.classList.contains('visible')).toBe(false);
    expect(child3.classList.contains('visible')).toBe(false);

    triggerIntersection(child2, true);
    expect(child1.classList.contains('visible')).toBe(true); // Should remain visible
    expect(child2.classList.contains('visible')).toBe(true);
    expect(child3.classList.contains('visible')).toBe(false);
    
    triggerIntersection(child1, false); // Child 1 leaves view
    expect(child1.classList.contains('visible')).toBe(false);
    expect(child2.classList.contains('visible')).toBe(true); // Child 2 remains visible
    expect(child3.classList.contains('visible')).toBe(false);

    triggerIntersection(child3, true); // Child 3 enters view
    expect(child1.classList.contains('visible')).toBe(false);
    expect(child2.classList.contains('visible')).toBe(true);
    expect(child3.classList.contains('visible')).toBe(true);
  });
});
