const express = require('express');
const router = express.Router();
const adminController = require("../controllers/adminController");
const checkLoggedIn = require("../middleware/auth");

// adminController
router.post("/register", adminController.register);                             // admin register
router.post("/login", adminController.login);                                   // admin login
router.post("/logout", adminController.logout);                                 // admin logout
router.post("/resetPassword", checkLoggedIn, adminController.resetPassword);    // reset password
router.get("/adminUsername", adminController.getAdminUsername);                 // get admin username
router.get("/adminLastLogin", adminController.getAdminLastLogin);               // get admin last login
// previous store admin id and username in local storage
router.get("/dashboardData", checkLoggedIn, adminController.getDashboardData);  // use session to store admin id and username (more secure)                                   

module.exports = router;