// Mock for react-toastify
module.exports = {
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn()
  },
  ToastContainer: () => <div data-testid="toast-container" />
};