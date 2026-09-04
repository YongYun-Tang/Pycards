const fs = require('fs');
const path = require('path');

function getDefaultQuestions() {
    const filePath = path.join(__dirname, 'default_questions.json');
    const rawData = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(rawData);
}

module.exports = { getDefaultQuestions };