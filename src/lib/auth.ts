import { cookies } from "next/headers";
import crypto from "crypto";
import { db } from "./db";

const SESSION_COOKIE_NAME = "jobalert_session";
// Ensure we have a 32-byte secret. Fallback only for local dev.
const SECRET = process.env.SESSION_SECRET || "12345678901234567890123456789012";
const ALGORITHM = "aes-256-cbc";

interface SessionUser {
  userId: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
}

// Encrypt string using AES-256-CBC
function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(SECRET), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

// Decrypt string
function decrypt(text: string): string {
  try {
    const textParts = text.split(":");
    const ivHex = textParts.shift();
    if (!ivHex) return "";
    const iv = Buffer.from(ivHex, "hex");
    const encryptedText = Buffer.from(textParts.join(":"), "hex");
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(SECRET), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (error) {
    return "";
  }
}

export async function setSession(user: SessionUser) {
  const sessionString = JSON.stringify(user);
  const encrypted = encrypt(sessionString);
  
  const cookieStore = await cookies();
  cookieStore.set({
    name: SESSION_COOKIE_NAME,
    value: encrypted,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    sameSite: "lax",
  });
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
    if (!sessionCookie || !sessionCookie.value) return null;
    
    const decrypted = decrypt(sessionCookie.value);
    if (!decrypted) return null;
    
    const session = JSON.parse(decrypted) as SessionUser;
    
    // Verify user/admin exists in the database
    if (session.role === "ADMIN") {
      const admin = await db.workspaceUser.findUnique({
        where: { id: session.userId },
      });
      if (!admin) return null;
    } else {
      const user = await db.user.findUnique({
        where: { id: session.userId },
      });
      if (!user) return null;
    }
    
    return session;
  } catch (error) {
    return null;
  }
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
