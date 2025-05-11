import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { configureStore } from '@reduxjs/toolkit';
import { ToastContainer } from 'react-toastify';

// Create a theme for testing
const theme = createTheme();

// Create a mock reducer that just returns the state
const mockReducer = (state = {}, action) => state;

/**
 * Custom render function that includes providers
 * @param {React.ReactElement} ui - Component to render
 * @param {Object} options - Render options
 * @param {Object} initialState - Initial Redux state
 * @returns {Object} Rendered component with utilities
 */
export function renderWithProviders(
  ui,
  {
    preloadedState = {},
    // Automatically create a store with whatever reducers are needed
    store = configureStore({
      reducer: {
        AuthSlice: mockReducer,
        ProductSlice: mockReducer,
        CartSlice: mockReducer,
        WishlistSlice: mockReducer,
        OrderSlice: mockReducer,
        UserSlice: mockReducer,
        AddressSlice: mockReducer,
        ReviewSlice: mockReducer,
        BrandSlice: mockReducer,
        CategoriesSlice: mockReducer
      },
      preloadedState
    }),
    ...renderOptions
  } = {}
) {
  function Wrapper({ children }) {
    return (
      <Provider store={store}>
        <BrowserRouter>
          <ThemeProvider theme={theme}>
            {children}
            <ToastContainer />
          </ThemeProvider>
        </BrowserRouter>
      </Provider>
    );
  }
  
  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}

/**
 * Create a mock user for testing
 * @param {Object} overrides - User property overrides
 * @returns {Object} Mock user object
 */
export function createMockUser(overrides = {}) {
  return {
    _id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
    role: 'customer',
    isVerified: true,
    isApproved: true,
    ...overrides
  };
}

/**
 * Create a mock product for testing
 * @param {Object} overrides - Product property overrides
 * @returns {Object} Mock product object
 */
export function createMockProduct(overrides = {}) {
  return {
    _id: 'test-product-id',
    title: 'Test Product',
    description: 'This is a test product',
    price: 99.99,
    discountPercentage: 10,
    category: { _id: 'category-id', name: 'Test Category' },
    brand: { _id: 'brand-id', name: 'Test Brand' },
    stockQuantity: 100,
    thumbnail: 'https://example.com/thumbnail.jpg',
    images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
    vendor: 'vendor-id',
    isDeleted: false,
    ...overrides
  };
}

/**
 * Create initial auth state for testing
 * @param {Object} overrides - State property overrides
 * @returns {Object} Initial auth state
 */
export function createMockAuthState(overrides = {}) {
  return {
    status: 'idle',
    errors: null,
    loggedInUser: null,
    signupStatus: 'idle',
    signupError: null,
    loginStatus: 'idle',
    loginError: null,
    otpVerificationStatus: 'idle',
    otpVerificationError: null,
    isAuthChecked: true,
    ...overrides
  };
}