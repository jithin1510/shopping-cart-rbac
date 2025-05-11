const mongoose = require('mongoose');
const Product = require('../../models/Product');
const User = require('../../models/User');
const Category = require('../../models/Category');
const Brand = require('../../models/Brand');
const { createTestUser } = require('../utils/test-utils');

describe('Product Model Tests', () => {
  let testVendor, testCategory, testBrand;
  
  beforeEach(async () => {
    // Create test vendor
    testVendor = await createTestUser({ 
      role: 'vendor', 
      isApproved: true 
    });
    
    // Create test category
    testCategory = new Category({ name: 'Test Category' });
    await testCategory.save();
    
    // Create test brand
    testBrand = new Brand({ name: 'Test Brand' });
    await testBrand.save();
  });
  
  describe('Field validations', () => {
    it('should create a valid product with all required fields', async () => {
      const productData = {
        title: 'Test Product',
        description: 'This is a test product',
        price: 99.99,
        category: testCategory._id,
        brand: testBrand._id,
        stockQuantity: 100,
        thumbnail: 'https://example.com/thumbnail.jpg',
        images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
        vendor: testVendor._id
      };
      
      const product = new Product(productData);
      const savedProduct = await product.save();
      
      expect(savedProduct._id).toBeDefined();
      expect(savedProduct.title).toBe(productData.title);
      expect(savedProduct.description).toBe(productData.description);
      expect(savedProduct.price).toBe(productData.price);
      expect(savedProduct.category.toString()).toBe(testCategory._id.toString());
      expect(savedProduct.brand.toString()).toBe(testBrand._id.toString());
      expect(savedProduct.stockQuantity).toBe(productData.stockQuantity);
      expect(savedProduct.thumbnail).toBe(productData.thumbnail);
      expect(savedProduct.images).toEqual(productData.images);
      expect(savedProduct.vendor.toString()).toBe(testVendor._id.toString());
      expect(savedProduct.isDeleted).toBe(false); // Default value
      expect(savedProduct.discountPercentage).toBe(0); // Default value
    });
    
    it('should fail when required fields are missing', async () => {
      // Missing title
      const productWithoutTitle = new Product({
        description: 'This is a test product',
        price: 99.99,
        category: testCategory._id,
        brand: testBrand._id,
        stockQuantity: 100,
        thumbnail: 'https://example.com/thumbnail.jpg',
        images: ['https://example.com/image1.jpg'],
        vendor: testVendor._id
      });
      
      // Missing vendor
      const productWithoutVendor = new Product({
        title: 'Test Product',
        description: 'This is a test product',
        price: 99.99,
        category: testCategory._id,
        brand: testBrand._id,
        stockQuantity: 100,
        thumbnail: 'https://example.com/thumbnail.jpg',
        images: ['https://example.com/image1.jpg']
      });
      
      await expect(productWithoutTitle.save()).rejects.toThrow();
      await expect(productWithoutVendor.save()).rejects.toThrow();
    });
    
    it('should set default values correctly', async () => {
      const productData = {
        title: 'Test Product',
        description: 'This is a test product',
        price: 99.99,
        category: testCategory._id,
        brand: testBrand._id,
        stockQuantity: 100,
        thumbnail: 'https://example.com/thumbnail.jpg',
        images: ['https://example.com/image1.jpg'],
        vendor: testVendor._id
      };
      
      const product = new Product(productData);
      const savedProduct = await product.save();
      
      expect(savedProduct.discountPercentage).toBe(0);
      expect(savedProduct.isDeleted).toBe(false);
    });
  });
  
  describe('Timestamps', () => {
    it('should add createdAt and updatedAt timestamps', async () => {
      const productData = {
        title: 'Test Product',
        description: 'This is a test product',
        price: 99.99,
        category: testCategory._id,
        brand: testBrand._id,
        stockQuantity: 100,
        thumbnail: 'https://example.com/thumbnail.jpg',
        images: ['https://example.com/image1.jpg'],
        vendor: testVendor._id
      };
      
      const product = new Product(productData);
      const savedProduct = await product.save();
      
      expect(savedProduct.createdAt).toBeDefined();
      expect(savedProduct.updatedAt).toBeDefined();
    });
    
    it('should update the updatedAt timestamp on changes', async () => {
      const productData = {
        title: 'Test Product',
        description: 'This is a test product',
        price: 99.99,
        category: testCategory._id,
        brand: testBrand._id,
        stockQuantity: 100,
        thumbnail: 'https://example.com/thumbnail.jpg',
        images: ['https://example.com/image1.jpg'],
        vendor: testVendor._id
      };
      
      const product = new Product(productData);
      const savedProduct = await product.save();
      
      const originalUpdatedAt = savedProduct.updatedAt;
      
      // Wait a moment to ensure timestamp will be different
      await new Promise(resolve => setTimeout(resolve, 100));
      
      savedProduct.price = 89.99;
      const updatedProduct = await savedProduct.save();
      
      expect(updatedProduct.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });
});