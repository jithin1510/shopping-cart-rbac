// Mock for axios
module.exports = {
  create: jest.fn(() => ({
    defaults: {
      baseURL: 'http://localhost:8000',
      withCredentials: true
    },
    interceptors: {
      request: {
        use: jest.fn(),
        eject: jest.fn(),
        handlers: []
      },
      response: {
        use: jest.fn(),
        eject: jest.fn(),
        handlers: []
      }
    },
    get: jest.fn(() => Promise.resolve({ data: {} })),
    post: jest.fn(() => Promise.resolve({ data: {} })),
    put: jest.fn(() => Promise.resolve({ data: {} })),
    patch: jest.fn(() => Promise.resolve({ data: {} })),
    delete: jest.fn(() => Promise.resolve({ data: {} }))
  }))
};