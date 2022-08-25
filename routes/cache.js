const express = require("express");
const CacheEntryService = require("../services/cacheEntryService");
const { mapCacheEntriesObjectsToStrings } = require("../utils/functions");

const router = express.Router();

/*
* route for getting cached value by given cache key
* @pathparam - key - cache key
* @returns cache entry value in form of { value: <cache entry string value> }
* */
router.get("/:key", async function (req, res, next) {
  const { value } = await CacheEntryService.getCacheEntryByKey(req.params.key);
  res.json({ value });
});

/*
* route for getting all existing cache keys
* @returns cache entry values in form of { value: [ <cache entry string value 1>, <cache entry string value 2>, ... ] }
* */
router.get("/", async function (req, res, next) {
  const serviceCallResult = await CacheEntryService.getAllCacheEntries();
  const cacheKeys = mapCacheEntriesObjectsToStrings(serviceCallResult);
  res.json({ value: cacheKeys });
});

/*
* route for creating new or updating existing cache data
* @pathparam - key - cache key
* @bodyparam - { value: <cache string value> }
* @returns cache entry value in form of { value: <cache entry string value> }
* */
router.post("/:key", async function (req, res, next) {
  const serviceResultCall = await CacheEntryService.createOrUpdateCacheEntryForKey(req.params.key, req.body.value);
  res.json({ value: req.body.value });
});

/*
* route for deleting existing cache entry
* @pathparam - key - cache key
* @returns { ok: true }
* */
router.delete("/:key", async function (req, res, next) {
  const serviceCallResult = await CacheEntryService.deleteOneCacheEntry(req.params.key);
  res.json({ ok: !!serviceCallResult });
});

/*
* route for deleting existing cache entry
* @returns { ok: true }
* */
router.delete("/", async function (req, res, next) {
  const serviceCallResult = await CacheEntryService.deleteAllCacheEntries();
  res.json({ ok: !!serviceCallResult });
});

module.exports = router;
