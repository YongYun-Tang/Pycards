const answerModel = require("../models/answerModel");
const playerModel = require("../models/playerModel");
const questionModel = require("../models/questionModel");
const sessionModel = require("../models/sessionModel");
const sessionQuestionModel = require("../models/sessionQuestionModel");

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

        const player = await playerModel.getPlayerById(playerId);

        if (!player) {
            return res.status(404).json({
                success: false,
                message: "Player not found"
            });
        }

        const session = await sessionModel.getSessionById(player.session_id);

        if (!session) {
            return res.status(404).json({
                success: false,
                message: "Session not found"
            });
        }

        const question = await questionModel.getQuestionById(questionId, session.admin_id);

        if (!question) {
            return res.status(404).json({
                success: false,
                message: "Question not found"
            });
        }

        console.log("Question:", question);

        const sessionQuestion =
            await sessionQuestionModel.getOrCreateSessionQuestion(
                player.session_id,
                question
            );

        console.log("Session Question:", sessionQuestion);

        const answer = await answerModel.startAnswer(
            player.player_id,
            question.question_id,
            sessionQuestion.session_question_id
        );

        console.log("Answer:", answer);

        return res.status(201).json({
            success: true,
            message: "Answer attempt started",
            answer
        });
    } catch (error) {     
        console.error("START ANSWER ERROR:", error);

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