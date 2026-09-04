const checkLoggedIn = (req, res, next) => {
    if (req.session?.adminId) {
        return next();
    }

    return res.status(401).json({
        success: false,
        message: "Unauthorized: Please log in"
    });
};

module.exports = checkLoggedIn;

