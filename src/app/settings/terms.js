import { LegalDocument } from "../../components/LegalDocument";
import terms from "../../legal/terms.json";

export default function Terms() {
  return <LegalDocument doc={terms} onlinePath="terms.html" />;
}
