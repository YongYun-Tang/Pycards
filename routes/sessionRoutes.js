const express = require('express');
const router = express.Router();
const sessionController = require("../controllers/sessionController");
const checkLoggedIn = require('../middleware/auth');
const checkSession = require('../middleware/verify_session');

// sessionController
router.post("/", checkLoggedIn, sessionController.createSession);                                               // create session
router.post("/join", checkSession, sessionController.joinSession);                                              // join session
router.get("/players", checkSession, sessionController.loadAllPlayers);                                         // load players
router.patch("/start/:code", checkLoggedIn, checkSession, sessionController.startSession);                      // update status
router.get("/status", checkSession, sessionController.getSessionStatus);                                        // get session status
router.patch("/end/:code", checkLoggedIn, checkSession, sessionController.endSession);                          // update status
router.get("/leaderboard/status", checkSession, sessionController.loadPlayersAnswerStatus);                     // get answer status
router.get("/history", checkLoggedIn, sessionController.getSessionHistory);                                     // get session history
router.get("/history/:sessionId", checkLoggedIn, sessionController.getSessionHistoryDetail);                    // get session history detail
router.get("/history/:sessionId/player/:playerId", checkLoggedIn, sessionController.getPlayerHistoryDetail);    // get player history detail
router.delete("/history/:sessionId", checkLoggedIn, sessionController.deleteSessionHistory);                    // delete session history

module.exports = router;

