const express = require("express");
const { signup, login } = require("../controllers/auth");
const protect = require("../middleware/authmiddleware");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);

router.get("/profile", protect, (req, res) => {
    res.json({
        message: "You can access this protected route",
        userId: req.user
    });
});

module.exports = router;