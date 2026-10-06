const playerModel = require("../models/playerModel");

exports.getPlayerUsername = async (req, res) => {
    try {
        const playerId = req.session.playerId;

        if (!playerId) {
            return res.status(400).json({
                message: "Player not registered"
            });
        }

        const results = await playerModel.getPlayerUsername(playerId);

        res.json({
            results: results
        });
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

exports.submitAnswer = async (req, res) => {
    try {
        const playerId = req.session.playerId;
        const gameSessionId = req.session.gameSessionId;
        const { questionId, selectedAnswer, remainingTime } = req.body;

        if (!playerId || !gameSessionId) {
            return res.status(401).json({
                message: "You have not joined a game session"
            });
        }

        const results = await playerModel.submitAnswer(playerId, questionId, selectedAnswer, Number(remainingTime));

        res.json(results);
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

exports.loadLeaderboard = async (req, res) => {
    try {
        const sessionId = req.validatedSession.session_id;

        const players = await playerModel.getLeaderboard(sessionId);

        let previousScore = null;
        let previousRank = 0;

        const rankedPlayers = players.map((player, index) => {
            let rank;

            if (player.score === previousScore) {
                rank = previousRank;
            } else {
                rank = index + 1;
            }

            previousScore = player.score;
            previousRank = rank;

            return {...player, rank};
        });

        res.json({
            players: rankedPlayers
        })
    } catch (error) {
        res.status(500).json({
            error: error.message
        })
    }
};