const bcrypt = require("bcrypt");
const db = require('../models/db');

exports.initializeDefaultQuestions = (questionsArray) => {
    return new Promise((resolve, reject) => {
        const values = questionsArray.map(question => [
            question.admin_id,
            question.qr_code,
            question.question,
            question.option_A,
            question.option_B,
            question.option_C,
            question.option_D,
            question.correct_answer,
            question.levels,
        ]);

        const sql = "INSERT INTO questions (admin_id, qr_code, question, option_A, option_B, option_C, option_D, correct_answer, levels) VALUES ?";

        db.query(sql, [values], (error, results) => {
            if (error) return reject(error);
            resolve(results);
        });
    });
};

exports.register = (username, password) => {
    return new Promise(async (resolve, reject) => {
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = "INSERT INTO admins (username, password, last_login) VALUES (?, ?, NULL)";

        db.query(sql, [username, hashedPassword], (error, results) => {
            if (error) return reject(error);
            resolve(results);
        });
    });
};

exports.login = (username, password) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM admins WHERE username = ?";

        db.query(sql, [username], async (error, results) => {
            if (error) return reject(error);

            if (results.length === 0) {
                return resolve(null);
            }

            const admin = results[0];

            const match = await bcrypt.compare(password, admin.password);

            if (!match) {
                return resolve(null);
            }

            return resolve(admin);
        });
    });
};

exports.logout = (adminId) => {
    return new Promise((resolve, reject) => {
        const sql = "UPDATE admins SET last_login = NOW() WHERE admin_id = ?";

        db.query(sql, [adminId], (error, results) => {
            if (error) return reject(error);

            if (results.affectedRows == 0) {
                return resolve(null);
            }

            resolve({
                admin_id: adminId,
                last_login: new Date()
            });
        });
    });
};

exports.resetPassword = (adminId, newPassword) => {
    return new Promise(async (resolve, reject) => {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const sql = "UPDATE admins SET password = ? WHERE admin_id = ?";

        db.query(sql, [hashedPassword, adminId], (error) => {
            if (error) return reject(error);
            resolve({
                admin_id: adminId,
                password: hashedPassword
            });
        });
    });
};

exports.getAdminUsernameById = (adminId) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT username FROM admins WHERE admin_id = ? LIMIT 1";

        db.query(sql, [adminId], (error, results) => {
            if (error) return reject(error);

            if (results.length > 0) {
                resolve(results[0]);
            } else {
                resolve(null);
            }
        });
    });
};

exports.getAdminLastLoginById = (adminId) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT last_login FROM admins WHERE admin_id = ? LIMIT 1";

        db.query(sql, [adminId], (error, results) => {
            if (error) return reject(error);

            if (results.length > 0) {
                resolve(results[0]);
            } else {
                resolve(null);
            }
        });
    });
};