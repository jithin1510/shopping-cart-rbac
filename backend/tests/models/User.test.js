const mongoose = require('mongoose');
const User = require('../../models/User');

describe('User Model Tests', () => {
  describe('Field validations', () => {
    it('should create a valid user with required fields', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123'
      };
      
      const user = new User(userData);
      const savedUser = await user.save();
      
      expect(savedUser._id).toBeDefined();
      expect(savedUser.name).toBe(userData.name);
      expect(savedUser.email).toBe(userData.email);
      expect(savedUser.password).toBe(userData.password);
      expect(savedUser.isVerified).toBe(false); // Default value
      expect(savedUser.role).toBe('customer'); // Default value
      expect(savedUser.isApproved).toBe(true); // Default for customer
      expect(savedUser.isAdmin).toBe(false); // Default value
    });
    
    it('should fail when required fields are missing', async () => {
      const userWithoutName = new User({
        email: 'test@example.com',
        password: 'Password123'
      });
      
      const userWithoutEmail = new User({
        name: 'Test User',
        password: 'Password123'
      });
      
      const userWithoutPassword = new User({
        name: 'Test User',
        email: 'test@example.com'
      });
      
      await expect(userWithoutName.save()).rejects.toThrow();
      await expect(userWithoutEmail.save()).rejects.toThrow();
      await expect(userWithoutPassword.save()).rejects.toThrow();
    });
    
    it('should enforce email uniqueness', async () => {
      // Create first user
      const userData = {
        name: 'Test User 1',
        email: 'duplicate@example.com',
        password: 'Password123'
      };
      
      const user1 = new User(userData);
      await user1.save();
      
      // Try to create second user with same email
      const user2 = new User({
        name: 'Test User 2',
        email: 'duplicate@example.com',
        password: 'Password456'
      });
      
      await expect(user2.save()).rejects.toThrow();
    });
  });
  
  describe('Role-based behavior', () => {
    it('should set isApproved=false for vendor role by default', async () => {
      const vendorUser = new User({
        name: 'Vendor User',
        email: 'vendor@example.com',
        password: 'Password123',
        role: 'vendor'
      });
      
      const savedVendor = await vendorUser.save();
      expect(savedVendor.isApproved).toBe(false);
    });
    
    it('should set isApproved=true for customer role by default', async () => {
      const customerUser = new User({
        name: 'Customer User',
        email: 'customer@example.com',
        password: 'Password123',
        role: 'customer'
      });
      
      const savedCustomer = await customerUser.save();
      expect(savedCustomer.isApproved).toBe(true);
    });
    
    it('should validate role enum values', async () => {
      const invalidRoleUser = new User({
        name: 'Invalid Role User',
        email: 'invalid@example.com',
        password: 'Password123',
        role: 'invalid-role' // Not in enum
      });
      
      await expect(invalidRoleUser.save()).rejects.toThrow();
    });
  });
});