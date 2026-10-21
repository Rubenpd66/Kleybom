import LegalPage, { metadataLegal } from "@/components/content/LegalPage";
import { PRIVACIDAD } from "@/lib/legal/content";

export const metadata = metadataLegal(PRIVACIDAD);

export default function PrivacidadPage() {
  return <LegalPage texto={PRIVACIDAD} />;
}
