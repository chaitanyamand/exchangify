const ClientUserDB = require("pg").Client;

const clientUserDB = new ClientUserDB({
  connectionString: process.env.USER_DB_CONNECTION_STRING,
});

async function initializeUserDB() {
  await clientUserDB.connect();

  await clientUserDB.query(`
        DROP TABLE IF EXISTS "users";
        CREATE TABLE "users"(
            id  SERIAL PRIMARY KEY,
            email VARCHAR(50),
            password VARCHAR
        );
        `);

  await clientUserDB.end();
  console.log("User Database initialized successfully");
}

initializeUserDB().catch(console.error);
