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

exports.startAnswer = (playerId, questionId, sessionQuestionId) => {
    return new Promise((resolve, reject) => {
        const sql = "INSERT INTO answers (player_id, question_id, session_question_id, selected_answer, is_correct, status) VALUES (?, ?, ?, NULL, NULL, 'answering')";

        db.query(sql, [playerId, questionId, sessionQuestionId], (error, results) => {
            if (error) return reject(error);
            resolve({
                answer_id: results.insertId
            });
        });
    });
};

exports.expireAnswer = (answerId, playerId) => {
    return new Promise((resolve, reject) => {
        const sql = `UPDATE answers SET status = 'expired',
                                        score_earned = 0,
                                        remaining_time = 0,
                                        answered_at = NOW()
                                        WHERE answer_id = ? AND player_id = ? AND status = 'answering'`;

        db.query(sql, [answerId, playerId], (error, results) => {
            if (error) return reject(error);
            resolve(results);
        });
    });
};

exports.getPlayerAnswerHistory = (playerId) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT a.answer_id, a.status, a.selected_answer, a.is_correct, a.score_earned, a.remaining_time, a.answered_at,
                     sq.question_id, sq.qr_code, sq.question, sq.option_A, sq.option_B, sq.option_C, sq.option_D, sq.correct_answer, sq.levels
                     FROM answers a INNER JOIN session_questions sq ON sq.session_question_id = a.session_question_id WHERE a.player_id = ? ORDER BY a.answer_id ASC`;

        db.query(sql, [playerId], (error, results) => {
            if (error) return reject(error);
            
            resolve(results);
        });
    });
};