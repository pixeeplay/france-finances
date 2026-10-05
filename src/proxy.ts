import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/admin";

/**
 * Proxy (ex-middleware, Next 16, runtime Node.js) limite a /pixee-admin.
 *
 * Le garde du layout (`notFound()`) arrive trop tard : le `loading.tsx` racine
 * ouvre une frontiere Suspense, la reponse est deja en streaming avec un statut
 * 200 quand `notFound()` est appele. Ici, le controle a lieu avant tout rendu :
 * un non-admin est reecrit vers une route inexistante, ce qui rend la page 404
 * du site avec un vrai statut 404 (l'existence de l'admin n'est pas revelee).
 * Le garde du layout reste en place (defense en profondeur).
 */
export const proxy = auth((request) => {
  if (isAdmin(request.auth)) return NextResponse.next();
  return NextResponse.rewrite(new URL("/__introuvable", request.url), { status: 404 });
});

export const config = {
  matcher: ["/pixee-admin", "/pixee-admin/:path*"],
};
