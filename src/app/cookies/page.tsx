import LegalPage, { metadataLegal } from "@/components/content/LegalPage";
import { COOKIES } from "@/lib/legal/content";

export const metadata = metadataLegal(COOKIES);

export default function CookiesPage() {
  return <LegalPage texto={COOKIES} />;
}
