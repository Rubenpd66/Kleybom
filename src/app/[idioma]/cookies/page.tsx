import LegalPage, { metadataLegal } from "@/components/content/LegalPage";

export const generateMetadata = () => metadataLegal("cookies");

export default function CookiesPage() {
  return <LegalPage slug="cookies" />;
}
