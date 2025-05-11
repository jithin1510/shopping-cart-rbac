const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser');
const authController = require('../../controllers/Auth');
const User = require('../../models/User');
const Otp = require('../../models/OTP');
const PasswordResetToken = require('../../models/PasswordResetToken');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Mock dependencies
jest.mock('../../utils/Emails', () => ({
  sendMail: jest.fn().mockResolvedValue(true)
}));

jest.mock('../../utils/GenerateOtp', () => ({
  generateOTP: jest.fn().mockReturnValue('123456')
}));

jest.mock('../../utils/GenerateToken', () => ({
  generateToken: jest.fn().mockImplementation((user, isReset) => {
    return isReset ? 'reset-token-123' : 'auth-token-123';
  })
}));

// Create express app for testing
const app = express();
app.use(express.json());
app.use(cookieParser());

// Setup routes for testing
app.post('/auth/signup', authController.signup);
app.post('/auth/login', authController.login);
app.post('/auth/verify-otp', authController.verifyOtp);
app.post('/auth/resend-otp', authController.resendOtp);
app.post('/auth/forgot-password', authController.forgotPassword);
app.post('/auth/reset-password', authController.resetPassword);
app.get('/auth/logout', authController.logout);
app.get('/auth/check-auth', (req, res, next) => {
  req.user = { _id: 'test-user-id' };
  next();
}, authController.checkAuth);

