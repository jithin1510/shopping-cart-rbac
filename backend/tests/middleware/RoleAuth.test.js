const { authorizeRoles, isApprovedVendor, isProductOwner } = require('../../middleware/RoleAuth');
const { createTestUser, createTestProduct } = require('../utils/test-utils');
const mongoose = require('mongoose');

describe('Role-Based Authorization Middleware Tests', () => {
  describe('authorizeRoles middleware', () => {
    it('should call next() when user has allowed role', () => {
      const req = {
        user: { role: 'admin' }
      };
      const res = {};
      const next = jest.fn();
      
      const middleware = authorizeRoles('admin', 'vendor');
      middleware(req, res, next);
      
      expect(next).toHaveBeenCalled();
    });
    
    it('should return 401 when user is not authenticated', () => {
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();
      
      const middleware = authorizeRoles('admin');
      middleware(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.any(String)
      }));
      expect(next).not.toHaveBeenCalled();
    });
    
    it('should return 403 when user has unauthorized role', () => {
      const req = {
        user: { role: 'customer' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();
      
      const middleware = authorizeRoles('admin', 'vendor');
      middleware(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.any(String)
      }));
      expect(next).not.toHaveBeenCalled();
    });
  });
  
  describe('isApprovedVendor middleware', () => {
    it('should call next() when vendor is approved', () => {
      const req = {
        user: { role: 'vendor', isApproved: true }
      };
      const res = {};
      const next = jest.fn();
      
      isApprovedVendor(req, res, next);
      
      expect(next).toHaveBeenCalled();
    });
    
    it('should call next() when user is not a vendor', () => {
      const req = {
        user: { role: 'customer' }
      };
      const res = {};
      const next = jest.fn();
      
      isApprovedVendor(req, res, next);
      
      expect(next).toHaveBeenCalled();
    });
    
    it('should return 401 when user is not authenticated', () => {
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();
      
      isApprovedVendor(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });
    
    it('should return 403 when vendor is not approved', () => {
      const req = {
        user: { role: 'vendor', isApproved: false }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();
      
      isApprovedVendor(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });
  });
  
  describe('isProductOwner middleware', () => {
    let testVendor, testProduct;
    
    beforeEach(async () => {
      testVendor = await createTestUser({ role: 'vendor', isApproved: true });
      testProduct = await createTestProduct({}, testVendor);
    });
    
    it('should call next() when user is admin', async () => {
      const req = {
        user: { role: 'admin', _id: new mongoose.Types.ObjectId() },
        params: { id: testProduct._id }
      };
      const res = {};
      const next = jest.fn();
      
      await isProductOwner(req, res, next);
      
      expect(next).toHaveBeenCalled();
    });
    
    it('should call next() when vendor is product owner', async () => {
      const req = {
        user: { role: 'vendor', _id: testVendor._id },
        params: { id: testProduct._id }
      };
      const res = {};
      const next = jest.fn();
      
      await isProductOwner(req, res, next);
      
      expect(next).toHaveBeenCalled();
    });
    
    it('should return 403 when vendor is not product owner', async () => {
      const otherVendor = await createTestUser({ role: 'vendor', isApproved: true });
      
      const req = {
        user: { role: 'vendor', _id: otherVendor._id },
        params: { id: testProduct._id }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();
      
      await isProductOwner(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });
    
    it('should return 404 when product does not exist', async () => {
      const req = {
        user: { role: 'vendor', _id: testVendor._id },
        params: { id: new mongoose.Types.ObjectId() }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();
      
      await isProductOwner(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(next).not.toHaveBeenCalled();
    });
  });
});