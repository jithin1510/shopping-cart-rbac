import { axiosi } from '../axios';

describe('Axios Configuration', () => {
  it('should have the correct base configuration', () => {
    expect(axiosi.defaults.baseURL).toBeDefined();
    expect(axiosi.defaults.withCredentials).toBe(true);
  });
});