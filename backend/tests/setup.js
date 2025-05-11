const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
require('dotenv').config();

let mongoServer;

// Setup before all tests
beforeAll(async () => {
  // Create an in-memory MongoDB server
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Connect to the in-memory database
  await mongoose.connect(mongoUri);
  
  console.log(`MongoDB successfully connected to ${mongoUri}`);
});

// Clean up after each test
afterEach(async () => {
  // Clear all collections after each test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// Clean up after all tests
afterAll(async () => {
  // Disconnect from the database
  await mongoose.disconnect();
  
  // Stop the MongoDB server
  await mongoServer.stop();
  
  console.log('MongoDB connection closed');
});

// Global test timeout
jest.setTimeout(30000);