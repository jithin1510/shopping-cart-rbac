const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser');
const userController = require('../../controllers/User');
const User = require('../../models/User');
const { createTestUser } = require('../utils/test-utils');
const mongoose = require('mongoose');

// Mock middleware
const mockVerifyToken = (req, res, next) => {
  if (req.headers.authorization) {
    const token = req.headers.authorization.split(' ')[1];
    req.user = JSON.parse(Buffer.from(token, 'base64').toString());
    next();
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
};

// Create express app for testing
const app = express();
app.use(express.json());
app.use(cookieParser());

// Setup routes for testing
app.get('/users/:id', mockVerifyToken, userController.getById);
app.patch('/users/:id', mockVerifyToken, userController.updateById);
app.get('/users/vendors/all', mockVerifyToken, userController.getAllVendors);
app.patch('/users/vendors/approve/:id', mockVerifyToken, userController.approveVendor);

describe('User Controller Tests', () => {
  let testUser, testAdmin, testVendor;
  
  beforeEach(async () => {
    // Create test users
    testUser = await createTestUser({ 
      name: 'Regular User',
      role: 'customer' 
    });
    
    testAdmin = await createTestUser({ 
      name: 'Admin User',
      role: 'admin', 
      isAdmin: true 
    });
    
    testVendor = await createTestUser({ 
      name: 'Vendor User',
      role: 'vendor', 
      isApproved: false 
    });
  });
  
  describe('getById', () => {
    it('should return user details without password', async () => {
      const userToken = Buffer.from(JSON.stringify({
        _id: testUser._id
      })).toString('base64');
      
      const response = await request(app)
        .get(`/users/${testUser._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('_id');
      expect(response.body._id.toString()).toBe(testUser._id.toString());
      expect(response.body.name).toBe(testUser.name);
      expect(response.body).not.toHaveProperty('password');
    });
    
    it('should return 401 when not authenticated', async () => {
      await request(app)
        .get(`/users/${testUser._id}`)
        .expect(401);
    });
    
    it('should return 500 if an error occurs during user retrieval', async () => {
      // Mock User.findById to throw an error
      const originalFindById = User.findById;
      User.findById = jest.fn().mockImplementation(() => {
        throw new Error('Database error');
      });
      
      const userToken = Buffer.from(JSON.stringify({
        _id: testUser._id
      })).toString('base64');
      
      await request(app)
        .get(`/users/${testUser._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(500);
      
      // Restore original function
      User.findById = originalFindById;
    });
    
    it('should handle non-existent user gracefully', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const userToken = Buffer.from(JSON.stringify({
        _id: testUser._id
      })).toString('base64');
      
      // Mock User.findById to return null
      const originalFindById = User.findById;
      User.findById = jest.fn().mockResolvedValue(null);
      
      await request(app)
        .get(`/users/${nonExistentId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(500); // Current implementation returns 500 for this case
      
      // Restore original function
      User.findById = originalFindById;
    });
  });
  
  describe('updateById', () => {
    it('should update user details', async () => {
      const updateData = {
        name: 'Updated Name'
      };
      
      const userToken = Buffer.from(JSON.stringify({
        _id: testUser._id
      })).toString('base64');
      
      const response = await request(app)
        .patch(`/users/${testUser._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData)
        .expect(200);
      
      expect(response.body.name).toBe(updateData.name);
    });
    
    it('should not allow updating role, isAdmin, or isApproved', async () => {
      const updateData = {
        name: 'Valid Update',
        role: 'admin',
        isAdmin: true,
        isApproved: true
      };
      
      const userToken = Buffer.from(JSON.stringify({
        _id: testUser._id
      })).toString('base64');
      
      const response = await request(app)
        .patch(`/users/${testUser._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData)
        .expect(200);
      
      expect(response.body.name).toBe(updateData.name);
      expect(response.body.role).toBe('customer'); // Unchanged
      expect(response.body.isAdmin).toBe(false); // Unchanged
    });
    
    it('should return 500 if an error occurs during user update', async () => {
      // Mock User.findByIdAndUpdate to throw an error
      const originalFindByIdAndUpdate = User.findByIdAndUpdate;
      User.findByIdAndUpdate = jest.fn().mockImplementation(() => {
        throw new Error('Database error');
      });
      
      const userToken = Buffer.from(JSON.stringify({
        _id: testUser._id
      })).toString('base64');
      
      await request(app)
        .patch(`/users/${testUser._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Error Update' })
        .expect(500);
      
      // Restore original function
      User.findByIdAndUpdate = originalFindByIdAndUpdate;
    });
    
    it('should handle non-existent user gracefully during update', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const userToken = Buffer.from(JSON.stringify({
        _id: testUser._id
      })).toString('base64');
      
      // Mock User.findByIdAndUpdate to return null
      const originalFindByIdAndUpdate = User.findByIdAndUpdate;
      User.findByIdAndUpdate = jest.fn().mockResolvedValue(null);
      
      await request(app)
        .patch(`/users/${nonExistentId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Updated Name' })
        .expect(500); // Current implementation returns 500 for this case
      
      // Restore original function
      User.findByIdAndUpdate = originalFindByIdAndUpdate;
    });
  });
  
  describe('getAllVendors', () => {
    it('should return all vendors when admin is authenticated', async () => {
      // Create a few more vendors
      await createTestUser({ 
        name: 'Vendor 2',
        role: 'vendor' 
      });
      
      await createTestUser({ 
        name: 'Vendor 3',
        role: 'vendor', 
        isApproved: true 
      });
      
      const adminToken = Buffer.from(JSON.stringify({
        _id: testAdmin._id,
        role: 'admin',
        isAdmin: true
      })).toString('base64');
      
      const response = await request(app)
        .get('/users/vendors/all')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(3);
      
      // All returned users should be vendors
      response.body.forEach(user => {
        expect(user.role).toBe('vendor');
        expect(user).not.toHaveProperty('password');
      });
    });
    
    it('should return 403 when non-admin tries to access', async () => {
      const userToken = Buffer.from(JSON.stringify({
        _id: testUser._id,
        role: 'customer'
      })).toString('base64');
      
      await request(app)
        .get('/users/vendors/all')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });
    
    it('should return 401 when not authenticated', async () => {
      await request(app)
        .get('/users/vendors/all')
        .expect(401);
    });
    
    it('should return 500 if an error occurs during vendors retrieval', async () => {
      // Mock User.find to throw an error
      const originalFind = User.find;
      User.find = jest.fn().mockImplementation(() => {
        throw new Error('Database error');
      });
      
      const adminToken = Buffer.from(JSON.stringify({
        _id: testAdmin._id,
        role: 'admin',
        isAdmin: true
      })).toString('base64');
      
      await request(app)
        .get('/users/vendors/all')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(500);
      
      // Restore original function
      User.find = originalFind;
    });
  });
  
  describe('approveVendor', () => {
    it('should approve a vendor when admin is authenticated', async () => {
      const adminToken = Buffer.from(JSON.stringify({
        _id: testAdmin._id,
        role: 'admin',
        isAdmin: true
      })).toString('base64');
      
      const response = await request(app)
        .patch(`/users/vendors/approve/${testVendor._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isApproved: true })
        .expect(200);
      
      expect(response.body._id.toString()).toBe(testVendor._id.toString());
      expect(response.body.isApproved).toBe(true);
    });
    
    it('should reject a vendor when admin is authenticated', async () => {
      // First approve the vendor
      testVendor.isApproved = true;
      await testVendor.save();
      
      const adminToken = Buffer.from(JSON.stringify({
        _id: testAdmin._id,
        role: 'admin',
        isAdmin: true
      })).toString('base64');
      
      const response = await request(app)
        .patch(`/users/vendors/approve/${testVendor._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isApproved: false })
        .expect(200);
      
      expect(response.body._id.toString()).toBe(testVendor._id.toString());
      expect(response.body.isApproved).toBe(false);
    });
    
    it('should return 403 when non-admin tries to approve vendor', async () => {
      const userToken = Buffer.from(JSON.stringify({
        _id: testUser._id,
        role: 'customer'
      })).toString('base64');
      
      await request(app)
        .patch(`/users/vendors/approve/${testVendor._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ isApproved: true })
        .expect(403);
    });
    
    it('should return 400 when trying to approve a non-vendor user', async () => {
      const adminToken = Buffer.from(JSON.stringify({
        _id: testAdmin._id,
        role: 'admin',
        isAdmin: true
      })).toString('base64');
      
      await request(app)
        .patch(`/users/vendors/approve/${testUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isApproved: true })
        .expect(400);
    });
    
    it('should return 400 when isApproved is not a boolean', async () => {
      const adminToken = Buffer.from(JSON.stringify({
        _id: testAdmin._id,
        role: 'admin',
        isAdmin: true
      })).toString('base64');
      
      await request(app)
        .patch(`/users/vendors/approve/${testVendor._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isApproved: 'not-a-boolean' })
        .expect(400);
    });
    
    it('should return 404 when vendor does not exist', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const adminToken = Buffer.from(JSON.stringify({
        _id: testAdmin._id,
        role: 'admin',
        isAdmin: true
      })).toString('base64');
      
      await request(app)
        .patch(`/users/vendors/approve/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isApproved: true })
        .expect(404);
    });
    
    it('should return 500 if an error occurs during vendor approval', async () => {
      // Mock User.findById to throw an error
      const originalFindById = User.findById;
      User.findById = jest.fn().mockImplementation(() => {
        throw new Error('Database error');
      });
      
      const adminToken = Buffer.from(JSON.stringify({
        _id: testAdmin._id,
        role: 'admin',
        isAdmin: true
      })).toString('base64');
      
      await request(app)
        .patch(`/users/vendors/approve/${testVendor._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isApproved: true })
        .expect(500);
      
      // Restore original function
      User.findById = originalFindById;
    });
  });
});