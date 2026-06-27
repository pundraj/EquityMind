import { NextRequest } from "next/server";
import { runAgent } from "@/lib/agent/graph";

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const { companyName } = await req.json();
  console.log(`[API REQUEST] POST /api/research - Company: ${companyName}`);

  if (!companyName || typeof companyName !== "string") {
    console.warn(`[API WARN] POST /api/research - Missing or invalid companyName`);
    return new Response("Company name required", { status: 400 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      try {
        send("log", { message: `[START] Initiating equity research for ${companyName}` });
        const result = await runAgent(companyName, (message) => send("log", { message }));

        if (result.error) {
          console.error(`[API ERROR] POST /api/research - Agent returned error for ${companyName}: ${result.error}`);
          try {
            const parsed = JSON.parse(result.error);
            if (parsed.error === "NOT_FOUND") {
              send("suggestions", parsed);
            } else {
              send("error", { message: result.error });
            }
          } catch {
            send("error", { message: result.error });
          }
        } else if (result.verdict) {
          console.log(`[API SUCCESS] POST /api/research - Completed research for ${companyName} (${result.ticker}) in ${Date.now() - startTime}ms`);
          send("verdict", { 
            verdict: {
              ...result.verdict,
              ticker: result.ticker,
              companyName: result.companyName
            }
          });
        } else {
          console.error(`[API ERROR] POST /api/research - Agent produced no verdict for ${companyName}`);
          send("error", { message: "No verdict produced" });
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Unknown error";
        console.error(`[API ERROR] POST /api/research - Execution failed for ${companyName}: ${errorMsg}`);
        send("error", { message: errorMsg });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
