function isDevelopmentEnvironment () {
  return process.env.NODE_ENV === "development";
}

module.exports = { isDevelopmentEnvironment };