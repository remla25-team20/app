import { NextResponse } from "next/server";
import { promises as fs } from "fs";

const VERSION_FILE = "/mnt/shared/models/selected.model";

export async function GET() {
  let version = "";
  try {
    version = (await fs.readFile(VERSION_FILE, "utf-8")).trim();
  } catch (err: unknown) {
    if (
      err instanceof Error &&
      (err as { code?: string }).code !== "ENOENT"
    ) {
      console.error("GET /api/version error:", err);
    }
  }
  return NextResponse.json({ version });
}

export async function POST(request: Request) {
  const { version } = await request.json();
  try {
    await fs.writeFile(VERSION_FILE, version, "utf-8");
  } catch (err: unknown) {
    console.error("POST /api/version error:", err);
    return NextResponse.json(
      { error: "Could not save version" },
      { status: 500 }
    );
  }
  return NextResponse.json({ version });
}
