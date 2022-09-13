const CacheEntryService = require("../src/services/cacheEntryService");
const CacheEntry = require("../src/models/cacheEntry");
const { setupMongooseConnection, teardownMongooseConnection, setupTestData } = require("./utils");

let cacheEntries = [];

describe("createOrUpdateCacheEntryForKey", () => {
  beforeEach(async () => {
    cacheEntries = await setupTestData();
  });

  beforeAll(async () => {
    await setupMongooseConnection();
  });

  afterAll(async () => {
    await teardownMongooseConnection();
  });

  test("it should not create new records", async () => {
    const oldTotalCount = await CacheEntry.countDocuments();
    await CacheEntryService.createOrUpdateCacheEntryForKey(cacheEntries[0].key, "new cache value");
    const newTotalCount = await CacheEntry.countDocuments();
    expect(oldTotalCount).toBe(newTotalCount);
  });

  test("it should create new record", async () => {
    const oldTotalCount = await CacheEntry.countDocuments();
    await CacheEntryService.createOrUpdateCacheEntryForKey("test key", "test value");
    const newTotalCount = await CacheEntry.countDocuments();
    expect(oldTotalCount + 1).toBe(newTotalCount);
  });

  test("it should update ttl", async () => {
    const oldTtl = cacheEntries[0].ttl;
    await CacheEntryService.createOrUpdateCacheEntryForKey(cacheEntries[0].key, "new cache value");
    const newTtl = await CacheEntry.countDocuments();
    expect(oldTtl).not.toBe(newTtl);
  });

  test("it should return correct record", async () => {
    const result = await CacheEntryService.createOrUpdateCacheEntryForKey(cacheEntries[0].key, "test value");
    expect("test value").toBe(result.value);
  });

  test("it should return correct record 2", async () => {
    const result = await CacheEntryService.createOrUpdateCacheEntryForKey("new value", "test value");
    expect("test value").toBe(result.value);
  });
});

describe("deleteAllCacheEntries", () => {
  beforeEach(async () => {
    await setupTestData();
  });

  beforeAll(async () => {
    await setupMongooseConnection();
  });

  afterAll(async () => {
    await teardownMongooseConnection();
  });

  test("it should delete all cache entries", async () => {
    await CacheEntryService.deleteAllCacheEntries();
    const newTotalCount = await CacheEntry.countDocuments();
    expect(newTotalCount).toBe(0);
  });
});

describe("deleteOldestCacheEntriesIfLimitIsReached", () => {
  beforeEach(async () => {
    await setupTestData();
  });

  beforeAll(async () => {
    await setupMongooseConnection();
  });

  afterAll(async () => {
    await teardownMongooseConnection();
  });

  test("it should not delete any records", async () => {
    const oldTotalCount = await CacheEntry.countDocuments();
    await CacheEntryService.deleteOldestCacheEntriesIfLimitIsReached();
    const newTotalCount = await CacheEntry.countDocuments();
    expect(oldTotalCount).toBe(newTotalCount);
  });

  test("it should delete 2 records", async () => {
    for (let i = 5; i < 8; i++) {
      const cacheEntry = new CacheEntry({
        key: `Key ${ i }`,
        value: `Value ${ i }`
      });
      await cacheEntry.save();
    }
    const oldTotalCount = await CacheEntry.countDocuments();
    await CacheEntryService.deleteOldestCacheEntriesIfLimitIsReached();
    await CacheEntryService.deleteOldestCacheEntriesIfLimitIsReached();
    const newTotalCount = await CacheEntry.countDocuments();
    expect(oldTotalCount - 2).toBe(newTotalCount);
  });
});

describe("deleteOneCacheEntry", () => {
  beforeEach(async () => {
    await setupTestData();
  });

  beforeAll(async () => {
    await setupMongooseConnection();
  });

  afterAll(async () => {
    await teardownMongooseConnection();
  });

  test("it should delete one record", async () => {
    const oldTotalCount = await CacheEntry.countDocuments();
    await CacheEntryService.deleteOneCacheEntry(cacheEntries[0].key);
    const newTotalCount = await CacheEntry.countDocuments();
    expect(oldTotalCount - 1).toBe(newTotalCount);
  });
});

// todo finish remaining tests