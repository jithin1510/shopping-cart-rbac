import React from 'react';
import { screen } from '@testing-library/react';
import { RoleSelection } from '../RoleSelection';
import { renderWithProviders } from '../../../../utils/test-utils';

// Mock the navigate function
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn()
}));

describe('RoleSelection Component', () => {
  it('renders the role selection options correctly', () => {
    renderWithProviders(<RoleSelection />);
    
    // Check for role options
    expect(screen.getByText(/select your role/i)).toBeInTheDocument();
    expect(screen.getByText(/customer/i)).toBeInTheDocument();
    expect(screen.getByText(/vendor/i)).toBeInTheDocument();
  });
});