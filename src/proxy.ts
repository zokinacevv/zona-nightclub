import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const blockedContinents = new Set(["AF", "AS"]);

export function proxy(request: NextRequest) {
  const continent = request.headers.get("x-vercel-ip-continent");

  // Vercel supplies this header in deployed environments. Keep local
  // development and non-Vercel deployments accessible when it is absent.
  if (continent && blockedContinents.has(continent.toUpperCase())) {
    return new NextResponse("Access denied", {
      status: 403,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
