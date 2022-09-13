const mongoose = require("mongoose");

// Default cache expiration value in millis
const DEFAULT_CACHE_EXPIRATION_VALUE = 500;
/*
*  Cache entry object containing 3 value fields:
*  1. Key - cache key string.
*  2. Value - cache value.
*  3. Ttl - current date in millis added default cache expiration value gap, reflecting validity state of cache entry.
*  Method resetTtl - resets ttl value so cache become valid again.
*/
const cacheEntrySchema = new mongoose.Schema({
  key: {
    type: "string",
    unique: true,
    required: true
  },
  value: {
    type: "string",
    required: true
  },
  ttl: {
    type: "number",
    default: function () {
      return Date.now() + DEFAULT_CACHE_EXPIRATION_VALUE;
    }
  },
}, {
  timestamps: true,
  methods: {
    resetTtl: function () {
      console.info("Resetting ttl for cache key", this.key);
      this.ttl = Date.now() + DEFAULT_CACHE_EXPIRATION_VALUE;
      return this.save();
    }
  }
});

cacheEntrySchema
  .virtual("valid")
  .get(function () {
    return this.ttl > Date.now();
  });

const CacheEntry = mongoose.model("CacheEntry", cacheEntrySchema);

module.exports = CacheEntry;

