import bcrypt from "bcryptjs";
import { Client } from "pg";

const pgClient = new Client({
  connectionString: "process.env.USER_DB_CONNECTION_STRING",
});
pgClient.connect();

async function registerUser(username: string, password: string) {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = `INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *`;
    const values = [username, hashedPassword];
    const result = await pgClient.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.log("Error while registering user:", error);
    return null;
  }
}

export default registerUser;
