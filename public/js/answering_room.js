const level = document.getElementById("level");
const timeBar = document.getElementById("time-bar");
const clock = document.getElementById("clock");
const timeText = document.getElementById("time-text");
const question = document.getElementById("question");
const optionButtons = document.querySelectorAll(".option-btn");
const optionA = document.getElementById("option-a");
const optionB = document.getElementById("option-b");
const optionC = document.getElementById("option-c");
const optionD = document.getElementById("option-d");
const countdownSound = document.getElementById("countdown-sound");
const correctSound = document.getElementById("correct-sound");
const incorrectSound = document.getElementById("incorrect-sound");

countdownSound.play();

document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const qrCode = urlParams.get("qrCode");
    const code = urlParams.get("code");
    const answerId = urlParams.get("answerId");

    let timerInterval = null;
    let currentQuestionId = null;
    let currentAnswerId = answerId ? Number(answerId) : null;
    let answerSubmitted = false;
    let remainingTime = 0;
    let totalTime = 0;

    function getTimeByLevel(questionLevel) {
        const times = {
            easy: 6,
            medium: 8,
            hard: 10,
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

        level.style.color = levelColors[questionLevel] || "#000000";
    }

    function disableOptions() {
        optionButtons.forEach((optionButton) => {
            optionButton.disabled = true;
        });
    }

    function enableOptions() {
        optionButtons.forEach((optionButton) => {
            optionButton.disabled = false;
        });
    }

    function clearOptionStyles() {
        optionButtons.forEach((optionButton) => {
            optionButton.classList.remove("correct", "wrong");
        });
    }

    function loadLeaderboardData(delay) {
        setTimeout(() => {
            window.location.href = `/leaderboard?code=${encodeURIComponent(code)}`;
        }, delay);
    }

    function stopTimer() {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
    }

    async function expireAnswerAttempt() {
        if (!currentAnswerId) return;

        const answerId = currentAnswerId;

        try {
            const result = await fetch(`/api/answer/${answerId}/expire`, {
                method: "PATCH"
            });

            const data = await result.json();

            if (!result.ok) {
                throw new Error(data.message);
            }

            console.log("Answer attempt expired");
        } catch (error) {
            console.error("Error:", error);
        } finally {
            currentAnswerId = null;
        }
    }

    function updateTimerColor() {
        const remainingPercentage =
            (remainingTime / totalTime) * 100;

        if (remainingPercentage <= 40) {
            timeBar.style.backgroundColor = "#ED1212";
        } else if (remainingPercentage <= 70) {
            timeBar.style.backgroundColor = "#EDE912";
        } else {
            timeBar.style.backgroundColor = "#6DED12";
        }
    }

    async function handleTimeUp() {
        stopTimer();
        disableOptions();

        if (answerSubmitted) {
            return;
        }

        answerSubmitted = true;

        if (timeText) {
            timeText.textContent = "Time's Up";
            timeText.style.color = "#EE0000";
        }

        if (clock) {
            clock.style.color = "#EE0000";
        }

        await expireAnswerAttempt();

        loadLeaderboardData(1000);
    }

    function startTimer(questionLevel) {
        stopTimer();

        totalTime = getTimeByLevel(questionLevel);
        remainingTime = totalTime;

        if (timeText) {
            timeText.style.color = "";
            timeText.textContent = `${remainingTime}s`;
        }

        if (clock) {
            clock.style.color = "";
        }

        timeBar.style.transition = "none";
        timeBar.style.width = "100%";
        timeBar.style.backgroundColor = "#6DED12";

        // Force the browser to apply the reset.
        void timeBar.offsetWidth;

        timeBar.style.transition =
            `width ${totalTime}s linear, ` +
            "background-color 0.3s ease";

        timeBar.style.width = "0%";

        timerInterval = setInterval(async () => {
            remainingTime--;

            updateTimerColor();

            if (timeText) {
                timeText.textContent = `${Math.max(remainingTime, 0)}s`;
            }

            if (remainingTime <= 0) {
                remainingTime = 0;
                await handleTimeUp();
            }
        }, 1000);
    }

    function displayAnswerResult(selectedButton, isCorrect, correctAnswer) {
        if (isCorrect) {
            selectedButton.classList.add("correct");
            correctSound.play();
            return;
        }

        selectedButton.classList.add("wrong");
        incorrectSound.play();
        const correctButton = document.querySelector(`.option-btn[data-answer="${correctAnswer}"]`);

        if (correctButton) {
            correctButton.classList.add("correct");
        }
    }

    async function submitPlayerAnswer(selectedAnswer, selectedButton) {
        if (!currentQuestionId) {
            throw new Error("Question ID is missing");
        }

        if (!currentAnswerId) {
            throw new Error("Answer attempt ID is missing");
        }

        const answerTimeRemaining = Math.max(remainingTime, 0);

        const result = await fetch("/api/player/answer", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ questionId: currentQuestionId, selectedAnswer, remainingTime: answerTimeRemaining })
        });

        const data = await result.json();

        console.log("Answer response:", data);

        if (!result.ok) {
            throw new Error(data.message);
        }

        displayAnswerResult(
            selectedButton,
            data.correct === true,
            data.correct_answer
        );

        currentAnswerId = null;
    }

    async function loadQuestionData() {
        if (!qrCode || !code || !currentAnswerId) {
            console.error("Required answering room data is missing", {qrCode, code, currentAnswerId});

            disableOptions();
            return;
        }

        disableOptions();
        clearOptionStyles();

        try {
            const result = await fetch(`/api/question/scan/${encodeURIComponent(qrCode)}` + `?code=${encodeURIComponent(code)}`, {
                    method: "GET"
            });

            const data = await result.json();

            if (!result.ok) {
                throw new Error(data.message);
            }

            const questionData = data.question;

            console.log("Loaded question data:", questionData);

            currentQuestionId = questionData.question_id;

            const levelValue = questionData.levels.toLowerCase();

            setLevelAppearance(levelValue);

            question.textContent = questionData.question;
            optionA.textContent = questionData.option_A;
            optionB.textContent = questionData.option_B;
            optionC.textContent = questionData.option_C;
            optionD.textContent = questionData.option_D;

            answerSubmitted = false;

            enableOptions();
            startTimer(levelValue);
        } catch (error) {
            console.error("Error:", error);

            disableOptions();
            alert(error.message);
        }
    }

    optionButtons.forEach((optionButton) => {
        optionButton.addEventListener("click", async () => {
            if (answerSubmitted) {
                console.log("Answer already submitted");
                return;
            }

            const selectedAnswer = optionButton.dataset.answer;

            if (!selectedAnswer) {
                console.error("Selected answer is missing");
                return;
            }

            if (!currentQuestionId) {
                console.error("Question ID is missing");
                return;
            }

            if (!currentAnswerId) {
                console.error("Answer attempt ID is missing");
                return;
            }

            answerSubmitted = true;

            stopTimer();
            disableOptions();

            try {
                await submitPlayerAnswer(selectedAnswer, optionButton);

                loadLeaderboardData(1000);
            } catch (error) {
                console.error("Error:", error);

                answerSubmitted = false;
                enableOptions();

                alert(error.message);
            }
        });
    });

    await loadQuestionData();
});