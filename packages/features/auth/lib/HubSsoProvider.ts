import crypto from "node:crypto";
import process from "node:process";
import { ProfileRepository } from "@calcom/features/profile/repositories/ProfileRepository";
import logger from "@calcom/lib/logger";
import { safeStringify } from "@calcom/lib/safeStringify";
import slugify from "@calcom/lib/slugify";
import prisma from "@calcom/prisma";
import { CreationSource, IdentityProvider } from "@calcom/prisma/enums";
import CredentialsProvider from "next-auth/providers/credentials";

const log = logger.getSubLogger({ prefix: ["hub-sso-provider"] });

const HUB_SSO_SECRET = process.env.HUB_SSO_SECRET;

export const IS_HUB_SSO_ENABLED = !!HUB_SSO_SECRET;

interface HubSsoCredentials {
  email: string;
  name: string;
  timestamp: string;
  signature: string;
}

/**
 * Validate the signature from HappSea Hub
 */
function validateHubSignature(email: string, timestamp: string, signature: string): boolean {
  if (!HUB_SSO_SECRET) {
    log.error("HUB_SSO_SECRET is not configured");
    return false;
  }

  // Check timestamp is within 5 minutes (replay protection)
  const requestTime = parseInt(timestamp, 10) * 1000;
  const now = Date.now();
  if (Math.abs(now - requestTime) > 5 * 60 * 1000) {
    log.warn("Hub SSO request expired", { requestTime, now });
    return false;
  }

  // Validate signature: HMAC-SHA256 of "email:timestamp"
  const expectedSignature = crypto
    .createHmac("sha256", HUB_SSO_SECRET)
    .update(`${email}:${timestamp}`)
    .digest("hex");

  return crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(signature));
}

/**
 * Find or create a user for Hub SSO
 */
async function findOrCreateUser(email: string, name: string) {
  // Try to find existing user
  let user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: {
      id: true,
      username: true,
      email: true,
      name: true,
      role: true,
      locale: true,
      completedOnboarding: true,
    },
  });

  if (user) {
    log.debug("Hub SSO: Found existing user", { userId: user.id, email });
    return user;
  }

  // Create new user
  const username = `${slugify(name)}-${Math.random().toString(36).substring(2, 8)}`;

  user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      username,
      name,
      emailVerified: new Date(),
      identityProvider: IdentityProvider.CAL,
      identityProviderId: email.toLowerCase(),
      completedOnboarding: true, // Skip onboarding for SSO users
      creationSource: CreationSource.WEBAPP,
    },
    select: {
      id: true,
      username: true,
      email: true,
      name: true,
      role: true,
      locale: true,
      completedOnboarding: true,
    },
  });

  log.info("Hub SSO: Created new user", { userId: user.id, email, username });
  return user;
}

/**
 * HappSea Hub SSO Provider
 * Allows users to authenticate via signed tokens from HappSea Hub
 */
const HubSsoProvider = CredentialsProvider({
  id: "hub-sso",
  name: "HappSea Hub SSO",
  type: "credentials",
  credentials: {
    email: { type: "text" },
    name: { type: "text" },
    timestamp: { type: "text" },
    signature: { type: "text" },
  },
  async authorize(credentials): Promise<any> {
    log.debug("Hub SSO authorize called", safeStringify({ email: credentials?.email }));

    if (!credentials?.email || !credentials?.timestamp || !credentials?.signature) {
      log.warn("Hub SSO: Missing required credentials");
      throw new Error("Missing required credentials");
    }

    const { email, name, timestamp, signature } = credentials as HubSsoCredentials;

    // Validate the signature from Hub
    if (!validateHubSignature(email, timestamp, signature)) {
      log.warn("Hub SSO: Invalid signature", { email });
      throw new Error("Invalid signature");
    }

    // Find or create the user
    const user = await findOrCreateUser(email, name || email.split("@")[0]);

    // Get user's profile
    const allProfiles = await ProfileRepository.findAllProfilesForUserIncludingMovedUser({
      id: user.id,
      username: user.username,
    });

    const profile = allProfiles[0];

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      username: user.username,
      role: user.role,
      locale: user.locale,
      profile,
      belongsToActiveTeam: false,
    };
  },
});

export default HubSsoProvider;
