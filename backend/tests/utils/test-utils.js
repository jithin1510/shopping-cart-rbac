const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');

/**
 * Create a test user with specified role
 * @param {Object} userData - User data overrides
 * @returns {Object} Created user document
 */
const createTestUser = async (userData = {}) => {
  const defaultData = {
    name: 'Test User',
    email: `test${Date.now()}@example.com`,
    password: await bcrypt.hash('Password123', 10),
    isVerified: true,
    role: 'customer',
    isApproved: true
  };

  const mergedData = { ...defaultData, ...userData };
  
  // If role is vendor and isApproved is not explicitly set, default to false
  if (mergedData.role === 'vendor' && userData.isApproved === undefined) {
    mergedData.isApproved = false;
  }
  
  // If role is admin, set isAdmin to true
  if (mergedData.role === 'admin') {
    mergedData.isAdmin = true;
  }

  const user = new User(mergedData);
  await user.save();
  return user;
};

/**
 * Generate a JWT token for a user
 * @param {Object} user - User object
 * @returns {String} JWT token
 */
const generateTestToken = (user) => {
  const payload = {
    _id: user._id,
    email: user.email,
    name: user.name,
    isVerified: user.isVerified,
    isAdmin: user.isAdmin,
    role: user.role,
    isApproved: user.isApproved
  };
  
  return jwt.sign(payload, process.env.SECRET_KEY || 'test-secret-key', {
    expiresIn: '1h'
  });
};

/**
 * Create a test product
 * @param {Object} productData - Product data overrides
 * @param {Object} vendor - Vendor user object
 * @returns {Object} Created product document
 */
const createTestProduct = async (productData = {}, vendor) => {
  const Product = require('../../models/Product');
  const Category = require('../../models/Category');
  const Brand = require('../../models/Brand');
  
  // Create test category if not provided
  let category = productData.category;
  if (!category) {
    const Category = require('../../models/Category');
    const testCategory = new Category({ name: 'Test Category' });
    await testCategory.save();
    category = testCategory._id;
  }
  
  // Create test brand if not provided
  let brand = productData.brand;
  if (!brand) {
    const Brand = require('../../models/Brand');
    const testBrand = new Brand({ name: 'Test Brand' });
    await testBrand.save();
    brand = testBrand._id;
  }
  
  // Create test vendor if not provided
  let vendorId = productData.vendor;
  if (!vendorId) {
    if (vendor) {
      vendorId = vendor._id;
    } else {
      const testVendor = await createTestUser({ 
        role: 'vendor', 
        isApproved: true 
      });
      vendorId = testVendor._id;
    }
  }
  
  const defaultData = {
    title: 'Test Product',
    description: 'This is a test product',
    price: 99.99,
    discountPercentage: 10,
    category,
    brand,
    stockQuantity: 100,
    thumbnail: 'https://example.com/thumbnail.jpg',
    images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
    vendor: vendorId
  };
  
  const mergedData = { ...defaultData, ...productData };
  const product = new Product(mergedData);
  await product.save();
  return product;
};

module.exports = {
  createTestUser,
  generateTestToken,
  createTestProduct
};