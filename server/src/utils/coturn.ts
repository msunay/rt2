import crypto from "crypto";

export function generateTurnCredentials(staticAuthSecret: string, lifetimeSeconds = 86400) {
  const username = Math.floor(Date.now() / 1000) + lifetimeSeconds;
  const password = crypto.createHmac("sha1", staticAuthSecret).update(username.toString()).digest("base64");
  return { username: username.toString(), credential: password };
}
