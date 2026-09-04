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
    return new Promise((resolve, reject) => {
        const sql = "UPDATE sessions SET status = ? WHERE session_id = ?";

        db.query(sql, [status, sessionId], (error, results) => {
            if (error) return reject(error);

            if (results.affectedRows === 0) {
                return reject(new Error("No session updated"));
            }
            
            resolve(results);
        });
    });
};