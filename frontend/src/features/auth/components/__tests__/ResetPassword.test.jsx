import React from 'react';
import { screen } from '@testing-library/react';
import { ResetPassword } from '../ResetPassword';
import { renderWithProviders } from '../../../../utils/test-utils';

// Mock the navigate function
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useParams: () => ({ userId: 'test-user-id', token: 'test-token' })
}));

// Mock the useDispatch hook
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => jest.fn(),
  useSelector: jest.fn().mockImplementation(selector => {
    // Mock the state for the selector
    const state = {
      AuthSlice: {
        resetPasswordStatus: 'idle',
        resetPasswordError: null
      }
    };
    return selector(state);
  })
}));

describe('ResetPassword Component', () => {
  it('renders the reset password form correctly', () => {
    renderWithProviders(<ResetPassword />);
    
    // Check for form elements
    expect(screen.getByText(/reset password/i)).toBeInTheDocument();
  });
});