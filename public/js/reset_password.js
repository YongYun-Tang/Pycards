const backIcon = document.getElementById('back-icon');
const resetPasswordForm = document.getElementById('reset-password-form');
const username = document.getElementById('username');
const newPassword = document.getElementById('new-password');
const confirmPassword = document.getElementById('confirm-password');
const errorMessage = document.getElementById('error-message');

document.addEventListener('DOMContentLoaded', async () => {
    errorMessage.textContent = ''; // Clear previous errors
    errorMessage.style.display = "none";

    backIcon.addEventListener('click', () => {
        window.location.href = "/admin_dashboard";
    });

    async function loadAdminUsername() {
        try {
            const result = await fetch('/api/admin/adminUsername');
            const data = await result.json();

            if (!result.ok) {
                throw new Error(data.error);
            }

            username.value = data.username;
        } catch (error) {
            errorMessage.textContent = error.message;
            errorMessage.style.display = "block";

            if (error.message.includes("not logged in")) {
                window.location.href = "/admin_login";
            }
        }
    };

    await loadAdminUsername();

    function validatePassword() {
        if (newPassword.value !== confirmPassword.value) {
            errorMessage.textContent = "Passwords do not match";
            errorMessage.style.display = "block";
            return false;
        } else {
            errorMessage.textContent = "";
            errorMessage.style.display = "none";
            return true;
        }
    };

    newPassword.addEventListener('input', validatePassword);
    confirmPassword.addEventListener('input', validatePassword);

    resetPasswordForm.addEventListener('submit', async(event) => {
        event.preventDefault();

        if (!resetPasswordForm.checkValidity() || !validatePassword()) {
            return;
        }

        try {
            const result = await fetch('/api/admin/resetPassword', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ newPassword: newPassword.value })
            });

            const data = await result.json();

            if (!result.ok) {
                throw new Error(data.message);
            }

            alert(data.message);

            window.location.href="/admin_dashboard";

        } catch (error) {
            errorMessage.textContent = error.message; 
            errorMessage.style.display = "block";
        }
    });
});