const loginForm = document.getElementById('login-form');
const errorMessage = document.getElementById('error-message');
const username = document.getElementById('username');
const password = document.getElementById('password');

loginForm.addEventListener('submit', async(event) => {
    event.preventDefault(); // Prevent page reloading

    errorMessage.textContent = ''; // Clear previous errors
    errorMessage.style.display = "none";
    
    try {
        const result = await fetch('/api/admin/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ username: username.value.trim(), password: password.value })
        });

        const data = await result.json();

        if (!result.ok) {
            throw new Error(data.message || 'An error occurred during login');
        }

        alert(data.message);

        window.location.href = "/admin_dashboard";

    } catch (error) {
        errorMessage.textContent = error.message; 
        errorMessage.style.display = "block";
    }
});