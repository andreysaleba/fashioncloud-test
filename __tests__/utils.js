const mongoose = require("mongoose");
const CacheEntry = require("../src/models/cacheEntry");
const dotenv = require("dotenv");

dotenv.config({ path: ".env.test" });

function setupMongooseConnection () {
  return mongoose.connect(process.env.MONGODB_URL_STRING);
}

function teardownMongooseConnection () {
  return mongoose.disconnect();
}

async function setupTestData () {
  await CacheEntry.deleteMany();
  const cacheEntries = [];

  for (let i = 0; i < 4; i++) {
    const cacheEntry = new CacheEntry({
      key: `Key ${ i }`,
      value: `Value ${ i }`
    });
    await cacheEntry.save();
    cacheEntries.push(cacheEntry);
  }

  return cacheEntries;
}

module.exports = { setupTestData, setupMongooseConnection, teardownMongooseConnection };