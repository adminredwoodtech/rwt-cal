import { WEBAPP_URL } from "@calcom/lib/constants";
import type { NextApiRequest, NextApiResponse } from "next";

/**
 * Hub SSO Callback Endpoint
 *
 * This endpoint is loaded by the browser (via redirect from Hub).
 * It triggers the hub-sso NextAuth provider with the signed credentials.
 *
 * GET /api/auth/hub-sso/callback
 * Query: { email, name, timestamp, signature }
 * Redirects to NextAuth signIn
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, name, timestamp, signature } = req.query;

  if (!email || !timestamp || !signature) {
    return res.status(400).json({ error: "Missing required parameters" });
  }

  // Redirect to NextAuth's signIn endpoint with hub-sso provider
  // NextAuth will call the hub-sso provider's authorize function
  const params = new URLSearchParams({
    email: String(email),
    name: String(name || ""),
    timestamp: String(timestamp),
    signature: String(signature),
    callbackUrl: `${WEBAPP_URL}/bookings`,
  });

  // Use the credentials signIn URL format
  const _signInUrl = `${WEBAPP_URL}/api/auth/callback/credentials?${params.toString()}`;

  // Actually, for credentials providers, we need to POST to the signIn endpoint
  // Let's render a simple HTML form that auto-submits

  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>HappSea SSO - Redirecting...</title>
</head>
<body>
  <p>Signing you in to Cal.com...</p>
  <form id="ssoForm" method="POST" action="${WEBAPP_URL}/api/auth/callback/hub-sso">
    <input type="hidden" name="email" value="${String(email)}" />
    <input type="hidden" name="name" value="${String(name || "")}" />
    <input type="hidden" name="timestamp" value="${String(timestamp)}" />
    <input type="hidden" name="signature" value="${String(signature)}" />
    <input type="hidden" name="callbackUrl" value="${WEBAPP_URL}/bookings" />
    <input type="hidden" name="csrfToken" value="" />
  </form>
  <script>
    // Get CSRF token and submit form
    fetch('${WEBAPP_URL}/api/auth/csrf')
      .then(r => r.json())
      .then(data => {
        document.querySelector('input[name="csrfToken"]').value = data.csrfToken;
        document.getElementById('ssoForm').submit();
      })
      .catch(err => {
        console.error('SSO Error:', err);
        window.location = '${WEBAPP_URL}/auth/login?error=sso_failed';
      });
  </script>
</body>
</html>
`;

  res.setHeader("Content-Type", "text/html");
  return res.status(200).send(html);
}
