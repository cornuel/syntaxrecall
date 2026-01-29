import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    backendToken?: string; // Custom property on session root
    user: {
      id?: string | number | null;
      backendToken?: string; // Keep this just in case
    } & DefaultSession["user"];
  }

  interface User {
    backendToken?: string; // Our custom property
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    backendToken?: string; // Our custom property
  }
}
