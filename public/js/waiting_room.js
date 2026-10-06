const sessionCode = document.getElementById("session-code");
const welcomeText = document.getElementById("welcome-text");
const dotsAnimation = document.getElementById("dots");
const playersCount = document.getElementById("players-count");
const backgroundAudio = document.getElementById("background-audio");

backgroundAudio.play();

document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code && sessionCode) {
        sessionCode.innerText = code.toUpperCase();
    } else {
        sessionCode.innerText = "No session code";
    }

    let dots = 1;
    
    if (dotsAnimation) {
        setInterval(() => {
            dotsAnimation.innerText = ".".repeat(dots);
            dots++

            if (dots > 3) {
                dots = 1;
            }
        }, 500);
    }

    async function loadPlayersCount() {
        if (!code || !playersCount) return;

        try {
            const result = await fetch(`/api/session/players?code=${encodeURIComponent(code)}`);
            const data = await result.json();

            if (result.ok) {
                playersCount.innerText = `${data.players.length} players joined`;
            } else {
                console.error(data.message);
            }
        } catch (error) {
            console.error("Error: ", error);
        }
    }

    async function getPlayerUsername() {
        try {
            const result = await fetch("/api/player/");
            const data = await result.json();

            if (result.ok) {
                welcomeText.innerText = `Welcome, ${data.results}!`;
            } else {
                console.error(data.message);
            }
        } catch (error) {
            console.error("Error", error);
        }
    }

    async function checkSessionStatus() {
        if (!code) return;

        try {
            const result = await fetch(`/api/session/status?code=${encodeURIComponent(code)}`);
            const data = await result.json();

            if (result.ok) {
                if (data.status === "active") {
                    window.location.href = `/scan_QR?code=${encodeURIComponent(code)}`;
                }
            } else {
                console.error(data.message);
            }
        } catch (error) {
            console.error("Error: ", error);
        }
    }

    loadPlayersCount();
    getPlayerUsername();

    setInterval(loadPlayersCount, 2000);
    setInterval(checkSessionStatus, 2000);
});