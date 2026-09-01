import { NextResponse } from "next/server";
import { getDataSource } from "@/lib/db/data-source";

export async function GET() {
  try {
    const dataSource = await getDataSource();
    await dataSource.query("SELECT 1");
    return NextResponse.json({ status: "ok", database: "connected" });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        database: "disconnected",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
