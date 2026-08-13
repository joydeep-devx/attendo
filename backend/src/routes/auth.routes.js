const express = require("express");

const {
    register,
    login,
    logout,
    me,
} = require("../controllers/auth.controller");

const authenticate = require(
    "../middleware/auth.middleware"
);

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", authenticate, me);

module.exports = router;