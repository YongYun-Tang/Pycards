const express = require("express");
const session = require('express-session');
const path = require("path");
const sessionRoutes = require("./routes/sessionRoutes");
const playerRoutes = require("./routes/playerRoutes");
const questionRoutes = require("./routes/questionRoutes");
const adminRoutes = require("./routes/adminRoutes");
const answerRoutes = require("./routes/answerRoutes");

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(session({
    secret: 'pycards',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true if using HTTPS
        maxAge: 100 * 60 * 60 * 24 // 24 hours
    }
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

app.use("/api/session", sessionRoutes);
app.use("/api/player", playerRoutes);
app.use("/api/question", questionRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/answer", answerRoutes);

app.get("/admin_registration", (req, res) => {
    res.render("admin/admin_registration");
});

app.get("/admin_login", (req, res) => {
    res.render("admin/admin_login");
});

app.get("/admin_dashboard", (req, res) => {
    // Explicity tell the browser: DO NOT CACHE THIS PAGE
    res.setHeader('Cache-Control', 'no-store, no-cache, must revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    res.render("admin/admin_dashboard");
});

app.post('/api/admin/logout', (req, res) => {
    req.session.destroy((error) => {
        if (error) {
            return res.status(500).json({
                success: false,
                message: "Could not log out"
            });
        }

        return res.json({
            success: true,
            message: "Logout successful"
        });
    });
});

app.get('/reset_password', (req, res) => {
    res.render("admin/reset_password");
})

app.get('/session_history', (req, res) => {
    res.render("admin/session_history");
})

app.get("/start_session", (req, res) => {
    res.render("admin/start_session");
})

app.get('/edit_question', (req, res) => {
    res.render("admin/edit_question");
})

app.get('/leaderboard_result', (req, res) => {
    res.render("admin/leaderboard_result");
})

app.get('/end_session', (req, res) => {
    res.render("admin/end_session");
})

app.get('/player_entry', (req, res) => {
    res.render('player/player_entry');
})

app.get('/waiting_room', (req, res) => {
    res.render('player/waiting_room');
})

app.get('/scan_QR', (req, res) => {
    res.render('player/scan_QR');
})

app.get('/reading_room', (req, res) => {
    res.render('player/reading_room');
})

app.get('/answering_room', (req, res) => {
    res.render('player/answering_room');
})

app.get('/leaderboard', (req, res) => {
    res.render('player/leaderboard');
})

app.listen(3000, () => {
    console.log("Server running on port 3000");
});