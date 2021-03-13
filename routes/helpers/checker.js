const connection = require('../../config/db')

async function checkEmail2(email) {
    try {
        let sql = "SELECT count(*) as count FROM user WHERE email = ?";
        const [result] = await connection.execute(sql, [email]);
        if (result[0]['count'] === 1)
            return true;
        return false;
    } catch (err) {
        console.log(err);
        return false;
    }
}
async function checkUsername2(username) {
    try {
        let sql = "SELECT count(*) as count FROM user WHERE username = ?";
        const [result] = await connection.execute(sql, [username]);
        if (result[0]['count'] === 1)
            return true;
        return false;
    } catch (err) {
        console.log(err);
        return false;
    }
}

module.exports = {
    checkEmail2,
    checkUsername2
};