const sessionCode = document.getElementById("session-code");
const playersList = document.getElementById("players-list");
const errorMessage = document.getElementById("error-message");
const btnStartSession = document.getElementById("btn-start-session");

document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code && sessionCode) {
        sessionCode.innerText = code;
    } else {
        sessionCode.innerText = "No session code";
    }

    errorMessage.textContent = ''; // Clear previous errors
    errorMessage.style.display = "none";

    async function loadPlayers() {
        if (!code) return;

        try {
            const result = await fetch(`/api/session/players?code=${encodeURIComponent(code)}`);
            const data = await result.json();

            if (result.ok) {
                playersList.innerHTML = "";

                data.players.forEach(player => {
                    const playerContainer = document.createElement("li");
                    playerContainer.classList.add("player-container");

                    const username = document.createElement("span");
                    username.classList.add("players-username");
                    username.textContent = player.username;

                    playerContainer.appendChild(username)
                    playersList.appendChild(playerContainer);
                });
            } else {
                console.error(data.message);
            }
        } catch (error) {
            console.error("Error: ", error);
        }
    }

    async function startGamePlay() {
        try {
            const result = await fetch(`/api/session/start/${encodeURIComponent(code)}`, {
                method: 'PATCH'
            });

            const data = await result.json();

            if (!result.ok) {
                throw new Error(data.message);
            }

            alert(data.message);

            window.location.href = `/leaderboard_result?code=${encodeURIComponent(code)}`
        } catch (error) {
            errorMessage.textContent = error.message;
            errorMessage.style.display = "block";
        }
    };

    btnStartSession.addEventListener("click", startGamePlay);

    if (sessionCode) {
        loadPlayers();
        setInterval(loadPlayers, 2000);
    }
});