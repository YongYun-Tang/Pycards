const playerEntryForm = document.getElementById("player-entry");
const username = document.getElementById("username");
const sessionCode = document.getElementById("session-code");
const backgroundAudio = document.getElementById("background-audio");

function startAudio() {
    backgroundAudio.play();
}

document.addEventListener("click", startAudio);

playerEntryForm.addEventListener('submit', async(event) => {
    event.preventDefault();

    const usernameValue = username.value.trim();
    const sessionCodeValue = sessionCode.value.trim();

    username.classList.remove('is-invalid');
    sessionCode.classList.remove('is-invalid');

    if (!usernameValue || !sessionCodeValue) {
        alert("Please enter both a username and a session code");
        return;
    }

    try {
        const result = await fetch('/api/session/join', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ username: usernameValue, code: sessionCodeValue})
        });

        const data = await result.json();

        if (!result.ok) {
            const errorMessage = data.message || 'Failed to join the session';

            if (errorMessage.toLowerCase().includes('username')) {
                username.classList.add('is-invalid');
            } else {
                sessionCode.classList.add('is-invalid');
            }

            throw new Error(errorMessage);
        } else {
            window.location.href=`/waiting_room?code=${sessionCodeValue}`;
        }
    } catch(error) {
        alert(error.message);
    }
});

username.addEventListener('input', () => {
    username.classList.remove('is-invalid');
});

sessionCode.addEventListener('input', () => {
    sessionCode.classList.remove('is-invalid');
});