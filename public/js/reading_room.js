const level = document.getElementById('level');
const timeBar = document.getElementById('time-bar');
const timeText = document.getElementById('time-text');
const question = document.getElementById('question');
const countdownSound = document.getElementById('countdown-sound');

countdownSound.play();

document.addEventListener('DOMContentLoaded', async() => {
    const urlParams = new URLSearchParams(window.location.search);
    const qrCode = urlParams.get('qrCode');
    const code = urlParams.get('code');

    let timerInterval = null;
    let currentQuestionId = null;
    let currentAnswerId = null;
    let answerAttemptStarted = false;

    function getTimeByLevel(questionLevel) {
        const times = {
            easy: 3,
            medium: 6,
            hard: 9,
            master: 12
        };

        return times[questionLevel];
    }

    function setLevelAppearance(questionLevel) {
        const levelColors = {
            easy: "#467BD5",
            medium: "#FFC000",
            hard: "#EE0000",
            master: "#7030A0"
        };

        level.textContent = questionLevel.charAt(0).toUpperCase() + questionLevel.slice(1);

        level.style.color = levelColors[questionLevel];
    }

    async function startAnswerAttempt(questionId) {
        if (answerAttemptStarted) return;

        const result = await fetch("/api/answer/start", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ questionId })
        });

        const data = await result.json();

        if (!result.ok) {
            throw new Error(data.message);
        }

        currentAnswerId = data.answer.answer_id;
        answerAttemptStarted = true;

        console.log("Answer attempt started:", currentAnswerId);
    }

    function loadQuestionData() {
        window.location.href = `/answering_room?qrCode=${encodeURIComponent(qrCode)}` + `&questionId=${encodeURIComponent(currentQuestionId)}` + `&answerId=${encodeURIComponent(currentAnswerId)}` + `&code=${encodeURIComponent(code)}`;
    }

    function stopTimer() {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
    }

    function startTimer(questionLevel) {
        stopTimer();

        const totalTime = getTimeByLevel(questionLevel);
        let remainingTime = totalTime;

        // Reset the bar
        timeBar.style.transition = "none";
        timeBar.style.width = "100%";
        timeBar.style.backgroundColor = "#6DED12";

        if (timeText) {
            timeText.textContent = `${remainingTime}s`;
        }

        void timeBar.offsetWidth;

        // Smoothly shrink from 100% to 0%
        timeBar.style.transition = `width ${totalTime}s linear, background-color 0.3s ease`;
        timeBar.style.width = "0%";

        timerInterval = setInterval(() => {
            remainingTime--;

            const remainingTimePercentage = (remainingTime / totalTime) * 100;

            if (remainingTimePercentage <= 40) {
                timeBar.style.backgroundColor = "#ED1212";
            } else if (remainingTimePercentage <= 70) {
                timeBar.style.backgroundColor = "#EDE912";
            } else {
                timeBar.style.backgroundColor = "#6DED12";
            }

            if (timeText) {
                timeText.textContent = `${Math.max(remainingTime, 0)}s`;
            }

            if (remainingTime <= 0) {
                stopTimer();
                loadQuestionData();
            }
        }, 1000);
    }

    async function loadQuestion() {
        if (!qrCode || !code) return;

        try {
            const result = await fetch(`/api/question/scan/${encodeURIComponent(qrCode)}` + `?code=${encodeURIComponent(code)}`, {
                method: 'GET'
            });

            const data = await result.json();
            console.log(data);

            if (!result.ok) {
                throw new Error(data.message);
            }

            const questionData = data.question;
            console.log("Loaded question data: ", questionData);
            
            currentQuestionId = questionData.question_id;

            await startAnswerAttempt(currentQuestionId);
            
            const levelValue = questionData.levels.toLowerCase();
            setLevelAppearance(levelValue);
            question.textContent = questionData.question;

            startTimer(levelValue);
        } catch (error) {
            console.error("Error: ", error);
            stopTimer();
            alert(error.message);
        }
    };

    await loadQuestion();
});