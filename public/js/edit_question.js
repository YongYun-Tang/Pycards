const backIcon = document.getElementById("back-icon");
const qrCode = document.getElementById("qr-code");
const questionForm = document.getElementById("question-form");
const question = document.getElementById("question");
const optionA = document.getElementById("option-a");
const optionB = document.getElementById("option-b");
const optionC = document.getElementById("option-c");
const optionD = document.getElementById("option-d");
const correctAnswer = document.getElementById("correct-answer");
const level = document.getElementById("level");

document.addEventListener('DOMContentLoaded', async() => {
    backIcon.addEventListener('click', () => {
        window.location.href = "/admin_dashboard";
    });
    
    const urlParams = new URLSearchParams(window.location.search);
    const questionIdFromURL = urlParams.get('questionId');

    if (!questionIdFromURL) {
        alert("No question id specified!");
        window.location.href = '/admin_dashboard';
        return;
    }

    async function loadQuestionData() {
        try {
            const result = await fetch(`/api/question/${questionIdFromURL}`, {
                method: 'GET'
            });

            const data = await result.json();
            console.log(data);

            if (result.status === 401) {
                window.location.href = '/admin_login';
                return;
            }

            if (!data.question) {
                window.location.href = '/admin_dashboard';
                return;
            }

            if (!result.ok) {
                throw new Error(data.message || 'Failed to fetch question');
            }

            const questionData = data.question;
            console.log("Loaded question data: ", questionData);

            qrCode.textContent = questionData.qr_code;
            question.value = questionData.question;
            optionA.value = questionData.option_A;
            optionB.value = questionData.option_B;
            optionC.value = questionData.option_C;
            optionD.value = questionData.option_D;
            correctAnswer.value = questionData.correct_answer;
            level.value = questionData.levels;

        } catch (error) {
            console.error("Error: ", error);
        }
    };

    questionForm.addEventListener('submit', async(event) => {
        event.preventDefault();
        
        try {
            if (!question.value.trim() || 
                !optionA.value.trim() || 
                !optionB.value.trim() || 
                !optionC.value.trim() || 
                !optionD.value.trim()) {
                alert("Please fill in all text fields")
                return;
            };

            const updateData = {
                question:       question.value,
                option_A:       optionA.value,
                option_B:       optionB.value,
                option_C:       optionC.value,
                option_D:       optionD.value,
                correct_answer: correctAnswer.value,
                levels:         level.value
            };

            const result = await fetch(`/api/question/${questionIdFromURL}`, {
                method: 'PATCH',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(updateData)
            });

            const data = await result.json();

            if (!result.ok) {
                throw new Error(data.message);
            }

            alert(data.message);

            window.location.href = "/admin_dashboard";

        } catch (error) {
            console.error("Error: ", error);
        }
    });

    loadQuestionData();
});