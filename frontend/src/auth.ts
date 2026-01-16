import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import axios from "axios"

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api"
const INTERNAL_AUTH_SECRET = process.env.INTERNAL_AUTH_SECRET || "handshake-secret"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [GitHub],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "github") {
        try {
          // Exchange GitHub profile for backend JWT
          const response = await axios.post(`${BACKEND_URL}/auth/github-exchange`, {
            email: user.email,
            github_id: user.id,
            username: profile?.login || user.name,
            avatar_url: user.image,
            shared_secret: INTERNAL_AUTH_SECRET
          })
          
          if (response.data.access_token) {
            // We can't easily pass the token here to the session, 
            // but we can store it in the user object which passes to the jwt callback
            user.backendToken = response.data.access_token
            return true
          }
        } catch (error) {
          console.error("Backend auth exchange failed:", error)
          return false
        }
      }
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.backendToken = (user as any).backendToken
      }
      return token
    },
    async session({ session, token }) {
      if (token.backendToken) {
        (session as any).backendToken = token.backendToken
      }
      return session
    }
  }
})
