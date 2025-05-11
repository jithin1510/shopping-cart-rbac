const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser');
const productController = require('../../controllers/Product');
const Product = require('../../models/Product');
const { createTestUser, createTestProduct, generateTestToken } = require('../utils/test-utils');
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
app.get('/products', productController.getAll);
app.post('/products', mockVerifyToken, productController.create);
app.get('/products/vendor/my-products', mockVerifyToken, productController.getVendorProducts);
app.get('/products/:id', productController.getById);
app.patch('/products/:id', mockVerifyToken, productController.updateById);
app.delete('/products/:id', mockVerifyToken, productController.deleteById);
app.patch('/products/undelete/:id', mockVerifyToken, productController.undeleteById);

describe('Product Controller Tests', () => {
  let testVendor, testAdmin, testCustomer, testProduct;
  
  beforeEach(async () => {
    // Create test users
    testVendor = await createTestUser({ 
      role: 'vendor', 
      isApproved: true 
    });
    
    testAdmin = await createTestUser({ 
      role: 'admin', 
      isAdmin: true 
    });
    
    testCustomer = await createTestUser({ 
      role: 'customer' 
    });
    
    // Create test product
    testProduct = await createTestProduct({}, testVendor);
  });
  
  describe('getAll', () => {
    it('should return all products', async () => {
      // Create a few more products
      await createTestProduct({ title: 'Product 2' }, testVendor);
      await createTestProduct({ title: 'Product 3' }, testVendor);
      
      const response = await request(app)
        .get('/products')
        .expect(200);
      
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(3);
      expect(response.body[0]).toHaveProperty('_id');
      expect(response.body[0]).toHaveProperty('title');
    });
    
    it('should filter products by brand', async () => {
      const Brand = require('../../models/Brand');
      const testBrand = new Brand({ name: 'Filter Brand' });
      await testBrand.save();
      
      await createTestProduct({ 
        title: 'Filtered Product', 
        brand: testBrand._id 
      }, testVendor);
      
      const response = await request(app)
        .get(`/products?brand=${testBrand._id}`)
        .expect(200);
      
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].title).toBe('Filtered Product');
    });
    
    it('should filter products by category', async () => {
      const Category = require('../../models/Category');
      const testCategory = new Category({ name: 'Filter Category' });
      await testCategory.save();
      
      await createTestProduct({ 
        title: 'Category Product', 
        category: testCategory._id 
      }, testVendor);
      
      const response = await request(app)
        .get(`/products?category=${testCategory._id}`)
        .expect(200);
      
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].title).toBe('Category Product');
    });
    
    it('should filter products by vendor', async () => {
      // Create another vendor with products
      const anotherVendor = await createTestUser({ 
        role: 'vendor', 
        isApproved: true 
      });
      
      await createTestProduct({ title: 'Vendor Specific Product' }, anotherVendor);
      
      const response = await request(app)
        .get(`/products?vendor=${anotherVendor._id}`)
        .expect(200);
      
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].title).toBe('Vendor Specific Product');
    });
    
    it('should filter non-deleted products for user view', async () => {
      // Create a deleted product
      await createTestProduct({ 
        title: 'Deleted Product', 
        isDeleted: true 
      }, testVendor);
      
      const response = await request(app)
        .get('/products?user=true')
        .expect(200);
      
      // All returned products should not be deleted
      response.body.forEach(product => {
        expect(product.isDeleted).not.toBe(true);
      });
    });
    
    it('should sort products by specified field', async () => {
      // Create products with different prices
      await createTestProduct({ 
        title: 'Expensive Product', 
        price: 999.99 
      }, testVendor);
      
      await createTestProduct({ 
        title: 'Cheap Product', 
        price: 9.99 
      }, testVendor);
      
      // Sort by price ascending
      const response = await request(app)
        .get('/products?sort=price&order=asc')
        .expect(200);
      
      expect(response.body[0].price).toBeLessThan(response.body[1].price);
      
      // Sort by price descending
      const descResponse = await request(app)
        .get('/products?sort=price&order=desc')
        .expect(200);
      
      expect(descResponse.body[0].price).toBeGreaterThan(descResponse.body[1].price);
    });
    
    it('should paginate results', async () => {
      // Create 10 more products
      for (let i = 0; i < 10; i++) {
        await createTestProduct({ title: `Paginated Product ${i}` }, testVendor);
      }
      
      const response = await request(app)
        .get('/products?page=1&limit=5')
        .expect(200);
      
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(5);
      expect(response.headers['x-total-count']).toBeDefined();
      
      // Check second page
      const page2Response = await request(app)
        .get('/products?page=2&limit=5')
        .expect(200);
      
      expect(page2Response.body.length).toBe(5);
      expect(page2Response.body[0]._id).not.toBe(response.body[0]._id);
    });
    
    it('should return 500 if an error occurs during product retrieval', async () => {
      // Mock Product.find to throw an error
      const originalFind = Product.find;
      Product.find = jest.fn().mockImplementation(() => {
        throw new Error('Database error');
      });
      
      await request(app)
        .get('/products')
        .expect(500);
      
      // Restore original function
      Product.find = originalFind;
    });
  });
  
  describe('create', () => {
    it('should create a product when vendor is authenticated', async () => {
      const productData = {
        title: 'New Test Product',
        description: 'This is a new test product',
        price: 129.99,
        category: testProduct.category,
        brand: testProduct.brand,
        stockQuantity: 50,
        thumbnail: 'https://example.com/new-thumbnail.jpg',
        images: ['https://example.com/new-image.jpg']
      };
      
      const vendorToken = Buffer.from(JSON.stringify({
        _id: testVendor._id,
        role: 'vendor',
        isApproved: true
      })).toString('base64');
      
      const response = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${vendorToken}`)
        .send(productData)
        .expect(201);
      
      expect(response.body).toHaveProperty('_id');
      expect(response.body.title).toBe(productData.title);
      expect(response.body.vendor.toString()).toBe(testVendor._id.toString());
    });
    
    it('should return 401 when not authenticated', async () => {
      const productData = {
        title: 'Unauthorized Product',
        description: 'This product should not be created',
        price: 99.99,
        category: testProduct.category,
        brand: testProduct.brand,
        stockQuantity: 10,
        thumbnail: 'https://example.com/thumbnail.jpg',
        images: ['https://example.com/image.jpg']
      };
      
      await request(app)
        .post('/products')
        .send(productData)
        .expect(401);
    });
    
    it('should return 500 if an error occurs during product creation', async () => {
      // Create a product with invalid data to trigger validation error
      const productData = {
        // Missing required fields
        title: 'Invalid Product'
      };
      
      const vendorToken = Buffer.from(JSON.stringify({
        _id: testVendor._id,
        role: 'vendor',
        isApproved: true
      })).toString('base64');
      
      await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${vendorToken}`)
        .send(productData)
        .expect(500);
    });
  });
  
  describe('getById', () => {
    it('should return a product by ID', async () => {
      const response = await request(app)
        .get(`/products/${testProduct._id}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('_id');
      expect(response.body._id.toString()).toBe(testProduct._id.toString());
      expect(response.body.title).toBe(testProduct.title);
    });
    
    it('should return 404 for non-existent product', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      await request(app)
        .get(`/products/${nonExistentId}`)
        .expect(404);
    });
    
    it('should return 500 if an error occurs during product retrieval', async () => {
      // Mock Product.findById to throw an error
      const originalFindById = Product.findById;
      Product.findById = jest.fn().mockImplementation(() => {
        throw new Error('Database error');
      });
      
      await request(app)
        .get(`/products/${testProduct._id}`)
        .expect(500);
      
      // Restore original function
      Product.findById = originalFindById;
    });
  });
  
  describe('updateById', () => {
    it('should update a product when vendor is the owner', async () => {
      const updateData = {
        title: 'Updated Product Title',
        price: 149.99
      };
      
      const vendorToken = Buffer.from(JSON.stringify({
        _id: testVendor._id,
        role: 'vendor',
        isApproved: true
      })).toString('base64');
      
      const response = await request(app)
        .patch(`/products/${testProduct._id}`)
        .set('Authorization', `Bearer ${vendorToken}`)
        .send(updateData)
        .expect(200);
      
      expect(response.body.title).toBe(updateData.title);
      expect(response.body.price).toBe(updateData.price);
    });
    
    it('should update a product when user is admin', async () => {
      const updateData = {
        title: 'Admin Updated Title',
        price: 199.99
      };
      
      const adminToken = Buffer.from(JSON.stringify({
        _id: testAdmin._id,
        role: 'admin',
        isAdmin: true
      })).toString('base64');
      
      const response = await request(app)
        .patch(`/products/${testProduct._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);
      
      expect(response.body.title).toBe(updateData.title);
      expect(response.body.price).toBe(updateData.price);
    });
    
    it('should return 403 when vendor is not the owner', async () => {
      // Create another vendor
      const anotherVendor = await createTestUser({ 
        role: 'vendor', 
        isApproved: true 
      });
      
      const updateData = {
        title: 'Unauthorized Update'
      };
      
      const vendorToken = Buffer.from(JSON.stringify({
        _id: anotherVendor._id,
        role: 'vendor',
        isApproved: true
      })).toString('base64');
      
      await request(app)
        .patch(`/products/${testProduct._id}`)
        .set('Authorization', `Bearer ${vendorToken}`)
        .send(updateData)
        .expect(403);
    });
    
    it('should return 404 when product does not exist', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const vendorToken = Buffer.from(JSON.stringify({
        _id: testVendor._id,
        role: 'vendor',
        isApproved: true
      })).toString('base64');
      
      await request(app)
        .patch(`/products/${nonExistentId}`)
        .set('Authorization', `Bearer ${vendorToken}`)
        .send({ title: 'Updated Title' })
        .expect(404);
    });
    
    it('should return 500 if an error occurs during product update', async () => {
      // Mock Product.findById to throw an error
      const originalFindById = Product.findById;
      Product.findById = jest.fn().mockImplementation(() => {
        throw new Error('Database error');
      });
      
      const vendorToken = Buffer.from(JSON.stringify({
        _id: testVendor._id,
        role: 'vendor',
        isApproved: true
      })).toString('base64');
      
      await request(app)
        .patch(`/products/${testProduct._id}`)
        .set('Authorization', `Bearer ${vendorToken}`)
        .send({ title: 'Error Update' })
        .expect(500);
      
      // Restore original function
      Product.findById = originalFindById;
    });
  });
  
  describe('deleteById', () => {
    it('should soft-delete a product (set isDeleted=true)', async () => {
      const vendorToken = Buffer.from(JSON.stringify({
        _id: testVendor._id,
        role: 'vendor',
        isApproved: true
      })).toString('base64');
      
      const response = await request(app)
        .delete(`/products/${testProduct._id}`)
        .set('Authorization', `Bearer ${vendorToken}`)
        .expect(200);
      
      expect(response.body.isDeleted).toBe(true);
    });
    
    it('should allow admin to delete any product', async () => {
      const adminToken = Buffer.from(JSON.stringify({
        _id: testAdmin._id,
        role: 'admin',
        isAdmin: true
      })).toString('base64');
      
      const response = await request(app)
        .delete(`/products/${testProduct._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      
      expect(response.body.isDeleted).toBe(true);
    });
    
    it('should return 403 when vendor is not the owner', async () => {
      // Create another vendor
      const anotherVendor = await createTestUser({ 
        role: 'vendor', 
        isApproved: true 
      });
      
      const vendorToken = Buffer.from(JSON.stringify({
        _id: anotherVendor._id,
        role: 'vendor',
        isApproved: true
      })).toString('base64');
      
      await request(app)
        .delete(`/products/${testProduct._id}`)
        .set('Authorization', `Bearer ${vendorToken}`)
        .expect(403);
    });
    
    it('should return 404 when product does not exist', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const vendorToken = Buffer.from(JSON.stringify({
        _id: testVendor._id,
        role: 'vendor',
        isApproved: true
      })).toString('base64');
      
      await request(app)
        .delete(`/products/${nonExistentId}`)
        .set('Authorization', `Bearer ${vendorToken}`)
        .expect(404);
    });
    
    it('should return 500 if an error occurs during product deletion', async () => {
      // Mock Product.findById to throw an error
      const originalFindById = Product.findById;
      Product.findById = jest.fn().mockImplementation(() => {
        throw new Error('Database error');
      });
      
      const vendorToken = Buffer.from(JSON.stringify({
        _id: testVendor._id,
        role: 'vendor',
        isApproved: true
      })).toString('base64');
      
      await request(app)
        .delete(`/products/${testProduct._id}`)
        .set('Authorization', `Bearer ${vendorToken}`)
        .expect(500);
      
      // Restore original function
      Product.findById = originalFindById;
    });
  });
  
  describe('undeleteById', () => {
    it('should restore a deleted product (set isDeleted=false)', async () => {
      // First delete the product
      testProduct.isDeleted = true;
      await testProduct.save();
      
      const vendorToken = Buffer.from(JSON.stringify({
        _id: testVendor._id,
        role: 'vendor',
        isApproved: true
      })).toString('base64');
      
      const response = await request(app)
        .patch(`/products/undelete/${testProduct._id}`)
        .set('Authorization', `Bearer ${vendorToken}`)
        .expect(200);
      
      expect(response.body.isDeleted).toBe(false);
    });
    
    it('should allow admin to restore any product', async () => {
      // First delete the product
      testProduct.isDeleted = true;
      await testProduct.save();
      
      const adminToken = Buffer.from(JSON.stringify({
        _id: testAdmin._id,
        role: 'admin',
        isAdmin: true
      })).toString('base64');
      
      const response = await request(app)
        .patch(`/products/undelete/${testProduct._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      
      expect(response.body.isDeleted).toBe(false);
    });
    
    it('should return 403 when vendor is not the owner', async () => {
      // Create another vendor
      const anotherVendor = await createTestUser({ 
        role: 'vendor', 
        isApproved: true 
      });
      
      const vendorToken = Buffer.from(JSON.stringify({
        _id: anotherVendor._id,
        role: 'vendor',
        isApproved: true
      })).toString('base64');
      
      await request(app)
        .patch(`/products/undelete/${testProduct._id}`)
        .set('Authorization', `Bearer ${vendorToken}`)
        .expect(403);
    });
    
    it('should return 404 when product does not exist', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const vendorToken = Buffer.from(JSON.stringify({
        _id: testVendor._id,
        role: 'vendor',
        isApproved: true
      })).toString('base64');
      
      await request(app)
        .patch(`/products/undelete/${nonExistentId}`)
        .set('Authorization', `Bearer ${vendorToken}`)
        .expect(404);
    });
    
    it('should return 500 if an error occurs during product restoration', async () => {
      // Mock Product.findById to throw an error
      const originalFindById = Product.findById;
      Product.findById = jest.fn().mockImplementation(() => {
        throw new Error('Database error');
      });
      
      const vendorToken = Buffer.from(JSON.stringify({
        _id: testVendor._id,
        role: 'vendor',
        isApproved: true
      })).toString('base64');
      
      await request(app)
        .patch(`/products/undelete/${testProduct._id}`)
        .set('Authorization', `Bearer ${vendorToken}`)
        .expect(500);
      
      // Restore original function
      Product.findById = originalFindById;
    });
  });
  
  describe('getVendorProducts', () => {
    it('should return only the vendor\'s products', async () => {
      // Create another vendor with products
      const anotherVendor = await createTestUser({ 
        role: 'vendor', 
        isApproved: true 
      });
      
      await createTestProduct({ title: 'Other Vendor Product' }, anotherVendor);
      
      // Create more products for the test vendor
      await createTestProduct({ title: 'Vendor Product 2' }, testVendor);
      await createTestProduct({ title: 'Vendor Product 3' }, testVendor);
      
      const vendorToken = Buffer.from(JSON.stringify({
        _id: testVendor._id,
        role: 'vendor',
        isApproved: true
      })).toString('base64');
      
      const response = await request(app)
        .get('/products/vendor/my-products')
        .set('Authorization', `Bearer ${vendorToken}`)
        .expect(200);
      
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(3); // Original + 2 new ones
      
      // All products should belong to the test vendor
      response.body.forEach(product => {
        expect(product.vendor.toString()).toBe(testVendor._id.toString());
      });
    });
    
    it('should return 403 when user is not a vendor', async () => {
      const customerToken = Buffer.from(JSON.stringify({
        _id: testCustomer._id,
        role: 'customer'
      })).toString('base64');
      
      await request(app)
        .get('/products/vendor/my-products')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(403);
    });
    
    it('should return 401 when not authenticated', async () => {
      await request(app)
        .get('/products/vendor/my-products')
        .expect(401);
    });
    
    it('should return 500 if an error occurs during vendor products retrieval', async () => {
      // Mock Product.find to throw an error
      const originalFind = Product.find;
      Product.find = jest.fn().mockImplementation(() => {
        throw new Error('Database error');
      });
      
      const vendorToken = Buffer.from(JSON.stringify({
        _id: testVendor._id,
        role: 'vendor',
        isApproved: true
      })).toString('base64');
      
      await request(app)
        .get('/products/vendor/my-products')
        .set('Authorization', `Bearer ${vendorToken}`)
        .expect(500);
      
      // Restore original function
      Product.find = originalFind;
    });
  });
});