import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { setSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const origin = url.origin;
  
  // Find or create dev user
  let user = await db.user.findUnique({
    where: { email: "dev@jobalert.bd" },
  });

  if (!user) {
    user = await db.user.create({
      data: {
        email: "dev@jobalert.bd",
        name: "Dev Tracker",
        avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=dev",
        preferences: {
          create: {
            newJobsEnabled: true,
            deadline15Days: true,
            deadline7Days: true,
            deadline3Days: true,
            deadlineToday: true,
            inAppEnabled: true,
            pushEnabled: true,
            emailEnabled: true,
          },
        },
      },
    });
  }

  // Set cookie session
  await setSession({
    userId: user.id,
    name: user.name || "User",
    email: user.email,
    role: "USER",
  });

  // Redirect to dashboard
  return NextResponse.redirect(`${origin}/app/dashboard`);
}
