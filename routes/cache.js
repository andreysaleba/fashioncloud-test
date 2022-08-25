var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/:key", function (req, res, next) {
  res.json({ title: "Express 1" });
});

router.get("/", function (req, res, next) {
  res.json({ title: "Express 2" });
});

router.post("/:key", function (req, res, next) {
  res.json({ title: "Express 2" });
});

router.delete("/:key", function (req, res, next) {
  res.json({ title: "Express 2" });
});

router.delete("/", function (req, res, next) {
  res.json({ title: "Express 2" });
});

module.exports = router;
