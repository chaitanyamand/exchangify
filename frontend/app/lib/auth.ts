import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { Client } from "pg";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import registerUser from "./registerUser";

const pgClient = new Client({
  connectionString: "process.env.USER_DB_CONNECTION_STRING",
});
pgClient.connect();

export const NEXT_AUTH = {
  providers: [
    CredentialsProvider({
      name: "Email",
      credentials: {
        username: { label: "Email", type: "email", placeholder: "Email" },
        password: { label: "Password", type: "password", placeholder: "Password" },
      },
      async authorize(credentials: any) {
        const { username, password } = credentials;
        const query = `SELECT * FROM users WHERE email = $1`;
        try {
          const result = await pgClient.query(query, [username]);
          if (result.rowCount && result.rowCount > 0) {
            const user = result.rows[0];
            const isPasswordValid = bcrypt.compareSync(password, user.password);
            if (isPasswordValid) {
              return { id: user.id, email: user.username };
            } else {
              return null;
            }
          } else {
            const user = await registerUser(username, password);
            if (!user) {
              return null;
            }
            return { id: user.id, email: user.username };
          }
        } catch (error) {
          console.log("Error in login:", error);
          return null;
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      profile: async (profile) => {
        const email = profile.email;
        const query = `SELECT * FROM users WHERE email = $1`;
        try {
          const result = await pgClient.query(query, [email]);
          if (result.rowCount && result.rowCount > 0) {
            const user = result.rows[0];
            return { id: user.id, email: user.email };
          } else {
            const user = await registerUser(profile.email, "default_password");
            if (!user) {
              throw new Error("Failed to register user");
            }
            return { id: user.id, email: user.email };
          }
        } catch (error) {
          console.log("Error in Google login:", error);
          throw new Error("Failed to login with Google");
        }
      },
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
      profile: async (profile) => {
        const email = profile.email;
        const query = `SELECT * FROM users WHERE email = $1`;
        try {
          const result = await pgClient.query(query, [email]);
          if (result.rowCount && result.rowCount > 0) {
            const user = result.rows[0];
            return { id: user.id, email: user.email };
          } else {
            const user = await registerUser(profile.email as string, "default_password");
            if (!user) {
              throw new Error("Failed to register user");
            }
            return { id: user.id, email: user.email };
          }
        } catch (error) {
          console.log("Error in Github login:", error);
          throw new Error("Failed to login with Github");
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.jwtToken = jwt.sign({ id: Number(user.id) }, process.env.JWT_SECRET as string, { expiresIn: "1d" });
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.jwtToken = token.jwtToken;
      }
      return session;
    },
  },
};
