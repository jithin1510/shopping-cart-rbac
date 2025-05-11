import React from 'react';
import { screen } from '@testing-library/react';
import { ForgotPassword } from '../ForgotPassword';
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
        forgotPasswordStatus: 'idle',
        forgotPasswordError: null
      }
    };
    return selector(state);
  })
}));

describe('ForgotPassword Component', () => {
  it('renders the forgot password form correctly', () => {
    renderWithProviders(<ForgotPassword />);
    
    // Check for form elements
    expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
    expect(screen.getByText(/back to login/i)).toBeInTheDocument();
  });
});