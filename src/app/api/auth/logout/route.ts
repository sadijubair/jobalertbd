import { NextRequest, NextResponse } from "next/server";
import { clearSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const origin = url.origin;
  
  await clearSession();
  
  return NextResponse.redirect(`${origin}/`);
}
