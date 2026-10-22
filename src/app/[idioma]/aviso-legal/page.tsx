import LegalPage, { metadataLegal } from "@/components/content/LegalPage";

export const generateMetadata = () => metadataLegal("aviso-legal");

export default function AvisoLegalPage() {
  return <LegalPage slug="aviso-legal" />;
}
