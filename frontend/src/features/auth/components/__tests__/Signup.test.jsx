import React from 'react';
import { screen } from '@testing-library/react';
import { Signup } from '../Signup';
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
        signupStatus: 'idle',
        signupError: null
      }
    };
    return selector(state);
  })
}));

describe('Signup Component', () => {
  it('renders the signup form correctly', () => {
    renderWithProviders(<Signup />);
    
    // Check for form elements
    expect(screen.getByText(/signup/i)).toBeInTheDocument();
    expect(screen.getByText(/already have an account/i)).toBeInTheDocument();
  });
});