const sessionModel = require("../models/sessionModel");
const playerModel = require("../models/playerModel");
const answerModel = require("../models/answerModel");

exports.createSession = async (req, res) => {
    try {
        const adminId = req.session.adminId;

        if (!adminId) {
            return res.status(400).json({
                message: "Admin ID does not exist"
            })
        }
        
        const session = await sessionModel.createSession(adminId);

        // 201 = resource created
        res.status(201).json({
            message: "Session created successfully",
            session
        })
    } catch (error) {
        res.status(500).json({
            error: error.message
        })
    }
};

exports.joinSession = async (req, res) => {
    try {
        const { username } = req.body;
        const sessionId = req.validatedSession.session_id;
        const sessionStatus = req.validatedSession.status;

        if (sessionStatus !== "waiting") {
            return res.status(403).json({
                message: sessionStatus === "active" ? "The session has already started" : "The session has ended"
            })
        }

        if (req.session.playerId && req.session.gameSessionId === sessionId) {
             return res.status(409).json({
                message: "You have already joined this session"
            });
        }

        const duplicateUsername = await playerModel.checkUsername(username, sessionId)

        if (duplicateUsername) {
            return res.status(400).json({
                message: "Username has taken"
            });
        }

        const player = await playerModel.addPlayer(username, sessionId);

        req.session.playerId = player.player_id;
        req.session.username = username;
        req.session.gameSessionId = sessionId;

        req.session.save((error) => {
            if (error) {
                console.error("Session save error:", error);
                return res.status(500).json({
                    message: "Failed to save session"
                });
            }

            console.log("Saved player session:", {
                playerId: req.session.playerId,
                username: req.session.username,
                gameSessionId: req.session.gameSessionId
            });

            res.json({
                message: "Joined session successfully",
                player,
                session: {
                    session_id: sessionId,
                    code: req.validatedSession.code
                }
            });
        });

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

exports.loadAllPlayers = async (req, res) => {
    try {
        console.log("Validated session: ", req.validatedSession);

        const sessionId = req.validatedSession.session_id;
        console.log("Session ID: ", sessionId);

        const players = await playerModel.getPlayersBySessionId(sessionId);

        console.log("Data: ", players);

        res.json({ players });

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

exports.startSession = async (req, res) => {
    try {
        const sessionId = req.validatedSession.session_id;

        const playerCountResult = await playerModel.countPlayers(sessionId);

        const playerCount = Number(playerCountResult.player_count);

        console.log("Player count: ", playerCount);

        if (playerCount < 2) {
            return res.status(400).json({
                message: "At least 2 players are required to start the session"
            });
        }

        await sessionModel.updateSessionStatus(sessionId, "active");

        res.json({
            message: "Session started successfully"
        });

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

exports.getSessionStatus = async (req, res) => {
    try {
        const session = req.validatedSession;

        res.json({
            status: session.status
        });

    } catch (error) {
        res.status(500).json({
            error: error.message
        })
    }
}

exports.endSession = async (req, res) => {
    try {
        const sessionId = req.validatedSession.session_id;

        const activeAnswerCountResult = await answerModel.countActiveAnswers(sessionId);

        const activeAnswerCount = Number(activeAnswerCountResult.active_count);

        console.log("Active answers: ", activeAnswerCount);

        if (activeAnswerCount > 0) {
            return res.status(409).json({
                success: false,
                message: `${activeAnswerCount} player${activeAnswerCount === 1 ? " is" : "s are"} answering`
            });
        }

        await sessionModel.updateSessionStatus(sessionId, "ended");

        res.json({
            success: true,
            message: "Session ended successfully"
        });

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

exports.loadPlayersAnswerStatus = async (req, res) => {
    try {
        const sessionId = req.validatedSession.session_id;

        const players = await playerModel.getPlayersAnswerStatus(sessionId);

        return res.json({
            players
        });
    } catch (error) {
        return res.status(500).json({
            error: error.message
        });
    }
};