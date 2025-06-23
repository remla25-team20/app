
import { readdir } from "fs/promises";
import path from "path";

export async function GET() {
  const MODELS_DIR = "/mnt/shared/models";
  try {
    const entries = await readdir(MODELS_DIR, { withFileTypes: true });
    const modelTags = entries
      .filter((e) => e.isDirectory())
      .map((e) => e.name);

    return new Response(JSON.stringify({ models: modelTags }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Failed to list models:", err);
    return new Response(JSON.stringify({ error: "Could not list models" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
