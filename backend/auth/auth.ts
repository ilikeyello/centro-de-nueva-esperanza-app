import { Cookie, Gateway, Header } from "encore.dev/api";
import { authHandler } from "encore.dev/auth";

export interface AuthData {
  userID: string;
  imageUrl: string;
  email: string | null;
}

interface AuthParams {
  authorization?: Header<"Authorization">;
  session?: Cookie<"session">;
}

export const auth = authHandler<AuthParams, AuthData>(async () => ({
  userID: "public-user",
  imageUrl: "",
  email: null,
}));

export const gw = new Gateway({ authHandler: auth });
