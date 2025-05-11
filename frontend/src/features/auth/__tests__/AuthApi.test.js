import { axiosi } from '../../../config/axios';
import { login, logout, signup } from '../AuthApi';

// Mock axios
jest.mock('../../../config/axios', () => ({
  axiosi: {
    post: jest.fn(() => Promise.resolve({ data: { message: 'success' } })),
    get: jest.fn(() => Promise.resolve({ data: { message: 'success' } }))
  }
}));

describe('Auth API', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should call signup API with correct parameters', async () => {
    const credentials = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    };

    await signup(credentials);

    expect(axiosi.post).toHaveBeenCalledWith('auth/signup', credentials);
  });

  it('should call login API with correct parameters', async () => {
    const credentials = {
      email: 'test@example.com',
      password: 'password123'
    };

    await login(credentials);

    expect(axiosi.post).toHaveBeenCalledWith('auth/login', credentials);
  });

  it('should call logout API', async () => {
    await logout();

    expect(axiosi.get).toHaveBeenCalledWith('auth/logout');
  });
});