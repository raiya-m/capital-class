import { NextResponse, type NextRequest } from "next/server";
import { updateSupabaseSession } from "@/lib/supabase/middleware";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get("cc_session")?.value;
  const isTeacher = pathname.startsWith("/teacher");
  const isStudent = pathname.startsWith("/student");
  const isAdmin = pathname.startsWith("/admin");

  if ((isTeacher || isStudent || isAdmin) && !session) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return updateSupabaseSession(request);
}

export const config = {
  matcher: ["/teacher/:path*", "/student/:path*", "/admin/:path*", "/login", "/signup"],
};
