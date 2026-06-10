"use server";

import { db } from "@/lib/db";
import { setSession } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function adminLoginAction(prevState: any, formData: FormData) {
  const username = formData.get("username")?.toString().trim();
  const password = formData.get("password")?.toString();

  if (!username || !password) {
    return { error: "Username and password are required" };
  }

  try {
    // 1. Check if we need to seed the default admin
    const adminCount = await db.workspaceUser.count();
    if (adminCount === 0) {
      // Seed default admin: admin / admin123
      const hashedPassword = await bcrypt.hash("admin123", 10);
      await db.workspaceUser.create({
        data: {
          username: "admin",
          passwordHash: hashedPassword,
          name: "Workspace Admin",
          role: "ADMIN",
        },
      });
    }

    // 2. Fetch the admin user
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
      email: `${admin.username}@jobalert.bd`,
      role: "ADMIN",
    });

    return { success: true };
  } catch (error) {
    console.error("Admin login error:", error);
    return { error: "An unexpected error occurred. Please try again." };
  }
}
