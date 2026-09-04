const sessionCode = document.getElementById("session-code");
const leaderboard = document.getElementById("leaderboard");
const btnDashboard = document.getElementById("btn-dashboard");
const btnRestart = document.getElementById("btn-restart");

document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code && sessionCode) {
        sessionCode.innerText = code;
    } else {
        sessionCode.innerText = "No session code";
    }

    async function loadPlayers() {
        if (!code) return;

        try {
            const result = await fetch(`/api/session/leaderboard/status?code=${encodeURIComponent(code)}`);
            const data = await result.json();

            if (result.ok) {
                leaderboard.innerHTML = "";

                data.players.forEach((player, index) => {
                    const playerContainer = document.createElement("li");
                    playerContainer.classList.add("player-container");

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

    async function createSession() {
        const confirmed = confirm("Create a new session and restart the game?");

        if (!confirmed) {
            return;
        }

        try {
            const result = await fetch('/api/session', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
            });

            const data = await result.json();
            console.log(result);

            if (result.ok) {
                window.location.href = `/start_session?code=${data.session.code}`;
            } else {
                alert(`Failed to create session: ${data.error}`);
            }
        } catch (error) {
            console.error("Error: ", error);
        }
    };

    btnDashboard.addEventListener("click", () => {
        window.location.href = '/admin_dashboard';
    })

    btnRestart.addEventListener("click", createSession)

    loadPlayers();
});