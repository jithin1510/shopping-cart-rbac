import { theme } from '../theme';

describe('Theme', () => {
  it('should have the correct theme configuration', () => {
    expect(theme).toHaveProperty('palette');
    expect(theme).toHaveProperty('typography');
    expect(theme).toHaveProperty('components');
    
    // Check palette
    expect(theme.palette).toHaveProperty('primary');
    expect(theme.palette).toHaveProperty('secondary');
    
    // Check typography
    expect(theme.typography).toHaveProperty('fontFamily');
  });
});