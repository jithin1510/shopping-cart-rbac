import React from 'react';
import { screen } from '@testing-library/react';
import { RoleBasedRoute } from '../RoleBasedRoute';
import { renderWithProviders } from '../../utils/test-utils';

// Mock the Outlet and Navigate components
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Outlet: () => <div data-testid="outlet">Protected Content</div>,
  Navigate: ({ to }) => <div data-testid="navigate">Redirecting to {to}</div>
}));

describe('RoleBasedRoute Component', () => {
  it('renders loading state when auth check is not complete', () => {
    renderWithProviders(
      <RoleBasedRoute allowedRoles={['admin']} />,
      {
        preloadedState: {
          AuthSlice: {
            loggedInUser: null,
            isAuthChecked: false
          }
        }
      }
    );
    
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.queryByTestId('outlet')).not.toBeInTheDocument();
    expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
  });

  it('redirects to login when user is not logged in', () => {
    renderWithProviders(
      <RoleBasedRoute allowedRoles={['admin']} />,
      {
        preloadedState: {
          AuthSlice: {
            loggedInUser: null,
            isAuthChecked: true
          }
        }
      }
    );
    
    expect(screen.queryByTestId('outlet')).not.toBeInTheDocument();
    expect(screen.getByTestId('navigate')).toBeInTheDocument();
    expect(screen.getByText('Redirecting to /login')).toBeInTheDocument();
  });
});