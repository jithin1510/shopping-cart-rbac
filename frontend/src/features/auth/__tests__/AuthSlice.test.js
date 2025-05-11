import authReducer, {
  resetSignupStatus,
  clearSignupError,
  resetLoginStatus,
  clearLoginError
} from '../AuthSlice';

describe('Auth Slice', () => {
  const initialState = {
    status: 'idle',
    errors: null,
    loggedInUser: null,
    signupStatus: 'idle',
    signupError: null,
    loginStatus: 'idle',
    loginError: null,
    otpVerificationStatus: 'idle',
    otpVerificationError: null,
    isAuthChecked: false
  };

  describe('reducers', () => {
    it('should handle initial state', () => {
      const state = authReducer(undefined, { type: 'unknown' });
      expect(state.status).toBe('idle');
      expect(state.loggedInUser).toBeNull();
    });
    
    it('should handle resetSignupStatus', () => {
      const state = authReducer(
        { ...initialState, signupStatus: 'fullfilled' },
        resetSignupStatus()
      );
      expect(state.signupStatus).toBe('idle');
    });
    
    it('should handle clearSignupError', () => {
      const state = authReducer(
        { ...initialState, signupError: { message: 'Error' } },
        clearSignupError()
      );
      expect(state.signupError).toBeNull();
    });
    
    it('should handle resetLoginStatus', () => {
      const state = authReducer(
        { ...initialState, loginStatus: 'fullfilled' },
        resetLoginStatus()
      );
      expect(state.loginStatus).toBe('idle');
    });
    
    it('should handle clearLoginError', () => {
      const state = authReducer(
        { ...initialState, loginError: { message: 'Error' } },
        clearLoginError()
      );
      expect(state.loginError).toBeNull();
    });
  });
});