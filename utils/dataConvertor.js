const fs = require("fs");
const path = require("path");

const inputFilePath = path.join(__dirname, 'data.txt');
const table = 'questions';
const separator = '|';

function txtToSQL(filePath, table, separator) {
    try {
        const data = fs.readFileSync(filePath, 'utf-8').trim();

        if (!data) {
            throw new Error('The input file is empty');
        }

        const lines = data.split("\n");

        const sqlStatements = lines.slice(1).map(line => {
            const values = line.split(separator).map(v => v.trim());

            return `INSERT INTO ${table} (qr_code, question, option_A, option_B, option_C, option_D, correct_answer, levels)
            VALUES (${values.join(', ')});`;
        });

        return sqlStatements.join('\n');
    } catch (error) {
        console.error(`Error: ${error.message}`);
        return null;
    }
}

const sqlOutput = txtToSQL(inputFilePath, table, separator);
console.log(sqlOutput);