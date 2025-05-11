import React from 'react';
import AdminVendorApprovalPage from '../AdminVendorApprovalPage';
import { renderWithProviders } from '../../utils/test-utils';

// Mock the navigate function
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

describe('AdminVendorApprovalPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('redirects to login page when user is not logged in', () => {
    renderWithProviders(<AdminVendorApprovalPage />, {
      preloadedState: {
        AuthSlice: {
          loggedInUser: null
        }
      }
    });
    
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});