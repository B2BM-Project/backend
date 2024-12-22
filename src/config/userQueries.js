

const getUserByUsernameOrEmail = "SELECT * FROM users WHERE username = ? OR email = ?";
const insertUser = `
    INSERT INTO users (username, password, email, display_name, profile_img, role, total_score, certificate_name, member_since)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
`;
const getUserByUsername = "SELECT * FROM users WHERE username = ?";

module.exports = {
    getUserByUsernameOrEmail,
    insertUser,
    getUserByUsername
};
