import { store } from '../store';

describe('Redux Store', () => {
  it('should have the correct initial state structure', () => {
    const state = store.getState();
    
    // Check that all slices are present
    expect(state).toHaveProperty('AuthSlice');
    expect(state).toHaveProperty('ProductSlice');
    expect(state).toHaveProperty('CartSlice');
    expect(state).toHaveProperty('WishlistSlice');
    expect(state).toHaveProperty('OrderSlice');
    expect(state).toHaveProperty('UserSlice');
    expect(state).toHaveProperty('AddressSlice');
    expect(state).toHaveProperty('ReviewSlice');
    expect(state).toHaveProperty('BrandSlice');
    expect(state).toHaveProperty('CategoriesSlice');
  });
});