import { JWT } from "google-auth-library";

export function getAuth(): JWT {
  const privateKey = JSON.parse(process.env.GOOGLE_PRIVATE_KEY!).privateKey;
  return new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}
