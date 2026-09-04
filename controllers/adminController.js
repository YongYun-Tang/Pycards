const adminModel = require("../models/adminModel");
const { getDefaultQuestions } = require("../utils/questionCloner");

exports.register = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const result = await adminModel.register(username, password);

        const newAdminId = result.insertId;

        if (newAdminId) {
            const defaultQuestions = getDefaultQuestions();

            const questionWithAdminId = defaultQuestions.map(question => ({
                admin_id:       newAdminId,
                qr_code:        question.qr_code,
                question:       question.question,
                option_A:       question.option_A,
                option_B:       question.option_B,
                option_C:       question.option_C,
                option_D:       question.option_D,
                correct_answer: question.correct_answer,
                levels:         question.levels,
            }));

            await adminModel.initializeDefaultQuestions(questionWithAdminId);
        }

        return res.json({
            message: "Registration successfully",
            result
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: error.message
        });
    }
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        const result = await adminModel.login(username, password);

        if (!result) {
            return res.status(401).json({
                message: "Invalid username or password"
            });
        }

        req.session.loggedin = true;
        req.session.adminId = result.admin_id;
        req.session.username = result.username;

        // Force the server to finalize saving the session before responding
        req.session.save((error) => {
            if (error) {
                console.error("Session save error: ", error);
                return res.statu(500).json({
                    message: "Failed to save session"
                });
            }

            // Only send the JSON response after the session is locked in memory
            return res.json({
                message: "Login successfully",
                success: true, // Explicit flag to help frontend verify success easily
                admin_id: result.admin_id
            });
        });

    } catch (error) {
        return res.status(500).json({
            error: error.message
        });
    }
};

exports.logout = async (req, res) => {
    try {
        const adminId = req.session.adminId;

        if (!adminId) {
            return res.status(400).json({
                message: "No Admin ID provided"
            })
        }

        const result = await adminModel.logout(adminId);

        if (!result) {
            return res.status(400).json({
                message: "Admin ID does not exist"
            });
        }
        
        req.session.destroy((error) => {
            if (error) {
                return res.status(500).json({
                    success: false,
                    message: "Logout failed"
                });
            }

            return res.json({
                success: true,
                message: "Logout successfully",
                result
            });
        });
    } catch (error) {
        return res.status(500).json({
            error: error.message
        });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const adminId = req.session.adminId;
        const { newPassword } = req.body;

        if (!adminId) {
            return res.status(401).json({
                 error: "Admin not logged in"
            });
        }

        const result = await adminModel.resetPassword(adminId, newPassword);

        res.json({
            message: "Reset password successful",
            result
        })
    } catch (error) {
        return res.status(500).json({
            error: error.message
        });
    }
};

exports.getAdminUsername = async (req, res) => {
    try {
        const adminId = req.session.adminId;

        if (!adminId) {
            return res.status(401).json({
                error: "Admin not logged in"
            });
        }

        const adminUsername = await adminModel.getAdminUsernameById(adminId);

        res.json({
            username: adminUsername ? adminUsername.username : null
        });
    } catch (error) {
        return res.status(500).json({
            error: error.message
        });
    }
};

exports.getAdminLastLogin = async (req, res) => {
    try {
        const adminId = req.session.adminId;

        if (!adminId) {
            return res.status(401).json({
                error: "Admin not logged in"
            });
        }

        const adminLastLogin = await adminModel.getAdminLastLoginById(adminId);

        res.json({
            last_login: adminLastLogin ? adminLastLogin.last_login : null
        });
    } catch (error) {
        return res.status(500).json({
            error: error.message
        });
    }
};

exports.getDashboardData = async (req, res) => {
    try {
        const adminId = req.session.adminId;
        const username = req.session.username;

        return res.json({
            success: true,
            message: "Dashboard data retrieved successfully",
            admin: {
                adminId: adminId,
                username: username
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};