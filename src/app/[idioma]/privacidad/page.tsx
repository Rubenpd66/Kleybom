import LegalPage, { metadataLegal } from "@/components/content/LegalPage";

export const generateMetadata = () => metadataLegal("privacidad");

export default function PrivacidadPage() {
  return <LegalPage slug="privacidad" />;
}
