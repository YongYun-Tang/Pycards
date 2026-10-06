const db = require('../models/db');

exports.addPlayer = (username, sessionId) => {
    return new Promise((resolve, reject) => {
        const sql = "INSERT INTO players (username, session_id) VALUES (?, ?)";

        db.query(sql, [username, sessionId], (error, results) => {
            if (error) return reject(error);
            resolve({
                player_id: results.insertId,
                username: username,
                score: 0,
                session_id: sessionId
            });
        });
    });
};

exports.getPlayersBySessionId = (sessionId) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT username, score FROM players WHERE session_id = ?" 

        db.query(sql, [sessionId], (error, results) => {
            if (error) return reject(error);
            resolve(results);
        });
    });
};

exports.getPlayerUsername = (playerId) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT username FROM players WHERE player_id = ?"

        db.query(sql, [playerId], (error, results) => {
           if (error) return reject(error);
           resolve(results[0].username);
        });
    });
};

exports.getPlayerById = (playerId) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT player_id, username, score, session_id FROM players WHERE player_id = ?`;

        db.query(sql, [playerId], (error, results) => {
            if (error) return reject(error);

            resolve(results[0])
        })
    })
}

exports.checkUsername = (username, sessionId) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT player_id FROM players WHERE username = ? AND session_id = ? LIMIT 1";

        db.query(sql, [username, sessionId], (error, results) => {
            if (error) return reject(error);
            resolve(results.length > 0);
        });
    });
};

exports.countPlayers = (sessionId) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT COUNT(*) AS player_count FROM players WHERE session_id = ?";

        db.query(sql, [sessionId], (error, results) => {
            if (error) return reject(error);
            resolve(results[0]);
        });
    });
};

exports.submitAnswer = (playerId, questionId, selectedAnswer, remainingTime) => {
    return new Promise((resolve, reject) => {
        const getQuestionSQL = "SELECT correct_answer, levels FROM questions WHERE question_id = ?";

        db.query(getQuestionSQL, [questionId], (error, results) => {
            if (error) return reject(error);

            if (results.length === 0) {
                return reject(new Error("Question not found"));
            }

            const question = results[0];
            const isCorrect = selectedAnswer === question.correct_answer;

            const baseScoreMap = {
                easy: 2,
                medium: 4,
                hard: 6,
                master: 10
            };

            const maximumTimeMap = {
                easy: 6,
                medium: 8,
                hard: 10,
                master: 12
            }

            const baseScore = baseScoreMap[question.levels] || 0;
            const maximumTime = maximumTimeMap[question.levels] || 0;
            const validRemainingTime = Math.max(0, Math.min(Number(remainingTime) || 0, maximumTime));
            const score = isCorrect ? baseScore + validRemainingTime : 0;

            const updateAnswerSQL = `UPDATE answers SET selected_answer = ?, is_correct = ?, score_earned = ?, remaining_time = ?, answered_at = NOW(), status = 'submitted' 
                                    WHERE answer_id = (SELECT answer_id FROM (SELECT answer_id FROM answers WHERE player_id = ? AND question_id = ? AND status = 'answering'
                                    ORDER BY answer_id DESC LIMIT 1) AS latest_answer)`;

            db.query(updateAnswerSQL, [selectedAnswer, isCorrect ? 1: 0, score, validRemainingTime, playerId, questionId], (error, results) => {
                if (error) return reject(error);

                if (results.affectedRows === 0) {
                    return reject(new Error("No active answer attempt found"));
                }

                const updateScoreSQL = "UPDATE players SET score = score + ? WHERE player_id = ?";

                db.query(updateScoreSQL, [score, playerId], (error) => {
                    if (error) return reject(error);
                    resolve({
                        correct: isCorrect, 
                        selected_answer: selectedAnswer,
                        correct_answer: question.correct_answer,
                        baseScore,
                        timeBonus: isCorrect ? validRemainingTime : 0,
                        score
                    });
                });
            });
        });
    });
};

exports.getPlayersAnswerStatus = (sessionId) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT players.player_id, players.username, players.score,
                    CASE WHEN latest_answer.status = 'answering'
                    THEN 'answering'
                    ELSE 'ready'
                    END AS latest_answer_status
                    FROM players LEFT JOIN answers AS latest_answer
                    ON latest_answer.answer_id = (SELECT MAX(answers.answer_id) FROM answers WHERE answers.player_id = players.player_id)
                    WHERE players.session_id = ? ORDER BY players.score DESC, players.player_id ASC`;

        db.query(sql, [sessionId], (error, results) => {
            if (error) return reject(error);
            resolve(results);
        });
    });
};

exports.getLeaderboard = (sessionId) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT player_id, username, score FROM players WHERE session_id = ? ORDER BY score DESC, player_id ASC";

        db.query(sql, [sessionId], (error, results) => {
            if (error) return reject(error);
            resolve(results);
        });
    });
};

exports.getHistoryLeaderboard = (sessionId) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT p.player_id, p.username, p.score, COUNT(a.answer_id) AS total_questions,
                     SUM(
                         CASE
                             WHEN a.is_correct = 1 THEN 1
                             ELSE 0
                         END
                     ) AS correct_answers,
                     SUM(
                         CASE
                            WHEN a.status = 'submitted' 
                            AND a.is_correct = 0 THEN 1
                            ELSE 0
                         END
                    ) AS wrong_answers,
                    SUM(
                         CASE
                             WHEN a.status = 'expired' THEN 1
                             ELSE 0
                         END
                    ) AS expired_answers
                    FROM players p LEFT JOIN answers a ON a.player_id = p.player_id WHERE p.session_id = ?
                    GROUP BY p.player_id, p.username, p.score ORDER BY p.score DESC, p.player_id ASC`;
        db.query(sql, [sessionId], (error, results) => {
            if (error) return reject(error);

            resolve(results);
        });
    });
};

exports.getHistoryPlayer = (playerId, sessionId) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT player_id, username, score FROM players WHERE player_id = ? AND session_id = ?`;

        db.query(sql, [playerId, sessionId], (error, results) => {
            if (error) return reject(error);

            resolve(results[0] || null);
        });
    });
};