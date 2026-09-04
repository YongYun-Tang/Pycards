const sessionCode = document.getElementById("session-code");
const leaderboard = document.getElementById("leaderboard");
const btnEndSession = document.getElementById("btn-end-session");

document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code && sessionCode) {
        sessionCode.innerText = code;
    } else {
        sessionCode.innerText = "No session code";
    }

    async function loadPlayersAnswerStatus() {
        if (!code || !leaderboard) return;

        try {
            const result = await fetch(`/api/session/leaderboard/status?code=${encodeURIComponent(code)}`);
            const data = await result.json();

            if (result.ok) {
                leaderboard.innerHTML = "";

                data.players.forEach((player, index) => {
                    const playerContainer = document.createElement("li");
                    playerContainer.classList.add("player-container");

                    const isAnswering = player.latest_answer_status === "answering";

                    if (isAnswering) {
                        playerContainer.classList.add("player-answering");
                    } else {
                        playerContainer.classList.add("player-ready");
                    }

                    const rank = document.createElement("span");
                    rank.classList.add("rank");
                    rank.textContent = index + 1;

                    const username = document.createElement("span");
                    username.classList.add("players-username");
                    username.textContent = player.username;

                    const score = document.createElement("span");
                    score.classList.add("players-score");
                    score.textContent = player.score;

                    playerContainer.appendChild(rank); 
                    playerContainer.appendChild(username);
                    playerContainer.appendChild(score);

                    leaderboard.appendChild(playerContainer);
                });
            } else {
                console.error(data.message);
            }
        } catch (error) {
            console.error("Error: ", error);
        }
    }

        async function endGamePlay() {
        try {
            const result = await fetch(`/api/session/end/${encodeURIComponent(code)}`, {
                method: 'PATCH',
            });

            const data = await result.json();

            if (!result.ok) {
                throw new Error(data.message);
            }

            window.location.href = `/end_session?code=${encodeURIComponent(code)}`;
        } catch (error) {
            console.error("Error: ", error);
            alert(error.message);
        }
    };

    btnEndSession.addEventListener("click", endGamePlay)

    loadPlayersAnswerStatus();
    setInterval(loadPlayersAnswerStatus, 500);
});