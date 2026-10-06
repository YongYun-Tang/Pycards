const questionModel = require("../models/questionModel");

exports.getQuestionByAdminId = async (req, res) => {
    try {
        const adminId = req.session.adminId;

        if (!adminId) {
            return res.status(401).json({
                 message: "Please log in"
            });
        }

        const results = await questionModel.getQuestionByAdminId(adminId);

        res.json({
            results
        })
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

exports.getQuestionById = async (req, res) => {
    try {
        const { questionId } = req.params;
        const adminId = req.session.adminId;

        if (!adminId) {
            return res.status(401).json({
                message: "Please log in"
            });
        }
        
        const question = await questionModel.getQuestionById(questionId, adminId);

        res.json({
            question
        });
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

exports.updateQuestion = async (req, res) => {
    try {
        const { questionId } = req.params;
        const adminId = req.session.adminId;
        const updates = {
            question:       req.body.question,
            option_A:       req.body.option_A,
            option_B:       req.body.option_B,
            option_C:       req.body.option_C,
            option_D:       req.body.option_D,
            correct_answer: req.body.correct_answer,
            levels:         req.body.levels
        };

        // Helpful debugging logs
        console.log("Updating Question ID:", questionId);
        console.log("Logged-in Admin ID:", adminId);
        console.log("Payload fields:", updates);

        if (!adminId) {
            return res.status(401).json({
                message: "Please log in again"
            });
        }

        const results = await questionModel.updateQuestion(questionId, adminId, updates);

        if (results.affectedRows === 0) {
            return res.status(404).json({
                message: "Question not found"
            });
        }

        res.json({
            message: "Question updated successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

exports.getQuestionByQR = async (req, res) => {
    try {
        const adminId = req.validatedSession.admin_id;
        const { qrCode } = req.params;

        const question = await questionModel.getQuestionByQR(adminId, qrCode);

        if (!question) {
            return res.status(404).json({
                message: "Question not found"
            });
        }

        res.json({
            question: question
        });
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};