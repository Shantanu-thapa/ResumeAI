const express = require("express");

const { analyzeResume } = require("../controllers/aiController");
const protect = require("../middleware/authmiddleware");

const router = express.Router();

router.post(
    "/resumes/:id/analyze",
    protect,
    analyzeResume
);

module.exports = router;