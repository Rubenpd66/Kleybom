import { ID_ADSENSE, lineaAdsTxt } from "@/lib/anuncios";

// ads.txt de AdSense. Solo existe si hay NEXT_PUBLIC_ADSENSE_ID; si no, 404.
export function GET() {
  if (!ID_ADSENSE) return new Response("Not found", { status: 404 });
  return new Response(lineaAdsTxt(ID_ADSENSE), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
