import { NextResponse } from "next/server";
import { TOOL_SCHEMAS, callTool } from "@/lib/mcp/tools";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ── JSON-RPC types ──

interface JsonRpcRequest {
  jsonrpc: "2.0";
  id?: string | number | null;
  method: string;
  params?: Record<string, unknown>;
}

interface JsonRpcSuccess {
  jsonrpc: "2.0";
  id: string | number | null;
  result: unknown;
}

interface JsonRpcError {
  jsonrpc: "2.0";
  id: string | number | null;
  error: {
    code: number;
    message: string;
    data?: unknown;
  };
}

function success(id: string | number | null | undefined, result: unknown): JsonRpcSuccess {
  return { jsonrpc: "2.0", id: id ?? null, result };
}

function error(
  id: string | number | null | undefined,
  code: number,
  message: string,
  data?: unknown
): JsonRpcError {
  return { jsonrpc: "2.0", id: id ?? null, error: { code, message, data } };
}

const SERVER_INFO = {
  name: "ds-registry",
  version: "0.1.0",
};

const PROTOCOL_VERSION = "2024-11-05";

// ── Request handler ──

async function handleRequest(req: JsonRpcRequest): Promise<JsonRpcSuccess | JsonRpcError | null> {
  // Notifications have no id; do not respond
  const isNotification = req.id === undefined || req.id === null;

  switch (req.method) {
    case "initialize":
      return success(req.id, {
        protocolVersion: PROTOCOL_VERSION,
        capabilities: { tools: {} },
        serverInfo: SERVER_INFO,
      });

    case "notifications/initialized":
    case "notifications/cancelled":
      return null;

    case "ping":
      return success(req.id, {});

    case "tools/list":
      return success(req.id, { tools: TOOL_SCHEMAS });

    case "tools/call": {
      const params = req.params as
        | { name: string; arguments?: Record<string, unknown> }
        | undefined;
      if (!params?.name) {
        return error(req.id, -32602, "Invalid params: missing tool name");
      }
      try {
        const result = await callTool(params.name, params.arguments ?? {});
        return success(req.id, {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        return success(req.id, {
          content: [{ type: "text", text: `Error: ${msg}` }],
          isError: true,
        });
      }
    }

    default:
      if (isNotification) return null;
      return error(req.id, -32601, `Method not found: ${req.method}`);
  }
}

// ── HTTP handlers ──

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(error(null, -32700, "Parse error"), { status: 400 });
  }

  // Batch request (array)
  if (Array.isArray(body)) {
    const results = await Promise.all(
      (body as JsonRpcRequest[]).map((req) => handleRequest(req))
    );
    const responses = results.filter((r): r is JsonRpcSuccess | JsonRpcError => r !== null);
    // If all were notifications, return 202 with empty body
    if (responses.length === 0) {
      return new NextResponse(null, { status: 202 });
    }
    return NextResponse.json(responses);
  }

  // Single request
  const req = body as JsonRpcRequest;
  if (req.jsonrpc !== "2.0" || typeof req.method !== "string") {
    return NextResponse.json(error(null, -32600, "Invalid Request"), { status: 400 });
  }

  const response = await handleRequest(req);
  if (response === null) {
    return new NextResponse(null, { status: 202 });
  }
  return NextResponse.json(response);
}

export async function GET() {
  // Stateless server — no SSE stream to open
  return NextResponse.json({
    server: SERVER_INFO,
    protocol: PROTOCOL_VERSION,
    message:
      "DS Registry MCP server. Use POST with JSON-RPC 2.0 requests. See tools/list for available tools.",
  });
}
