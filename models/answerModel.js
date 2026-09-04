const db = require('../models/db');

exports.countActiveAnswers = (sessionId) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT COUNT(*) AS active_count FROM players 
                    LEFT JOIN answers AS latest_answer 
                    ON latest_answer.answer_id = (SELECT MAX(answers.answer_id) FROM answers WHERE answers.player_id = players.player_id)
                    WHERE players.session_id = ? AND latest_answer.status = 'answering'`;

        db.query(sql, [sessionId], (error, results) => {
            if (error) return reject(error);
            resolve(results[0]);
        });
    });
};

exports.startAnswer = (playerId, questionId) => {
    return new Promise((resolve, reject) => {
        const sql = "INSERT INTO answers (player_id, question_id, selected_answer, is_correct, status) VALUES (?, ?, NULL, NULL, 'answering')";

        db.query(sql, [playerId, questionId], (error, results) => {
            if (error) return reject(error);
            resolve({
                answer_id: results.insertId
            });
        });
    });
};

exports.expireAnswer = (answerId, playerId) => {
    return new Promise((resolve, reject) => {
        const sql = "UPDATE answers SET status = 'expired' WHERE answer_id = ? AND player_id = ? AND status = 'answering'";

        db.query(sql, [answerId, playerId], (error, results) => {
            if (error) return reject(error);
            resolve(results);
        });
    });
};