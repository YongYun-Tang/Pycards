const express = require('express');
const router = express.Router();
const playerController = require("../controllers/playerController");
const checkSession = require("../middleware/verify_session"); 

// playerController
router.get("/", playerController.getPlayerUsername);                            // get player username
router.post("/answer", playerController.submitAnswer);                          // submit answer
router.get("/leaderboard", checkSession, playerController.loadLeaderboard);     // get leaderboard

module.exports = router;