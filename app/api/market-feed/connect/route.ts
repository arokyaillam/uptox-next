import { NextResponse } from "next/server";
import WebSocket from "ws";
import protobuf from "protobufjs";
import path from "path";

// Load and prepare the Protobuf schema
const protoPath = path.join(process.cwd(), "app/api/market-feed/MarketDataFeedV3.proto");
let FeedResponse: protobuf.Type | null = null;

async function loadProto() {
  if (!FeedResponse) {
    const root = await protobuf.load(protoPath);
    FeedResponse = root.lookupType("com.upstox.marketdatafeederv3udapi.rpc.proto.FeedResponse");
  }
  return FeedResponse!;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const instrumentKey = searchParams.get("instrumentKey");

  if (!token) {
    return NextResponse.json({ error: "Token is required" }, { status: 400 });
  }

  if (!instrumentKey) {
    return NextResponse.json({ error: "Instrument key is required" }, { status: 400 });
  }

  // Step 1: Authorize with Upstox to get a temporary WS endpoint
  const authRes = await fetch("https://api.upstox.com/v3/feed/market-data-feed/authorize", {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!authRes.ok) {
    const text = await authRes.text();
    console.error("Authorization failed:", text);
    return NextResponse.json({ error: "Upstox authorization failed" }, { status: 401 });
  }

  const { data } = await authRes.json();
  const wsUrl = data.authorizedRedirectUri;

  console.log("🔗 Connecting to:", wsUrl);

  // Step 2: Create a readable SSE stream to the frontend
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const FeedResponseType = await loadProto();

        const ws = new WebSocket(wsUrl);

        ws.on("open", () => {
          console.log("✅ WS Connected to Upstox");

          const subMsg = {
            guid: "feed-guid-" + Date.now(),
            method: "sub",
            data: {
              mode: "full",
              instrumentKeys: [instrumentKey],
            },
          };

          ws.send(JSON.stringify(subMsg));
        });

        ws.on("message", (msg, isBinary) => {
          try {
            if (isBinary) {
              const decoded = FeedResponseType.decode(new Uint8Array(msg as Buffer));
              const json = FeedResponseType.toObject(decoded, {
                longs: String,
                enums: String,
                bytes: String,
              });
              controller.enqueue(`data: ${JSON.stringify(json)}\n\n`);
            } else {
              const text = msg.toString();
              controller.enqueue(`data: ${text}\n\n`);
            }
          } catch (err: any) {
            console.error("❌ Decode error:", err);
          }
        });

        ws.on("close", () => {
          controller.enqueue("event: end\ndata: disconnected\n\n");
          controller.close();
        });

        ws.on("error", (err) => {
          console.error("WS Error:", err);
          controller.enqueue(`event: error\ndata: ${err.message}\n\n`);
          controller.close();
        });
      } catch (error) {
        console.error("Stream error:", error);
        controller.enqueue(`event: error\ndata: ${String(error)}\n\n`);
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
