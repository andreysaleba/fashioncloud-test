/**
 *
 * @param {number} length - Length with the 32 as default value
 * @return {string} Returns random alphanumeric string
 *
 * thanks to https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
 */
function randomString (length = 32) {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

/**
 *
 * @param {CacheEntry[]} cacheEntries - Cache entries
 * @return {String[]} Returns keys for given cache entries
 */
function mapCacheEntriesObjectsToStrings (cacheEntries) {
  return cacheEntries.map(cacheEntry => cacheEntry.key);
}

module.exports = { mapCacheEntriesObjectsToStrings, randomString };