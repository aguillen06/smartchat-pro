import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const password = body?.password;

    const dashboardPassword = process.env.DASHBOARD_PASSWORD;

    if (!dashboardPassword) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { error: "Password required" },
        { status: 400 }
      );
    }

    if (password === dashboardPassword) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      );
    }
  } catch {
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
