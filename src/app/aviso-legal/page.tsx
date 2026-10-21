import LegalPage, { metadataLegal } from "@/components/content/LegalPage";
import { AVISO_LEGAL } from "@/lib/legal/content";

export const metadata = metadataLegal(AVISO_LEGAL);

export default function AvisoLegalPage() {
  return <LegalPage texto={AVISO_LEGAL} />;
}
