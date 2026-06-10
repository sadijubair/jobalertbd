import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { setSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const origin = url.origin;

  if (!code) {
    return NextResponse.redirect(`${origin}/?error=no_code`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${origin}/api/auth/callback/google`;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${origin}/?error=auth_config_error`);
  }

  try {
    // 1. Exchange code for access token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokens = await tokenResponse.json();
    if (tokens.error) {
      console.error("Token exchange error:", tokens.error);
      return NextResponse.redirect(`${origin}/?error=token_exchange_failed`);
    }

    // 2. Fetch user profile from Google
    const profileResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    const profile = await profileResponse.json();
    if (!profile.email) {
      return NextResponse.redirect(`${origin}/?error=invalid_profile`);
    }

    // 3. Upsert user in the database
    let user = await db.user.findUnique({
      where: { email: profile.email },
    });

    if (!user) {
      user = await db.user.create({
        data: {
          email: profile.email,
          name: profile.name || profile.given_name || "User",
          avatar: profile.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profile.name || "U")}`,
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
    } else {
      // Update name/avatar if they changed
      user = await db.user.update({
        where: { id: user.id },
        data: {
          name: profile.name || user.name,
          avatar: profile.picture || user.avatar,
        },
      });
    }

    // 4. Set cookie session
    await setSession({
      userId: user.id,
      name: user.name || "User",
      email: user.email,
      role: "USER",
    });

    return NextResponse.redirect(`${origin}/app/dashboard`);
  } catch (error) {
    console.error("Google login error:", error);
    return NextResponse.redirect(`${origin}/?error=auth_failed`);
  }
}
