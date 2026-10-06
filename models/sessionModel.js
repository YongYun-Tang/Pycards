const db = require("../models/db");
const generateAccessCode = require("../utils/generateAccessCode");

exports.createSession = (adminId) => {
    return new Promise((resolve, reject) => {
        const code = generateAccessCode();

        const sql = "INSERT INTO sessions (code, admin_id) VALUES (?, ?)";

        db.query(sql, [code, adminId], (error, results) => {
            if (error) return reject(error);
            resolve({
                session_id: results.insertId,
                code,
                adminId
            });
        });
    });
};

exports.getSessionById = (sessionId) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT session_id, code, status, admin_id FROM sessions WHERE session_id = ?`;

        db.query(sql, [sessionId], (error, results) => {
            if (error) return reject(error);

            resolve(results[0]);
        })
    })
}

exports.getSessionCode = (code) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM sessions WHERE code = ?";

        db.query(sql, [code], (error, results) => {
            if (error) return reject(error);
            resolve(results[0]);
        });
    });
};

exports.updateSessionStatus = (sessionId, status) => {
    console.log(
        "updateSessionStatus called:",
        sessionId,
        status
    );
    return new Promise((resolve, reject) => {
        let sql;
        let params;

        if (status === "active") {
            console.log("Setting started_at");
            sql = `UPDATE sessions SET status = ?, started_at = NOW() WHERE session_id = ? AND status = 'waiting'`;

            params = [status, sessionId];
        } else if (status === "ended") {
            console.log("Setting ended_at");
            sql = `UPDATE sessions SET status = ?, ended_at = NOW() WHERE session_id = ? AND status = 'active'`;

            params = [status, sessionId];
        }

        db.query(sql, params, (error, results) => {
            if (error) return reject(error);

            if (results.affectedRows === 0) {
                return reject(new Error("No session updated"));
            }
            
            resolve(results);
        });
    });
};

exports.getSessionHistory = (adminId) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT s.session_id, s.code, s.started_at, s.ended_at, TIMESTAMPDIFF(
                     SECOND, s.started_at, s.ended_at) AS duration_seconds, COUNT(p.player_id)
                     AS player_count FROM sessions s LEFT JOIN players p ON p.session_id = s.session_id
                     WHERE s.admin_id = ? AND s.status = 'ended' 
                     GROUP BY s.session_id, s.code, s.started_at, s.ended_at
                     ORDER BY s.ended_at DESC`;
        
        db.query(sql, [adminId], (error, results) => {
            if (error) return reject(error);

            resolve(results);
        });
    });
};

exports.getSessionHistoryDetail = (sessionId, adminId) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT s.session_id, s.code, s.started_at, s.ended_at, 
                     TIMESTAMPDIFF(SECOND, s.started_at, s.ended_at) AS duration_seconds,
                     COUNT(p.player_id) AS player_count FROM sessions s LEFT JOIN
                     players p ON p.session_id = s.session_id WHERE s.session_id = ?
                     AND s.admin_id = ? AND s.status = 'ended' GROUP BY 
                     s.session_id, s.code, s.started_at, s.ended_at`;
        
        db.query(sql, [sessionId, adminId], (error, results) => {
            if (error) return reject(error);

            resolve(results[0]);
        });
    });
};

exports.deleteSessionHistory = (sessionId, adminId) => {
    return new Promise((resolve, reject) => {
        const sql = `DELETE FROM sessions WHERE session_id = ? AND admin_id = ? AND status = 'ended'`;

        db.query(sql, [sessionId, adminId], (error, results) => {
            if (error) return reject(error);

            resolve({
                delete: results.affectedRows > 0
            });
        });
    });
};