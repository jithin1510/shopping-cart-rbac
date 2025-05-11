import React from 'react';
import { Protected } from '../Protected';
import { renderWithProviders } from '../../../../utils/test-utils';

// Mock the navigate function
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

describe('Protected Component', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('redirects to login when user is not logged in', () => {
    renderWithProviders(
      <Protected>
        <div>Protected Content</div>
      </Protected>,
      {
        preloadedState: {
          AuthSlice: {
            loggedInUser: null
          }
        }
      }
    );
    
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});