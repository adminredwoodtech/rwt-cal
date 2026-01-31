import crypto from "node:crypto";
import process from "node:process";
import { WEBAPP_URL } from "@calcom/lib/constants";
import logger from "@calcom/lib/logger";
import type { NextApiRequest, NextApiResponse } from "next";

const log = logger.getSubLogger({ prefix: ["hub-sso-login"] });

/**
 * Hub SSO Login Endpoint
 *
 * This endpoint is called by HappSea Hub to get an SSO login URL for Cal.com.
 * It validates the signed request and returns a URL that will authenticate the user.
 *
 * POST /api/auth/hub-sso/login
 * Body: { email, name, timestamp, signature }
 * Returns: { url: string }
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  // Read env var at request time, not module load time (important for containerized deployments)
  const hubSsoSecret = process.env.HUB_SSO_SECRET;

  log.info("Hub SSO request received", { hasSecret: !!hubSsoSecret, secretLength: hubSsoSecret?.length || 0 });

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!hubSsoSecret) {
    log.error("hubSsoSecret is not configured");
    return res.status(503).json({ error: "Hub SSO not configured" });
  }

  const { email, name, timestamp, signature } = req.body;

  if (!email || !timestamp || !signature) {
    return res.status(400).json({ error: "Missing required parameters" });
  }

  // Check timestamp is within 5 minutes (replay protection)
  const requestTime = parseInt(timestamp, 10) * 1000;
  const now = Date.now();
  if (Math.abs(now - requestTime) > 5 * 60 * 1000) {
    log.warn("Hub SSO request expired", { requestTime, now });
    return res.status(401).json({ error: "Request expired" });
  }

  // Validate signature: HMAC-SHA256 of "email:timestamp"
  const expectedSignature = crypto
    .createHmac("sha256", hubSsoSecret)
    .update(`${email}:${timestamp}`)
    .digest("hex");

  if (!crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(signature))) {
    log.warn("Hub SSO invalid signature", { email });
    return res.status(401).json({ error: "Invalid signature" });
  }

  // Generate the SSO callback URL with signed credentials
  // This URL will trigger the hub-sso NextAuth provider
  const ssoParams = new URLSearchParams({
    email,
    name: name || email.split("@")[0],
    timestamp,
    signature,
  });

  const ssoUrl = `${WEBAPP_URL}/api/auth/hub-sso/callback?${ssoParams.toString()}`;

  log.info("Hub SSO login URL generated", { email });

  return res.status(200).json({ url: ssoUrl });
}
