const db = require('../models/db');

exports.getSessionQuestion = (sessionId, questionId) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM session_questions WHERE session_id = ? AND question_id = ? LIMIT 1`;

        db.query(sql, [sessionId, questionId], (error, results) => {
            if (error) return reject(error);

            resolve(results[0]);
        });
    });
};

exports.createSessionQuestion = (sessionId, question) => {
    return new Promise((resolve, reject) => {
        const sql = `INSERT INTO session_questions (session_id, question_id, qr_code, question, option_A, option_B, option_C, option_D, correct_answer, levels)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        
        const values = [sessionId, question.question_id, question.qr_code, question.question, question.option_A, question.option_B, question.option_C, question.option_D, question.correct_answer, question.levels];

        db.query(sql, values, (error, results) => {
            if (error) return reject(error);

            resolve({
                session_question_id: results.insertId
            });
        });
    });
};

exports.getOrCreateSessionQuestion = (sessionId, question) => {
    return new Promise((resolve, reject) => {
        const sql = `INSERT INTO session_questions (session_id, question_id, qr_code, question, option_A, option_B, option_C, option_D, correct_answer, levels)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE session_question_id = LAST_INSERT_ID(session_question_id)`;

        const values = [sessionId, question.question_id, question.qr_code, question.question, question.option_A, question.option_B, question.option_C, question.option_D, question.correct_answer, question.levels];

        db.query(sql, values, (error, results) => {
            if (error) return reject(error);

            resolve({
                session_question_id: results.insertId
            });
        });
    });
};