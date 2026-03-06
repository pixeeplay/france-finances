import { isDbAvailable } from "@/db";
import { jsonOk } from "@/lib/api-utils";

export async function GET() {
  return jsonOk({
    status: "ok",
    db: isDbAvailable(),
    timestamp: new Date().toISOString(),
  });
}
