import React from 'react';
import { screen } from '@testing-library/react';
import { Login } from '../Login';
import { renderWithProviders } from '../../../../utils/test-utils';

// Mock the navigate function
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn()
}));

// Mock the useDispatch hook
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => jest.fn(),
  useSelector: jest.fn().mockImplementation(selector => {
    // Mock the state for the selector
    const state = {
      AuthSlice: {
        loginStatus: 'idle',
        loginError: null
      }
    };
    return selector(state);
  })
}));

describe('Login Component', () => {
  it('renders the login form correctly', () => {
    renderWithProviders(<Login />);
    
    // Check for form elements
    expect(screen.getByText(/login/i)).toBeInTheDocument();
    expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
  });
});