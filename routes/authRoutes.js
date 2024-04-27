const express = require("express");
const router = express.Router();
const {
    verifyOtp,
    verifyLogin,
} = require("../controllers/authController");

router.route("/signup/verify").post(verifyOtp);
router.route("/signin/verify").post(verifyLogin);

module.exports = router;
