import React from 'react';
import { screen } from '@testing-library/react';
import { OtpVerfication } from '../OtpVerfication';
import { renderWithProviders } from '../../../../utils/test-utils';

// Mock the navigate function
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useLocation: () => ({ 
    state: { 
      userId: 'test-user-id',
      email: 'test@example.com'
    } 
  })
}));

// Mock the useDispatch hook
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => jest.fn(),
  useSelector: jest.fn().mockImplementation(selector => {
    // Mock the state for the selector
    const state = {
      AuthSlice: {
        otpVerificationStatus: 'idle',
        otpVerificationError: null,
        resendOtpStatus: 'idle',
        resendOtpError: null
      }
    };
    return selector(state);
  })
}));

describe('OtpVerfication Component', () => {
  it('renders the OTP verification form correctly', () => {
    renderWithProviders(<OtpVerfication />);
    
    // Check for form elements
    expect(screen.getByText(/otp verification/i)).toBeInTheDocument();
    expect(screen.getByText(/resend otp/i)).toBeInTheDocument();
  });
});