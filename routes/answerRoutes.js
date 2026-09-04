const express = require('express');
const router = express.Router();
const answerController = require("../controllers/answerController");

router.post("/start", answerController.startAnswer);                    // player start answer
router.patch("/:answerId/expire", answerController.expireAnswer);       // expire answer

module.exports = router;