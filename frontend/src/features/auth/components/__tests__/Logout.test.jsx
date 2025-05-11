import React from 'react';
import { Logout } from '../Logout';
import { render } from '@testing-library/react';

// Mock the navigate function
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

// Mock the useDispatch hook
const mockDispatch = jest.fn();
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch
}));

// Mock the useEffect hook
jest.spyOn(React, 'useEffect').mockImplementation(f => f());

describe('Logout Component', () => {
  beforeEach(() => {
    // Clear mocks before each test
    mockNavigate.mockClear();
    mockDispatch.mockClear();
  });

  it('dispatches logout action and navigates to home page', () => {
    render(<Logout />);
    
    // Check that dispatch was called
    expect(mockDispatch).toHaveBeenCalled();
    
    // Check that navigation occurred
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});