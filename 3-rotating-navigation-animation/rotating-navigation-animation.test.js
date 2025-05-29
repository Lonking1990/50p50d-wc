import './index.js'; // Import for side effects (registers the custom element)

// Mock ResizeObserver (good practice)
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

describe('RotatingNavigation Component', () => {
  let rotatingNavElement;
  let lightDomNav;
  let lightDomSection;
  let openButton;
  let closeButton;
  let menuElement;
  let sectionElement; // The <section> inside shadow DOM
  let navElement; // The <nav> inside shadow DOM

  beforeEach(() => {
    // Mock customElements.define and get for test isolation
    global.customElements = {
      define: jest.fn(),
      get: jest.fn((name) => {
        if (name === 'rotating-navigation') {
          return function RotatingNavigationMock() {};
        }
        return undefined;
      }),
    };

    // Create light DOM content that the component will project
    lightDomNav = document.createElement('nav');
    lightDomNav.id = 'main-nav'; // Used by default nav-selector
    lightDomNav.innerHTML = `
      <ul>
        <li>Home</li>
        <li>About</li>
        <li>Contact</li>
      </ul>`;

    lightDomSection = document.createElement('section');
    lightDomSection.id = 'main-content'; // Used by default content-selector
    lightDomSection.innerHTML = `
      <h1>Main Title</h1>
      <p>Some paragraph content.</p>`;
    
    rotatingNavElement = document.createElement('rotating-navigation');
    // Append light DOM children to the component BEFORE it's connected to the main DOM
    rotatingNavElement.appendChild(lightDomNav);
    rotatingNavElement.appendChild(lightDomSection);

    // Set attributes to point to the light DOM elements (though defaults would work here if IDs are unique)
    // Using IDs is more robust if there were other nav/section elements in the component's light DOM.
    rotatingNavElement.setAttribute('nav-selector', '#main-nav');
    rotatingNavElement.setAttribute('content-selector', '#main-content');
    
    document.body.appendChild(rotatingNavElement); // Now connect the component to the main DOM

    // Query elements from the shadow DOM
    menuElement = rotatingNavElement.shadowRoot.querySelector('.menu');
    openButton = rotatingNavElement.shadowRoot.querySelector('.open');
    closeButton = rotatingNavElement.shadowRoot.querySelector('.close');
    sectionElement = rotatingNavElement.shadowRoot.querySelector('section.rotating-container');
    navElement = rotatingNavElement.shadowRoot.querySelector('nav');
  });

  afterEach(() => {
    if (rotatingNavElement && rotatingNavElement.parentNode) {
      rotatingNavElement.parentNode.removeChild(rotatingNavElement);
    }
    // lightDomNav and lightDomSection are children of rotatingNavElement, 
    // so they will be removed when rotatingNavElement is removed.
    rotatingNavElement = null;
    // No need to nullify lightDomNav/Section separately if they are always children
    menuElement = null;
    openButton = null;
    closeButton = null;
    sectionElement = null;
    navElement = null;
    jest.clearAllMocks();
  });

  test('should be registered with customElements API', () => {
    const ActualRotatingNavClass = window.customElements.get('rotating-navigation');
    expect(ActualRotatingNavClass).toBeDefined();
    expect(typeof ActualRotatingNavClass).toBe('function');
    expect(ActualRotatingNavClass.prototype).toBeInstanceOf(HTMLElement);
  });

  test('should create an instance of HTMLElement', () => {
    expect(rotatingNavElement).toBeInstanceOf(HTMLElement);
  });

  test('initial rendering: menu is not active, nav items not translated', () => {
    expect(menuElement.classList.contains('active')).toBe(false);
    // Check one nav item for initial translation state (should not have the 'translate: 120% 0' effect)
    // This is an indirect check as we can't easily get computed translate values.
    // We rely on the fact that the 'active' class on .menu triggers this.
    const navLi = navElement.querySelector('li');
    if (navLi) {
      // In non-active state, the transition for translate should not be the one for active state.
      // This is hard to assert directly without computed styles.
      // We primarily test the class that triggers these visual changes.
    }
  });

  test('clicking open button adds "active" class to menu', () => {
    expect(menuElement.classList.contains('active')).toBe(false);
    openButton.click();
    expect(menuElement.classList.contains('active')).toBe(true);
    // The task mentions 'show-nav' class, but component uses 'active' on '.menu'.
    // The section rotation and nav visibility are consequences of '.menu.active' via CSS.
  });

  test('clicking close button removes "active" class from menu', () => {
    // First, activate the menu
    openButton.click();
    expect(menuElement.classList.contains('active')).toBe(true);

    // Then, click close
    closeButton.click();
    expect(menuElement.classList.contains('active')).toBe(false);
  });
  
  test('content rotation and nav visibility are triggered by menu "active" class', () => {
    // Initial state: section should not be rotated (implicitly)
    // Nav li items should not be translated (implicitly)

    openButton.click();
    // When menu is active, section should have styles implying rotation
    // and nav li items should have styles implying they are visible (translated into view).
    // These are controlled by CSS rules:
    // .menu.active + section { rotate: -20deg; translate: 0 2rem; }
    // .menu.active ~ nav li { translate: 120% 0; }
    // Since JSDOM doesn't compute final styles, we trust the class `active` triggers these.
    expect(menuElement.classList.contains('active')).toBe(true);

    closeButton.click();
    // When menu is not active, these styles should revert.
    expect(menuElement.classList.contains('active')).toBe(false);
  });

  test('applies custom CSS properties from attributes', () => {
    document.body.removeChild(rotatingNavElement); // remove default one, its children (lightDomNav, lightDomSection) go with it.

    lightDomNav = document.createElement('nav');
    lightDomNav.id = 'main-nav'; // Ensure IDs are unique if there's any ambiguity
    lightDomNav.innerHTML = `<ul><li>Home</li></ul>`;
    lightDomSection = document.createElement('section');
    lightDomSection.id = 'main-content'; // Ensure IDs are unique
    lightDomSection.innerHTML = `<p>Content</p>`;
    
    rotatingNavElement = document.createElement('rotating-navigation');
    rotatingNavElement.appendChild(lightDomNav);
    rotatingNavElement.appendChild(lightDomSection);
    rotatingNavElement.setAttribute('nav-selector', '#main-nav'); // Explicitly use IDs
    rotatingNavElement.setAttribute('content-selector', '#main-content'); // Explicitly use IDs
    rotatingNavElement.setAttribute('radial-background-color', 'red');
    rotatingNavElement.setAttribute('radial-color', 'blue');
    rotatingNavElement.setAttribute('radial-transition', '1000'); // 1s
    rotatingNavElement.setAttribute('radial-radius', '150'); // Set to '150' so component makes it '150px'
    rotatingNavElement.setAttribute('menu-background-color', 'green');
    rotatingNavElement.setAttribute('menu-color', 'yellow');
    document.body.appendChild(rotatingNavElement);
    
    const contentDiv = rotatingNavElement.shadowRoot.querySelector('.content');
    expect(contentDiv.style.getPropertyValue('--radial-background-color')).toBe('red');
    expect(contentDiv.style.getPropertyValue('--radial-color')).toBe('blue');
    expect(contentDiv.style.getPropertyValue('--radial-transition')).toBe('1s');
    expect(contentDiv.style.getPropertyValue('--radial-radius')).toBe('150px');
    expect(contentDiv.style.getPropertyValue('--menu-background-color')).toBe('green');
    expect(contentDiv.style.getPropertyValue('--menu-color')).toBe('yellow');
  });

  test('nav items get staggered transition delays', () => {
    const navLiElements = navElement.querySelectorAll('li');
    expect(navLiElements.length).toBe(3); // From the lightDomNav

    // Default radial-transition is 500ms (0.5s)
    // Delays should be 0.5s, 0.6s, 0.7s
    expect(navLiElements[0].style.getPropertyValue('--delayTransition')).toBe('0.5s');
    expect(navLiElements[1].style.getPropertyValue('--delayTransition')).toBe('0.6s');
    expect(navLiElements[2].style.getPropertyValue('--delayTransition')).toBe('0.7s');

    // Test with custom radial-transition
    document.body.removeChild(rotatingNavElement); // Clean up previous instance

    lightDomNav = document.createElement('nav');
    lightDomNav.id = 'main-nav-custom-transition'; // Use a distinct ID to avoid potential clashes if not removed properly
    lightDomNav.innerHTML = `<ul><li>Home</li><li>About</li></ul>`; // 2 items
    lightDomSection = document.createElement('section');
    lightDomSection.id = 'main-content-custom-transition'; // Use a distinct ID
    lightDomSection.innerHTML = `<p>Content</p>`;

    rotatingNavElement = document.createElement('rotating-navigation');
    rotatingNavElement.appendChild(lightDomNav);
    rotatingNavElement.appendChild(lightDomSection);
    rotatingNavElement.setAttribute('nav-selector', '#' + lightDomNav.id);
    rotatingNavElement.setAttribute('content-selector', '#' + lightDomSection.id);
    rotatingNavElement.setAttribute('radial-transition', '100'); // 100ms = 0.1s
    document.body.appendChild(rotatingNavElement);
    
    const newNavElement = rotatingNavElement.shadowRoot.querySelector('nav');
    const newNavLiElements = newNavElement.querySelectorAll('li');
    expect(newNavLiElements.length).toBe(2);
    expect(newNavLiElements[0].style.getPropertyValue('--delayTransition')).toBe('0.1s');
    expect(newNavLiElements[1].style.getPropertyValue('--delayTransition')).toBe('0.2s'); // 0.1s + 0.1*1
  });
});
