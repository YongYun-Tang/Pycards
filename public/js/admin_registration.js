const registerForm = document.getElementById('register-form');
const errorMessage = document.getElementById('error-message');
const username = document.getElementById('username');
const password = document.getElementById('password');
const strengthBar = document.querySelector('.strength-bar');
const strengthLabel = document.getElementById("strength-label");

password.addEventListener('input', () => {
    updateStrengthMeter(password.value);
});

registerForm.addEventListener('submit', async(event) => {
    event.preventDefault();

    errorMessage.textContent = ''; // Clear previous errors
    errorMessage.style.display = "none";
    
    try {
        const result = await fetch('/api/admin/register', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ username: username.value.trim(), password: password.value })
        });

        const data = await result.json();

        if (!result.ok) {
            throw new Error(data.message || 'Username has been taken');
        }

        localStorage.setItem('adminId', data.admin_id);

        alert(data.message);

        window.location.href = "/admin_login";

    } catch (error) {
        errorMessage.textContent = error.message; 
        errorMessage.style.display = "block";
    }
});

function updateStrengthMeter(password) {
    const passwordLength = password.length;

    if (passwordLength === 0) {
        strengthBar.style.width = "0%";
        strengthLabel.textContent = "";
        return;
    }

    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSymbols = /[!@#$%^&*()\-=_+[\]{}|;:,.<>?]/.test(password);

    let strengthScore = 0;
    strengthScore += Math.min(passwordLength * 2, 40);

    if (hasUppercase) strengthScore += 15;
    if (hasLowercase) strengthScore += 15;
    if (hasNumbers) strengthScore += 15;
    if (hasSymbols) strengthScore += 15;

    if (passwordLength < 8) {
        strengthScore = Math.min(strengthScore, 40);
    }

    const safeScore = Math.max(5, Math.min(100, strengthScore));
    strengthBar.style.width = safeScore + "%";

    let strengthLabelText = "";
    let barColor = "";

    if (strengthScore < 40) {
        strengthLabelText = "Weak";
        barColor = "#ED4949";
    } else if (strengthScore < 70) {
        strengthLabelText = "Medium";
        barColor = "#E7D74D";
    } else {
        strengthLabelText = "Strong";
        barColor = "#46D948";
    }

    strengthBar.style.backgroundColor = barColor;
    strengthLabel.textContent = strengthLabelText;
}