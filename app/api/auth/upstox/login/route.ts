import { NextResponse } from "next/server";

export async function GET() {
  const authUrl = `https://api.upstox.com/v2/login/authorization/dialog?response_type=code&client_id=${process.env.UPSTOX_API_KEY}&redirect_uri=${process.env.UPSTOX_REDIRECT_URI}`;
  return NextResponse.redirect(authUrl);
}
