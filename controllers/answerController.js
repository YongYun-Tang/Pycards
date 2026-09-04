const answerModel = require("../models/answerModel");

exports.startAnswer = async (req, res) => {
    try {
        const playerId = req.session.playerId;
        const { questionId } = req.body;

        if (!playerId) {
            return res.status(401).json({
                success: false,
                message: "Player session not found"
            });
        }

        if (!questionId) {
            return res.status(400).json({
                success: false,
                message: "Question ID is required"
            });
        }

        const answer = await answerModel.startAnswer(playerId, questionId);

        return res.status(201).json({
            success: true,
            message: "Answer attempt started",
            answer: answer
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

exports.expireAnswer = async (req, res) => {
    try {
        const playerId = req.session.playerId;
        const { answerId } = req.params;

        if (!playerId) {
            return res.status(401).json({
                success: false,
                message: "Player session not found"
            });
        }

        const result = await answerModel.expireAnswer(answerId, playerId);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Active answer attempt not found"
            });
        }

        return res.json({
            success: true,
            message: "Answer attempt expired"
        });
    } catch (error) {
        console.error("Expire answer error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to expire answer"
        });
    }
};