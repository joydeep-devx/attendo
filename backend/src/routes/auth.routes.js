const express = require("express");

const {
    register,
    registerFace,
    login,
    logout,
    me,
} = require("../controllers/auth.controller");

const authenticate = require(
    "../middleware/auth.middleware"
);

const router = express.Router();

router.post("/register", register);
router.post("/register-face", authenticate, registerFace);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", authenticate, me);

module.exports = router;