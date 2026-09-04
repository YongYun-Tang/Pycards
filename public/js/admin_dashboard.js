const menuIcon = document.getElementById('menu-icon');
const menuDropdown = document.getElementById('menu-dropdown');
const resetPassword = document.getElementById('reset-password');
const logOut = document.getElementById('log-out');
const search = document.getElementById('search');
const lastLogin = document.getElementById('last-login');
const questionsData = document.getElementById('questions-data');
const btnCreateSession = document.getElementById('btn-create-session');

let allQuestions = [];

document.addEventListener('DOMContentLoaded', async () => {
    const data = await loadDashboardData();
    if (!data) return;

    setupMenuListeners();
    setupSearchListener();

    loadTableData(questionsData);
    loadAdminLastLogin();

    btnCreateSession.addEventListener("click", createSession);
});

async function loadDashboardData() {
    try {
        const result = await fetch('/api/admin/dashboardData');
        
        const data = await result.json();

        if (!result.ok) {
            throw new Error(data.message || 'Failed to load dashboard data');
        }

        console.log("Dashboard verified and loaded successfully: ", data);
        return data;
    } catch (error) {
        sessionStorage.clear();
        window.location.href = "/admin_login";
        return null;
    }
};

// Menu drop down
function setupMenuListeners() {
    menuIcon.addEventListener('click', (event) => {
        // Prevents the click from immediately bubbling up to the window
        event.stopPropagation();
        menuDropdown.classList.toggle('show');
    });

    window.addEventListener('click', () => {
        menuDropdown.classList.remove('show');
    });

    resetPassword.addEventListener('click', async() => {
        window.location.href = "/reset_password";
    });

    logOut.addEventListener('click', async () => {
        try {
            const result = await fetch('/api/admin/logout', { method: 'POST' });
            const data = await result.json();

            if (data.success) {
                sessionStorage.clear();
                window.location.href = "/admin_login";
            } else {
                alert("Logout failed: " + data.message);
            }
        } catch (error) {
            console.error("Error: ", error);
        }
    });

    window.addEventListener('pageshow', (event) => {
        // If the page was loaded from the browser's cache (like clicking the Back button)
        if (event.persisted) {
            // Force the browser to reload the page fresh from the server
            window.location.reload();
        }
    });
};

// Search
function setupSearchListener() {
    search.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();

            const keyword = event.target.value.toLowerCase().trim();

            const filteredQuestions = allQuestions.filter(question => {
                return question.qr_code.toLowerCase().includes(keyword) ||
                       question.question.toLowerCase().includes(keyword) ||
                       question.option_A.toLowerCase().includes(keyword) ||
                       question.option_B.toLowerCase().includes(keyword) ||
                       question.option_C.toLowerCase().includes(keyword) ||
                       question.option_D.toLowerCase().includes(keyword) ||
                       question.levels.toLowerCase().includes(keyword)
            });
            
            renderTable(filteredQuestions, questionsData);
        }
    });
};

// Load admin last login text
async function loadAdminLastLogin() {
    try {
        const result = await fetch('/api/admin/adminLastLogin');
        const data = await result.json();

        if (!result.ok) {
            throw new Error(data.error);
        }

        if (data.last_login) {
            const date = new Date(data.last_login);

            const formattedDate = date.toLocaleString('en-CA', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: "2-digit",
                second: '2-digit',
                hour12: true
            }).replace(",", "");
            
            lastLogin.textContent = "Last Login: " + formattedDate;
        } else {
            lastLogin.textContent = "First time logging in!";
        }
    } catch (error) {
        console.error("Error: ", error);
    }
};

// Create session
async function createSession() {
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

// Get questions table
async function loadTableData(questionsData) {
    try {
        const result = await fetch('/api/question');

        if (!result.ok) {
            throw new Error('Failed to fetch questions');
        }

        const data = await result.json();

        allQuestions = data.results;

        renderTable(allQuestions, questionsData);

    } catch (error) {
        console.error("Error: ", error);
    }
};

// Render questions table
function renderTable(questionsList, targetBody) {
    // Clear old rows
    targetBody.innerHTML= '';

    if (questionsList.length === 0) {
        targetBody.innerHTML = `<tr><td colspan="10" style="text-align: center; color: #888888;">Data Not Found</td></tr>`;
        return;
    }

    questionsList.forEach(question => {
        // Create a new row element
        const row = document.createElement('tr');

        // Insert HTML content into the row
        row.innerHTML = `
            <td>${question.qr_code}</td>
            <td class="truncate">${question.question}</td>
            <td class="truncate">${question.option_A}</td>
            <td class="truncate">${question.option_B}</td>
            <td class="truncate">${question.option_C}</td>
            <td class="truncate">${question.option_D}</td>
            <td>${question.correct_answer}</td>
            <td>${question.levels}</td>
            <td><img class="edit-icon" data-id="${question.question_id}" src="images/edit_icon.png" onclick="window.location.href='/edit_question?questionId=${question.question_id}'"></td>
        `;
        targetBody.appendChild(row);
    });
};