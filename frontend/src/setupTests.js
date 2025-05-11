// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock server might not be available in all tests, so we need to handle that
let server;
try {
  const serverModule = require('./mocks/server');
  server = serverModule.server;
} catch (error) {
  console.warn('MSW server module not found or could not be loaded');
  server = {
    listen: jest.fn(),
    resetHandlers: jest.fn(),
    close: jest.fn()
  };
}

// Suppress React 18 console errors
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = (...args) => {
    if (
      /Warning: ReactDOM.render is no longer supported in React 18/.test(args[0]) ||
      /Warning: An update to .* inside a test was not wrapped in act/.test(args[0]) ||
      /Warning: findDOMNode is deprecated in StrictMode/.test(args[0]) ||
      /Warning: React.createFactory/.test(args[0]) ||
      /Warning: Using UNSAFE_componentWillMount/.test(args[0]) ||
      /Warning: Using UNSAFE_componentWillReceiveProps/.test(args[0]) ||
      /Warning: Can't perform a React state update on an unmounted component/.test(args[0])
    ) {
      return;
    }
    originalError.call(console, ...args);
  };

  console.warn = (...args) => {
    if (
      /Warning: React does not recognize the.*prop on a DOM element/.test(args[0]) ||
      /Warning: The tag <.*> is unrecognized in this browser/.test(args[0])
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };

  // Establish API mocking before all tests
  if (server && server.listen) {
    server.listen({ onUnhandledRequest: 'bypass' });
  }
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
  
  // Clean up after the tests are finished
  if (server && server.close) {
    server.close();
  }
});

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests
afterEach(() => {
  if (server && server.resetHandlers) {
    server.resetHandlers();
  }
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
class MockIntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() { return null; }
  unobserve() { return null; }
  disconnect() { return null; }
}

window.IntersectionObserver = MockIntersectionObserver;

// Mock ResizeObserver
class MockResizeObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() { return null; }
  unobserve() { return null; }
  disconnect() { return null; }
}

window.ResizeObserver = MockResizeObserver;

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    blob: () => Promise.resolve(new Blob()),
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    formData: () => Promise.resolve(new FormData()),
    ok: true,
    status: 200,
    headers: new Headers()
  })
);

// Mock localStorage
const localStorageMock = (function() {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    key: jest.fn(index => {
      return Object.keys(store)[index] || null;
    }),
    get length() {
      return Object.keys(store).length;
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  value: localStorageMock
});