const CacheEntry = require("../models/cacheEntry");
const { randomString } = require("../utils/helperFunctions");

// Maximum limit of cached objects
const CACHED_OBJECTS_LIMIT = 5;

/**
 * Class containing static methods for interacting with stored cache entries
 * */
class CacheEntryService {
  /**
   *
   * @param {string} key - Cache key
   * @param {string} value - Cache value
   * @returns {Promise<CacheEntry>>} Created or updated cached entry
   *
   * 1. It fetches cache entry with the given key.
   * 2. In case cache entry with the given key not existed it creates a new cache entry.
   * 3. If in the previous step new cache entry was created, calls method to remove oldest cache entries.
   * 4. Resets ttl to default value.
   */
  static async createOrUpdateCacheEntryForKey (key, value) {
    console.info("Upserting cache entry with the key", key, "and value", value);
    const result = await CacheEntry
      .updateOne({ key }, { key, value }, { upsert: true })
      .exec();
    if (result.upsertedCount > 0) {
      console.info("Did not found cache entry with the key", key);
      await this.deleteOldestCacheEntriesIfLimitIsReached();
    }
    const cacheEntry = await CacheEntry.findOne({ key }).exec();
    await cacheEntry.resetTtl();
    return cacheEntry;
  }

  /**
   * @returns {Promise<DeleteResult>} Returns promise with the delete result
   *
   * Deletes all existing cache entries
   * */
  static deleteAllCacheEntries () {
    console.info("Deleting all cache entries");
    return CacheEntry.deleteMany().exec();
  }

  /**
   *
   * @return {Promise<DeleteResult>} Returns promise with the delete result
   *
   * Deletes oldest cache entries in case total number of cache entries is bigger than the limit
   *
   * 1. Getting total count of cache entries.
   * 2. Checkinf if total count lower than the maximum limit of cache entries.
   * 3. Finding cache entries with the oldest ttl values (they are least needed cos their access date is oldest).
   * 4. Remove cache entries.
   */
  static async deleteOldestCacheEntriesIfLimitIsReached () {
    console.info("Deleting oldest cache entries if limit is reached");
    const totalCount = await CacheEntry.countDocuments();
    console.info("Document count is", totalCount);
    if (totalCount > CACHED_OBJECTS_LIMIT) {
      const amountToDelete = totalCount - CACHED_OBJECTS_LIMIT;
      console.info("Deleting", amountToDelete, "documents");
      const cacheEntriesToDelete = await CacheEntry.find().sort({ ttl: 1 }).limit(amountToDelete).exec();
      const idsToDelete = cacheEntriesToDelete.map(cacheEntry => cacheEntry._id);
      return CacheEntry.deleteMany({ _id: idsToDelete }).exec();
    }
  }

  /**
   *
   * @param {string} key - Cache key
   * @returns {Promise<DeleteResult>} Returns promise with the delete result
   *
   * Deletes one cache entry with the given key
   *
   * todo should return 404 from router in case cache entry is missing
   * */
  static deleteOneCacheEntry (key) {
    console.info("Deleting one cache entry with the key", key);
    return CacheEntry.deleteOne({ key }).exec();
  }

  /**
   *
   * @param {string} key - Cache key
   * @return {Promise<CacheEntry>} Returns promise with the found cache entry
   *
   * Returns cache entry with the given key
   * 1. Finds cache entry with the given key.
   * 2. If cache entry is found.
   *    a. Checks if cache entry is still valid, if yes then resets ttl and return the found cache entry.
   *    b. If not, then repopulate cache entry with the new random value and return it.
   * 3. If cache entry is not found.
   *    a. Creates new cache entry with random value and returns it.
   *    b. Calls method to delete oldest cache entries if limit is reached.
   */
  static async getCacheEntryByKey (key) {
    const cacheEntryInStorage = await CacheEntry.findOne({ key }).exec();
    if (cacheEntryInStorage) {
      console.info("Cache hit for key", key, cacheEntryInStorage);
      if (cacheEntryInStorage.valid) {
        console.info("Valid cache for the key", key, "found");
        await cacheEntryInStorage.resetTtl();
        return cacheEntryInStorage;
      } else {
        console.info("Invalid cache for the key", key, "found");
        const updatedCacheEntries = await this.regenerateCacheEntriesIfExpired(cacheEntryInStorage);
        return updatedCacheEntries[0];
      }

    } else {
      console.info("Cache miss for key", key);

      const newCacheValue = randomString();
      const newCacheEntry = new CacheEntry({
        key, value: newCacheValue
      });

      const result = await newCacheEntry.save();

      await this.deleteOldestCacheEntriesIfLimitIsReached();
      return result;
    }
  }

  /**
   *
   * @return {Promise<CacheEntry[]>}
   *
   * Returns all existing cache entries
   */
  static async getAllCacheEntries () {
    console.info("Getting all cache entries");
    const allCacheEntries = await CacheEntry.find().exec();
    return this.regenerateCacheEntriesIfExpired(allCacheEntries);
  }

  /**
   *
   * @param {CacheEntry | CacheEntry[]} cacheEntriesOrOneEntry - Cache entries or single cache entry
   * @return {Promise<CacheEntry[]>} Returns promise with the updated cache entries
   *
   * Calls regenerateManyCacheEntriesIfNeeeded and wraps single cache entry parameter into array
   */
  static regenerateCacheEntriesIfExpired (cacheEntriesOrOneEntry) {
    console.info("Regenerating cache entries if needed");
    let cacheEntries = cacheEntriesOrOneEntry;
    if (!Array.isArray(cacheEntriesOrOneEntry)) {
      cacheEntries = [ cacheEntries ];
    }

    return this.regenerateManyCacheEntriesIfNeeeded(cacheEntries);
  }

  /**
   *
   * @param {CacheEntry[]} cacheEntries - Cache entries
   * @return {Promise<CacheEntry[]>>} Returns promise with the updated cache entries
   *
   * Regenerates cache entries values if they are expired
   * 1. Splits given cache entries array into two array: one with the valid cache entries, another one - with the invalid ones.
   * 2. For invalid cache entries regenerates new random values and resets ttl.
   * 3. For valid ones just resets ttl.
   */
  static async regenerateManyCacheEntriesIfNeeeded (cacheEntries) {
    const validCacheEntries = [];
    const invalidCacheEntries = [];
    cacheEntries.forEach(cacheEntry => cacheEntry.valid
      ? validCacheEntries.push(cacheEntry) : invalidCacheEntries.push(cacheEntry));
    console.info("Found valid cache entries", validCacheEntries, "and invalid cache entries", invalidCacheEntries);

    const invalidResult = await Promise.all(
      invalidCacheEntries.map(cacheEntry => {
        cacheEntry.value = randomString();
        return cacheEntry.resetTtl();
      }));

    const validResult = await Promise.all(
      validCacheEntries.map(cacheEntry => cacheEntry.resetTtl())
    );
    return [ ...invalidResult, ...validResult ];
  }
}

module.exports = CacheEntryService;