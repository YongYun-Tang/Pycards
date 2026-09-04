const express = require('express');
const router = express.Router();
const questionController = require("../controllers/questionController");
const checkLoggedIn = require("../middleware/auth");
const checkSession = require('../middleware/verify_session');

// questionController
router.get("/", questionController.getQuestionByAdminId);                       // get question by admin id
router.get("/:questionId", questionController.getQuestionById);                 // get question by question id
router.patch("/:questionId", checkLoggedIn, questionController.updateQuestion); // update question
router.get("/scan/:qrCode", checkSession, questionController.getQuestionByQR);  // get question by QR

module.exports = router;