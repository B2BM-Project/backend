// Signup functionality
document.getElementById('signupForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const email = document.getElementById('email').value;

    // Get optional fields
    const display_name = document.getElementById('display_name').value || null;
    const profile_img = document.getElementById('profile_img').files[0] || null;
    const role = document.getElementById('role').value || null;
    const total_score = document.getElementById('total_score').value || null;
    const certificate_name = document.getElementById('certificate_name').value || null;

    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);
    formData.append("email", email);
    formData.append("display_name", display_name);
    formData.append("profile_img", profile_img);
    formData.append("role", role);
    formData.append("total_score", total_score);
    formData.append("certificate_name", certificate_name);

    try {
        const response = await fetch('http://localhost:5100/create', {
            method: 'POST',
            body: formData
        });
        const result = await response.json();
        document.getElementById('responseMessage').textContent = result.message;
    } catch (error) {
        document.getElementById('responseMessage').textContent = 'Error creating user.';
    }
});

// Login functionality
document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    const data = { username, password };

    try {
        const response = await fetch('http://localhost:5100/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        document.getElementById('responseMessage').textContent = result.message;
    } catch (error) {
        document.getElementById('responseMessage').textContent = 'Error logging in.';
    }
});
