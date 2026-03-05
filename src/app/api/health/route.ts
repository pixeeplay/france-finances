import { NextResponse } from "next/server";
import { isDbAvailable } from "@/db";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    db: isDbAvailable(),
    timestamp: new Date().toISOString(),
  });
}
