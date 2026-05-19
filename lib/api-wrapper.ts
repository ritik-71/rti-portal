import { NextResponse } from "next/server";
import { ZodError } from "zod";

export async function apiWrapper(handler: () => Promise<NextResponse>) {
  try {
    return await handler();
  } catch (error: any) {
    console.error("[API Error]:", error);

    if (error instanceof ZodError) {
      return NextResponse.json({
        error: "Validation failed",
        details: error.issues.map((e: any) => ({ path: e.path.join('.'), message: e.message }))
      }, { status: 400 });
    }

    // Generic error handling
    const status = error.status || 500;
    const message = error.message || "Internal Server Error";
    
    return NextResponse.json({ error: message }, { status });
  }
}
