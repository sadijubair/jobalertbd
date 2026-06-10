import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  
  // Get base URL dynamically
  const url = new URL(request.url);
  const origin = url.origin;
  
  if (!googleClientId) {
    // If Google login is not configured, redirect to mock login for local testing
    return NextResponse.redirect(`${origin}/api/auth/mock`);
  }

  const redirectUri = `${origin}/api/auth/callback/google`;
  const googleOAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${googleClientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&scope=openid%20email%20profile&prompt=select_account`;

  return NextResponse.redirect(googleOAuthUrl);
}
