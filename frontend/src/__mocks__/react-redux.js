// Mock for react-redux
const mockDispatch = jest.fn();
const mockSelector = jest.fn().mockImplementation(selector => {
  // Default mock state
  const mockState = {
    AuthSlice: {
      loggedInUser: null,
      isAuthChecked: true,
      loginStatus: 'idle',
      loginError: null,
      signupStatus: 'idle',
      signupError: null
    },
    ProductSlice: {
      products: [],
      status: 'idle'
    },
    UserSlice: {
      vendors: [],
      vendorsStatus: 'idle'
    }
  };
  return selector(mockState);
});

module.exports = {
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
  useSelector: mockSelector,
  Provider: ({ children }) => <div>{children}</div>
};