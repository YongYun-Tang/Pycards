const sessionModel = require('../models/sessionModel');

const checkSession = async (req, res, next) => {
    try {
        // different HTTP method
        // PATCH for start/:code (startSession)
        // POST for join (joinSession)
        // GET for players (loadPlayers)
        const code = req.params.code ?? req.query.code ?? req.body?.code; // nullish coalescing operator (??) safer than || as it would not treat an empty string as missing

        if (!code) {
            return res.status(400).json({
                message: "Session code is required"
            });
        }

        const session = await sessionModel.getSessionCode(code);

        if (!session) {
            return res.status(404).json({
                message: "Session not found"
            });
        }

        req.validatedSession = session;

        console.log("Code received:", code);
        console.log("Session found:", session);

        next();

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

module.exports = checkSession;