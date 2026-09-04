const db = require("../models/db");

exports.getQuestionByAdminId = (adminId) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM questions WHERE admin_id = ?";

        db.query(sql, [adminId], (error, results) => {
            if (error) return reject(error);
            resolve(results);
        });
    });
};

exports.getQuestionById = (questionId, adminId) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM questions WHERE question_id = ? AND admin_id = ?";

        db.query(sql, [questionId, adminId], (error, results) => {
            if (error) return reject(error);
            resolve(results);
        });
    });
};

exports.updateQuestion = (questionId, adminId, updates) => {
    return new Promise((resolve, reject) => {
        const columns = [];
        const values = [];

        for (const column in updates) {
            columns.push(`${column} = ?`);
            values.push(updates[column]);
        }

        const sql = `UPDATE questions SET ${columns.join(', ')} WHERE question_id = ? AND admin_id = ?`;

        values.push(questionId);
        values.push(adminId);

        console.log("SQL:", sql);
        console.log("VALUES:", values);

        db.query(sql, values, (error, results) => {
            if (error) return reject(error);
            resolve(results);
        });
    });
};

exports.getQuestionByQR = (adminId, qrCode) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM questions WHERE admin_id = ? AND qr_code = ?";

        db.query(sql, [adminId, qrCode], (error, results) => {
            if (error) return reject(error);
            resolve(results[0]);
        });
    });
};