import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/user.model";
import { IUser } from "@/types/user";

export interface SyncUserParams {
  email: string;
  name?: string | null;
  image?: string | null;
  googleId?: string | null;
  accessToken?: string | null;
  refreshToken?: string | null;
  expiresAt?: number | null; // seconds timestamp from OAuth
  scope?: string | null;
}

/**
 * Upserts user profile on authentication and updates Gmail tokens if granted.
 */
export async function syncUserOnLogin(params: SyncUserParams): Promise<IUser | null> {
  await connectDB();

  const email = params.email.toLowerCase().trim();
  const existingUser = await User.findOne({ email });

  const hasGmailScope = Boolean(params.scope && params.scope.includes("gmail.readonly"));

  const updateData: Partial<IUser> = {
    name: params.name || existingUser?.name || "",
    image: params.image || existingUser?.image || "",
    googleId: params.googleId || existingUser?.googleId,
  };

  if (hasGmailScope) {
    updateData.gmailConnected = true;
    updateData.gmailEmail = email;
    if (params.accessToken) {
      updateData.gmailAccessToken = params.accessToken;
    }
    if (params.refreshToken) {
      updateData.gmailRefreshToken = params.refreshToken;
    }
    if (params.expiresAt) {
      updateData.gmailTokenExpiresAt = params.expiresAt * 1000;
    }
  }

  const updatedUser = await User.findOneAndUpdate(
    { email },
    { $set: updateData },
    { upsert: true, new: true, runValidators: true }
  ).lean();

  return updatedUser ? JSON.parse(JSON.stringify(updatedUser)) : null;
}

/**
 * Retrieves user profile by email.
 */
export async function getUserByEmail(email: string): Promise<IUser | null> {
  await connectDB();
  const user = await User.findOne({ email: email.toLowerCase().trim() }).lean();
  return user ? JSON.parse(JSON.stringify(user)) : null;
}

/**
 * Disconnects Gmail integration for a user.
 */
export async function disconnectGmail(email: string): Promise<boolean> {
  await connectDB();
  const res = await User.updateOne(
    { email: email.toLowerCase().trim() },
    {
      $set: {
        gmailConnected: false,
        gmailAccessToken: undefined,
        gmailRefreshToken: undefined,
        gmailTokenExpiresAt: undefined,
      },
    }
  );
  return res.modifiedCount > 0;
}

/**
 * Retrieves a valid Gmail access token for the user, automatically refreshing it if expired.
 */
export async function getValidGmailAccessToken(email: string): Promise<string | null> {
  await connectDB();
  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user || !user.gmailConnected) {
    return null;
  }

  const now = Date.now();
  const isExpiringSoon = user.gmailTokenExpiresAt
    ? user.gmailTokenExpiresAt - now < 5 * 60 * 1000 // less than 5 minutes left
    : true;

  // If token is still fresh, return it
  if (user.gmailAccessToken && !isExpiringSoon) {
    return user.gmailAccessToken;
  }

  // If expired or missing, attempt refresh using refresh_token
  if (!user.gmailRefreshToken) {
    return null;
  }

  try {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.AUTH_GOOGLE_ID || "",
        client_secret: process.env.AUTH_GOOGLE_SECRET || "",
        grant_type: "refresh_token",
        refresh_token: user.gmailRefreshToken,
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.access_token) {
      return null;
    }

    user.gmailAccessToken = data.access_token;
    user.gmailTokenExpiresAt = now + (data.expires_in || 3600) * 1000;
    await user.save();

    return user.gmailAccessToken || null;
  } catch {
    return null;
  }
}
