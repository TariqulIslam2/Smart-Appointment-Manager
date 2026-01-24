import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { query } from "@/lib/db";
import bcrypt from "bcryptjs";

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email", placeholder: "email@example.com" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                // Demo user check
                if (credentials.email === "demo@example.com" && credentials.password === "demo123") {
                    return {
                        id: 1,
                        email: "demo@example.com",
                        name: "Demo User"
                    };
                }

                try {
                    // Find user in database
                    const users = await query(
                        "SELECT id, email, password FROM users WHERE email = ?",
                        [credentials.email]
                    );

                    if (users.length === 0) {
                        throw new Error("No user found with this email");
                    }

                    const user = users[0];

                    // Check password
                    const isValid = await bcrypt.compare(credentials.password, user.password);

                    if (!isValid) {
                        throw new Error("Invalid password");
                    }

                    return {
                        id: user.id,
                        email: user.email,
                        name: user.email.split('@')[0] // Use part of email as name
                    };
                } catch (error) {
                    console.error("Auth error:", error);
                    return null;
                }
            }
        })
    ],

    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.email = user.email;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id;
                session.user.email = token.email;
            }
            return session;
        }
    },

    pages: {
        signIn: "/auth/login",
        signUp: "/auth/signup",
        error: "/auth/error"
    },

    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },

    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };