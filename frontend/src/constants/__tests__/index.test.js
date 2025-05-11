import { ROLES } from '../index';

describe('Constants', () => {
  it('should have the correct role constants', () => {
    expect(ROLES).toHaveProperty('CUSTOMER');
    expect(ROLES).toHaveProperty('VENDOR');
    expect(ROLES).toHaveProperty('ADMIN');
    
    expect(ROLES.CUSTOMER).toBe('customer');
    expect(ROLES.VENDOR).toBe('vendor');
    expect(ROLES.ADMIN).toBe('admin');
  });
});