import { LegalDocument } from "../../components/LegalDocument";
import privacy from "../../legal/privacy.json";

export default function PrivacyPolicy() {
  return <LegalDocument doc={privacy} onlinePath="privacy.html" />;
}
