// test/setup.js
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

// Before all tests - setup in-memory MongoDB
beforeAll(async () => {
  try {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Test database connected');
  } catch (error) {
    console.error('❌ Test database connection failed:', error);
    throw error;
  }
});

// After all tests - cleanup
afterAll(async () => {
  try {
    await mongoose.disconnect();
    await mongoServer.stop();
    console.log('✅ Test database disconnected');
  } catch (error) {
    console.error('❌ Test database cleanup failed:', error);
  }
});

// After each test - clear all collections
afterEach(async () => {
  try {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  } catch (error) {
    console.error('❌ Test data cleanup failed:', error);
  }
});

// Suppress console.log in tests (optional)
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
// };