"use server";

import { db } from "@/lib/db";
import { setSession } from "@/lib/auth";
import bcrypt from "bcryptjs";

async function ensureWorkspaceUser(username: string, password: string, name: string) {
  const passwordHash = await bcrypt.hash(password, 10);

  await db.workspaceUser.upsert({
    where: { username },
    update: {
      passwordHash,
      name,
      role: "ADMIN",
    },
    create: {
      username,
      passwordHash,
      name,
      role: "ADMIN",
    },
  });
}

async function seedConfiguredWorkspaceUser() {
  const username = process.env.WORKSPACE_SEED_USERNAME?.trim();
  const password = process.env.WORKSPACE_SEED_PASSWORD;
  const name = process.env.WORKSPACE_SEED_NAME?.trim() || "Workspace Admin";

  if (!username || !password) {
    return;
  }

  await ensureWorkspaceUser(username, password, name);
}

export async function adminLoginAction(prevState: unknown, formData: FormData) {
  const username = formData.get("username")?.toString().trim();
  const password = formData.get("password")?.toString();

  if (!username || !password) {
    return { error: "Username and password are required" };
  }

  try {
    await seedConfiguredWorkspaceUser();

    // Fetch the admin user. Initial workspace users should be created in the
    // database or through WORKSPACE_SEED_* environment variables.
    const admin = await db.workspaceUser.findUnique({
      where: { username },
    });

    if (!admin) {
      return { error: "Invalid username or password" };
    }

    // 3. Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);
    if (!isPasswordValid) {
      return { error: "Invalid username or password" };
    }

    // 4. Set session cookie
    await setSession({
      userId: admin.id,
      name: admin.name,
      email: admin.username.includes("@")
        ? admin.username
        : `${admin.username}@jobalert.bd`,
      role: "ADMIN",
    });

    return { success: true };
  } catch (error) {
    console.error("Admin login error:", error);
    return { error: "An unexpected error occurred. Please try again." };
  }
}
