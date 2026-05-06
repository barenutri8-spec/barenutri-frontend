import { NextRequest, NextResponse } from "next/server";
import { resolveBackendApiV1Base } from "@/lib/api";

const HOP_BY_HOP = new Set([
  "connection",
  "content-length",
  "host",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

async function proxyRequest(req: NextRequest, segments: string[]) {
  const path = segments.join("/");
  const target = `${resolveBackendApiV1Base()}/${path}${req.nextUrl.search}`;

  const headers = new Headers();
  req.headers.forEach((value, key) => {
    if (!HOP_BY_HOP.has(key.toLowerCase())) {
      headers.set(key, value);
    }
  });

  const init: RequestInit = {
    method: req.method,
    headers,
  };

  if (!["GET", "HEAD"].includes(req.method)) {
    const buf = await req.arrayBuffer();
    if (buf.byteLength > 0) init.body = buf;
  }

  const res = await fetch(target, init);
  const body = await res.arrayBuffer();
  const out = new NextResponse(body, { status: res.status });

  res.headers.forEach((value, key) => {
    const lk = key.toLowerCase();
    if (
      lk === "content-encoding" ||
      lk === "transfer-encoding" ||
      lk.startsWith("access-control-")
    ) {
      return;
    }
    out.headers.set(key, value);
  });

  return out;
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ segments: string[] }> }
) {
  const { segments } = await ctx.params;
  return proxyRequest(req, segments);
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ segments: string[] }> }
) {
  const { segments } = await ctx.params;
  return proxyRequest(req, segments);
}

export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ segments: string[] }> }
) {
  const { segments } = await ctx.params;
  return proxyRequest(req, segments);
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ segments: string[] }> }
) {
  const { segments } = await ctx.params;
  return proxyRequest(req, segments);
}

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ segments: string[] }> }
) {
  const { segments } = await ctx.params;
  return proxyRequest(req, segments);
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
