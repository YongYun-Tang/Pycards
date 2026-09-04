const leaderboard = document.getElementById("leaderboard");
const btnScan = document.getElementById("btn-scan");
const resultPopup = document.getElementById("result-popup");
const winnerUsername = document.getElementById("winner-username");
const winnerScore = document.getElementById("winner-score");
const btnReturn = document.getElementById("btn-return");
const firstPlaceSound = document.getElementById("first-place-sound");

document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    let sessionEndedPopupShown = false;

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

    async function showSessionResult() {
        if (sessionEndedPopupShown) return;

        sessionEndedPopupShown = true;

        try {
            const result = await fetch(`/api/session/leaderboard/status?code=${encodeURIComponent(code)}`);
            const data = await result.json();

            if (!result.ok) {
                throw new Error(data.message);
            }

            const players = data.players;

            if (!Array.isArray(players) || players.length === 0) {
                winnerUsername.textContent = "No winner";
                winnerScore.textContent = "0";
            } else {
                const sortedPlayers = [...players].sort((first, second) => {
                    if (second.score !== first.score) {
                        return second.score - first.score;
                    }

                    return first.player_id - second.player_id;
                });

                const winner = sortedPlayers[0];

                winnerUsername.textContent = winner.username;
                winnerScore.textContent = winner.score;
            }

            resultPopup.classList.add("show");
            firstPlaceSound.play();
            document.body.style.overflow = "hidden";
        } catch (error) {
            console.error("Error: ", error);

            winnerUsername.textContent = "Unable to load winner";
            winnerScore.textContent = "0";

            resultPopup.classList.add("show");
        }
    }

    async function checkSessionStatus() {
        if (!code) return;

        try {
            const result = await fetch(`/api/session/status?code=${encodeURIComponent(code)}`);
            const data = await result.json();

            if (result.ok) {
                if (data.status === "ended") {
                    await showSessionResult();
                }
            } else {
                console.error(data.message);
            }
        } catch (error) {
            console.error("Error: ", error);
        }
    }

    btnScan.addEventListener("click", () => {
        window.location.href = `/scan_QR?code=${encodeURIComponent(code)}`
    })

    btnReturn.addEventListener("click", () => {
        window.location.href = "/player_entry";
    })

    loadPlayers();
    checkSessionStatus();
    
    setInterval(loadPlayers, 1000);
    setInterval(checkSessionStatus, 2000);
});