describe('Auth Controller Tests', () => {
  describe('signup', () => {
    it('should create a new customer user', async () => {
      const userData = {
        name: 'Test Customer',
        email: 'customer@example.com',
        password: 'Password123',
        role: 'customer'
      };
      
      const response = await request(app)
        .post('/auth/signup')
        .send(userData)
        .expect(201);
      
      expect(response.body).toHaveProperty('_id');
      expect(response.body.name).toBe(userData.name);
      expect(response.body.email).toBe(userData.email);
      expect(response.body.role).toBe('customer');
      expect(response.body.isApproved).toBe(true);
      expect(response.body).not.toHaveProperty('password');
      
      // Check that password was hashed
      const savedUser = await User.findOne({ email: userData.email });
      expect(savedUser.password).not.toBe(userData.password);
      
      // Check that cookie was set
      expect(response.headers['set-cookie']).toBeDefined();
    });
    
    it('should create a new vendor user with isApproved=false', async () => {
      const userData = {
        name: 'Test Vendor',
        email: 'vendor@example.com',
        password: 'Password123',
        role: 'vendor'
      };
      
      const response = await request(app)
        .post('/auth/signup')
        .send(userData)
        .expect(201);
      
      expect(response.body).toHaveProperty('_id');
      expect(response.body.name).toBe(userData.name);
      expect(response.body.email).toBe(userData.email);
      expect(response.body.role).toBe('vendor');
      expect(response.body.isApproved).toBe(false);
    });
    
    it('should convert admin role to customer during signup', async () => {
      const userData = {
        name: 'Test Admin',
        email: 'admin@example.com',
        password: 'Password123',
        role: 'admin'
      };
      
      const response = await request(app)
        .post('/auth/signup')
        .send(userData)
        .expect(201);
      
      expect(response.body.role).toBe('customer');
      expect(response.body.isApproved).toBe(true);
    });
    
    it('should use default role when invalid role is provided', async () => {
      const userData = {
        name: 'Test User',
        email: 'invalid-role@example.com',
        password: 'Password123',
        role: 'invalid-role'
      };
      
      const response = await request(app)
        .post('/auth/signup')
        .send(userData)
        .expect(201);
      
      expect(response.body.role).toBe('customer');
      expect(response.body.isApproved).toBe(true);
    });
    
    it('should return 400 if user already exists', async () => {
      // Create user first
      const existingUser = new User({
        name: 'Existing User',
        email: 'existing@example.com',
        password: await bcrypt.hash('Password123', 10)
      });
      await existingUser.save();
      
      // Try to create user with same email
      const userData = {
        name: 'Duplicate User',
        email: 'existing@example.com',
        password: 'Password123'
      };
      
      await request(app)
        .post('/auth/signup')
        .send(userData)
        .expect(400);
    });
    
    it('should return 500 if an error occurs during signup', async () => {
      // Mock User.findOne to throw an error
      const originalFindOne = User.findOne;
      User.findOne = jest.fn().mockImplementation(() => {
        throw new Error('Database error');
      });
      
      const userData = {
        name: 'Error User',
        email: 'error@example.com',
        password: 'Password123'
      };
      
      await request(app)
        .post('/auth/signup')
        .send(userData)
        .expect(500);
      
      // Restore original function
      User.findOne = originalFindOne;
    });
  });
  
  describe('login', () => {
    beforeEach(async () => {
      // Create a test user
      const hashedPassword = await bcrypt.hash('Password123', 10);
      const testUser = new User({
        name: 'Login Test User',
        email: 'login@example.com',
        password: hashedPassword,
        isVerified: true
      });
      await testUser.save();
    });
    
    it('should login successfully with correct credentials', async () => {
      const loginData = {
        email: 'login@example.com',
        password: 'Password123'
      };
      
      const response = await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(200);
      
      expect(response.body).toHaveProperty('_id');
      expect(response.body.email).toBe(loginData.email);
      expect(response.body).not.toHaveProperty('password');
      
      // Check that cookie was set
      expect(response.headers['set-cookie']).toBeDefined();
    });
    
    it('should return 404 with incorrect password', async () => {
      const loginData = {
        email: 'login@example.com',
        password: 'WrongPassword'
      };
      
      await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(404);
    });
    
    it('should return 404 with non-existent email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'Password123'
      };
      
      await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(404);
    });
    
    it('should return 500 if an error occurs during login', async () => {
      // Mock User.findOne to throw an error
      const originalFindOne = User.findOne;
      User.findOne = jest.fn().mockImplementation(() => {
        throw new Error('Database error');
      });
      
      const loginData = {
        email: 'login@example.com',
        password: 'Password123'
      };
      
      await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(500);
      
      // Restore original function
      User.findOne = originalFindOne;
    });
  });
  
  describe('verifyOtp', () => {
    let testUser, testOtp;
    
    beforeEach(async () => {
      // Create test user
      testUser = new User({
        name: 'OTP Test User',
        email: 'otp@example.com',
        password: await bcrypt.hash('Password123', 10),
        isVerified: false
      });
      await testUser.save();
      
      // Create test OTP
      const hashedOtp = await bcrypt.hash('123456', 10);
      testOtp = new Otp({
        user: testUser._id,
        otp: hashedOtp,
        expiresAt: new Date(Date.now() + 300000) // 5 minutes from now
      });
      await testOtp.save();
    });
    
    it('should verify OTP successfully', async () => {
      const otpData = {
        userId: testUser._id,
        otp: '123456'
      };
      
      const response = await request(app)
        .post('/auth/verify-otp')
        .send(otpData)
        .expect(200);
      
      expect(response.body).toHaveProperty('_id');
      expect(response.body.isVerified).toBe(true);
      
      // Check that OTP was deleted
      const deletedOtp = await Otp.findById(testOtp._id);
      expect(deletedOtp).toBeNull();
    });
    
    it('should return 404 if user does not exist', async () => {
      const otpData = {
        userId: new mongoose.Types.ObjectId(),
        otp: '123456'
      };
      
      await request(app)
        .post('/auth/verify-otp')
        .send(otpData)
        .expect(404);
    });
    
    it('should return 404 if OTP does not exist', async () => {
      // Delete the OTP first
      await Otp.findByIdAndDelete(testOtp._id);
      
      const otpData = {
        userId: testUser._id,
        otp: '123456'
      };
      
      await request(app)
        .post('/auth/verify-otp')
        .send(otpData)
        .expect(404);
    });
    
    it('should return 400 if OTP is expired', async () => {
      // Update OTP to be expired
      await Otp.findByIdAndUpdate(testOtp._id, {
        expiresAt: new Date(Date.now() - 60000) // 1 minute ago
      });
      
      const otpData = {
        userId: testUser._id,
        otp: '123456'
      };
      
      await request(app)
        .post('/auth/verify-otp')
        .send(otpData)
        .expect(400);
      
      // Check that expired OTP was deleted
      const deletedOtp = await Otp.findById(testOtp._id);
      expect(deletedOtp).toBeNull();
    });
    
    it('should return 400 if OTP is invalid', async () => {
      const otpData = {
        userId: testUser._id,
        otp: '654321' // Wrong OTP
      };
      
      await request(app)
        .post('/auth/verify-otp')
        .send(otpData)
        .expect(400);
    });
    
    it('should return 500 if an error occurs during OTP verification', async () => {
      // Mock User.findById to throw an error
      const originalFindById = User.findById;
      User.findById = jest.fn().mockImplementation(() => {
        throw new Error('Database error');
      });
      
      const otpData = {
        userId: testUser._id,
        otp: '123456'
      };
      
      await request(app)
        .post('/auth/verify-otp')
        .send(otpData)
        .expect(500);
      
      // Restore original function
      User.findById = originalFindById;
    });
  });
  
  describe('resendOtp', () => {
    let testUser;
    
    beforeEach(async () => {
      // Create test user
      testUser = new User({
        name: 'Resend OTP User',
        email: 'resend@example.com',
        password: await bcrypt.hash('Password123', 10),
        isVerified: false
      });
      await testUser.save();
    });
    
    it('should resend OTP successfully', async () => {
      const resendData = {
        user: testUser._id
      };
      
      const response = await request(app)
        .post('/auth/resend-otp')
        .send(resendData)
        .expect(201);
      
      expect(response.body).toHaveProperty('message', 'OTP sent');
      
      // Check that OTP was created
      const otp = await Otp.findOne({ user: testUser._id });
      expect(otp).toBeDefined();
      expect(otp.user.toString()).toBe(testUser._id.toString());
    });
    
    it('should return 404 if user does not exist', async () => {
      const resendData = {
        user: new mongoose.Types.ObjectId()
      };
      
      await request(app)
        .post('/auth/resend-otp')
        .send(resendData)
        .expect(404);
    });
    
    it('should delete existing OTPs before creating a new one', async () => {
      // Create an existing OTP
      const hashedOtp = await bcrypt.hash('654321', 10);
      const existingOtp = new Otp({
        user: testUser._id,
        otp: hashedOtp,
        expiresAt: new Date(Date.now() + 300000)
      });
      await existingOtp.save();
      
      const resendData = {
        user: testUser._id
      };
      
      await request(app)
        .post('/auth/resend-otp')
        .send(resendData)
        .expect(201);
      
      // Check that old OTP was deleted
      const oldOtp = await Otp.findById(existingOtp._id);
      expect(oldOtp).toBeNull();
      
      // Check that new OTP was created
      const newOtp = await Otp.findOne({ user: testUser._id });
      expect(newOtp).toBeDefined();
      expect(newOtp._id.toString()).not.toBe(existingOtp._id.toString());
    });
    
    it('should return 500 if an error occurs during OTP resend', async () => {
      // Mock User.findById to throw an error
      const originalFindById = User.findById;
      User.findById = jest.fn().mockImplementation(() => {
        throw new Error('Database error');
      });
      
      const resendData = {
        user: testUser._id
      };
      
      await request(app)
        .post('/auth/resend-otp')
        .send(resendData)
        .expect(500);
      
      // Restore original function
      User.findById = originalFindById;
    });
  });
  
  describe('forgotPassword', () => {
    let testUser;
    
    beforeEach(async () => {
      // Create test user
      testUser = new User({
        name: 'Forgot Password User',
        email: 'forgot@example.com',
        password: await bcrypt.hash('Password123', 10)
      });
      await testUser.save();
    });
    
    it('should send password reset link successfully', async () => {
      const forgotData = {
        email: 'forgot@example.com'
      };
      
      const response = await request(app)
        .post('/auth/forgot-password')
        .send(forgotData)
        .expect(200);
      
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Password Reset link sent to');
      
      // Check that reset token was created
      const resetToken = await PasswordResetToken.findOne({ user: testUser._id });
      expect(resetToken).toBeDefined();
      expect(resetToken.user.toString()).toBe(testUser._id.toString());
    });
    
    it('should return 404 if email does not exist', async () => {
      const forgotData = {
        email: 'nonexistent@example.com'
      };
      
      await request(app)
        .post('/auth/forgot-password')
        .send(forgotData)
        .expect(404);
    });
    
    it('should delete existing reset tokens before creating a new one', async () => {
      // Create an existing reset token
      const hashedToken = await bcrypt.hash('old-token', 10);
      const existingToken = new PasswordResetToken({
        user: testUser._id,
        token: hashedToken,
        expiresAt: new Date(Date.now() + 300000)
      });
      await existingToken.save();
      
      const forgotData = {
        email: 'forgot@example.com'
      };
      
      await request(app)
        .post('/auth/forgot-password')
        .send(forgotData)
        .expect(200);
      
      // Check that old token was deleted
      const oldToken = await PasswordResetToken.findById(existingToken._id);
      expect(oldToken).toBeNull();
      
      // Check that new token was created
      const newToken = await PasswordResetToken.findOne({ user: testUser._id });
      expect(newToken).toBeDefined();
      expect(newToken._id.toString()).not.toBe(existingToken._id.toString());
    });
    
    it('should return 500 if an error occurs during password reset request', async () => {
      // Mock User.findOne to throw an error
      const originalFindOne = User.findOne;
      User.findOne = jest.fn().mockImplementation(() => {
        throw new Error('Database error');
      });
      
      const forgotData = {
        email: 'forgot@example.com'
      };
      
      await request(app)
        .post('/auth/forgot-password')
        .send(forgotData)
        .expect(500);
      
      // Restore original function
      User.findOne = originalFindOne;
    });
  });
  
  describe('resetPassword', () => {
    let testUser, testToken;
    
    beforeEach(async () => {
      // Create test user
      testUser = new User({
        name: 'Reset Password User',
        email: 'reset@example.com',
        password: await bcrypt.hash('OldPassword123', 10)
      });
      await testUser.save();
      
      // Create test reset token
      const hashedToken = await bcrypt.hash('reset-token-123', 10);
      testToken = new PasswordResetToken({
        user: testUser._id,
        token: hashedToken,
        expiresAt: new Date(Date.now() + 300000) // 5 minutes from now
      });
      await testToken.save();
    });
    
    it('should reset password successfully', async () => {
      const resetData = {
        userId: testUser._id,
        token: 'reset-token-123',
        password: 'NewPassword123'
      };
      
      const response = await request(app)
        .post('/auth/reset-password')
        .send(resetData)
        .expect(200);
      
      expect(response.body).toHaveProperty('message', 'Password Updated Successfuly');
      
      // Check that token was deleted
      const deletedToken = await PasswordResetToken.findById(testToken._id);
      expect(deletedToken).toBeNull();
      
      // Check that password was updated
      const updatedUser = await User.findById(testUser._id);
      const passwordMatches = await bcrypt.compare('NewPassword123', updatedUser.password);
      expect(passwordMatches).toBe(true);
    });
    
    it('should return 404 if user does not exist', async () => {
      const resetData = {
        userId: new mongoose.Types.ObjectId(),
        token: 'reset-token-123',
        password: 'NewPassword123'
      };
      
      await request(app)
        .post('/auth/reset-password')
        .send(resetData)
        .expect(404);
    });
    
    it('should return 404 if reset token does not exist', async () => {
      // Delete the token first
      await PasswordResetToken.findByIdAndDelete(testToken._id);
      
      const resetData = {
        userId: testUser._id,
        token: 'reset-token-123',
        password: 'NewPassword123'
      };
      
      await request(app)
        .post('/auth/reset-password')
        .send(resetData)
        .expect(404);
    });
    
    it('should return 404 if token is expired', async () => {
      // Update token to be expired
      await PasswordResetToken.findByIdAndUpdate(testToken._id, {
        expiresAt: new Date(Date.now() - 60000) // 1 minute ago
      });
      
      const resetData = {
        userId: testUser._id,
        token: 'reset-token-123',
        password: 'NewPassword123'
      };
      
      await request(app)
        .post('/auth/reset-password')
        .send(resetData)
        .expect(404);
      
      // Check that expired token was deleted
      const deletedToken = await PasswordResetToken.findById(testToken._id);
      expect(deletedToken).toBeNull();
    });
    
    it('should return 404 if token is invalid', async () => {
      const resetData = {
        userId: testUser._id,
        token: 'wrong-token',
        password: 'NewPassword123'
      };
      
      await request(app)
        .post('/auth/reset-password')
        .send(resetData)
        .expect(404);
    });
    
    it('should return 500 if an error occurs during password reset', async () => {
      // Mock User.findById to throw an error
      const originalFindById = User.findById;
      User.findById = jest.fn().mockImplementation(() => {
        throw new Error('Database error');
      });
      
      const resetData = {
        userId: testUser._id,
        token: 'reset-token-123',
        password: 'NewPassword123'
      };
      
      await request(app)
        .post('/auth/reset-password')
        .send(resetData)
        .expect(500);
      
      // Restore original function
      User.findById = originalFindById;
    });
  });
  
  describe('logout', () => {
    it('should clear the token cookie', async () => {
      const response = await request(app)
        .get('/auth/logout')
        .expect(200);
      
      // Check that cookie was cleared (maxAge=0)
      expect(response.headers['set-cookie'][0]).toContain('token=');
      expect(response.headers['set-cookie'][0]).toContain('Max-Age=0');
    });
    
    it('should return 500 if an error occurs during logout', async () => {
      // Mock res.cookie to throw an error
      const originalCookie = express.response.cookie;
      express.response.cookie = jest.fn().mockImplementation(() => {
        throw new Error('Cookie error');
      });
      
      await request(app)
        .get('/auth/logout')
        .expect(500);
      
      // Restore original function
      express.response.cookie = originalCookie;
    });
  });
  
  describe('checkAuth', () => {
    it('should return user details if authenticated', async () => {
      // Mock User.findById to return a user
      const mockUser = new User({
        name: 'Auth Check User',
        email: 'authcheck@example.com',
        password: 'hashedpassword',
        isVerified: true
      });
      await mockUser.save();
      
      // Override req.user for this test
      app.get('/auth/check-auth-test', (req, res, next) => {
        req.user = { _id: mockUser._id };
        next();
      }, authController.checkAuth);
      
      const response = await request(app)
        .get('/auth/check-auth-test')
        .expect(200);
      
      expect(response.body).toHaveProperty('_id');
      expect(response.body.email).toBe(mockUser.email);
      expect(response.body).not.toHaveProperty('password');
    });
    
    it('should return 401 if not authenticated', async () => {
      // Override req.user for this test
      app.get('/auth/check-auth-unauth', (req, res, next) => {
        req.user = null;
        next();
      }, authController.checkAuth);
      
      await request(app)
        .get('/auth/check-auth-unauth')
        .expect(401);
    });
    
    it('should return 500 if an error occurs during auth check', async () => {
      // Mock User.findById to throw an error
      const originalFindById = User.findById;
      User.findById = jest.fn().mockImplementation(() => {
        throw new Error('Database error');
      });
      
      await request(app)
        .get('/auth/check-auth')
        .expect(500);
      
      // Restore original function
      User.findById = originalFindById;
    });
  });
});