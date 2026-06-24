import { NextRequest } from "next/server";
import { runAgent } from "@/lib/agent/graph";

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const { companyName } = await req.json();

  if (!companyName || typeof companyName !== "string") {
    return new Response("Company name required", { status: 400 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      try {
        send("log", { message: `Starting research on ${companyName}...` });
        const result = await runAgent(companyName, (message) => send("log", { message }));

        if (result.error) {
          send("error", { message: result.error });
        }

        if (result.verdict) {
          send("verdict", { verdict: result.verdict });
        } else {
          send("error", { message: "No verdict produced" });
        }
      } catch (err) {
        send("error", { message: err instanceof Error ? err.message : "Unknown error" });
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
