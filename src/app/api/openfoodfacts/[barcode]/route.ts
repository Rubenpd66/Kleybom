import { esCodigoDeBarras, fetchOffProduct } from "@/lib/foods/openfoodfacts";

// Consulta en directo a Open Food Facts (ODbL). No se guarda nada en nuestra base.
export async function GET(_: Request, ctx: RouteContext<"/api/openfoodfacts/[barcode]">) {
  const { barcode } = await ctx.params;
  if (!esCodigoDeBarras(barcode)) {
    return Response.json({ ok: false, motivo: "codigo-no-valido" }, { status: 400 });
  }
  const r = await fetchOffProduct(barcode);
  if (r.ok) {
    return Response.json({ ...r, fuente: "Open Food Facts (ODbL)" }, { headers: { "Cache-Control": "public, max-age=86400" } });
  }
  const estado = r.motivo === "error" ? 502 : r.motivo === "no-encontrado" ? 404 : 422;
  return Response.json(r, { status: estado });
}
