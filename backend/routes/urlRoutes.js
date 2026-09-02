const express = require("express");

const {createShortUrl, redirectUrl} = require("../controllers/urlController");
const { models } = require("mongoose");

const router = express.Router();

router.post("/api/urls", createShortUrl);
router.get("/:code", redirectUrl);


module.exports = router;