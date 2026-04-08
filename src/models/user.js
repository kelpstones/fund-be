const db = require('../config/db');

const User = {
    create: async (user) => {
        const { name, email, password } = user;
        const result = await db.query(
            'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *',
            [name, email, password]
        );
        return result.rows[0];
    }
}