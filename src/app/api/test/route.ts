import { NextResponse } from "next/server";
import { testConnection } from "@/lib/db";

export async function GET() {
  const connected = await testConnection();
  
  if (connected) {
    return NextResponse.json({ 
      status: "ok", 
      message: "✅ Database connected successfully!" 
    });
  } else {
    return NextResponse.json(
      { status: "error", message: " Database connection failed" },
      { status: 500 }
    );
  }
}