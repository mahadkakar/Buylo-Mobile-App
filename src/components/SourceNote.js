import { Text } from "react-native";

import { RETAILER_META } from "../constants/retailers";
import config from "../legal/config.json";

// The retailers allowed use of their data on the condition that it is shown as
// coming from their website and not as our own product. This note says so,
// naming each retailer and its site, wherever prices/product details appear.
// `retailers` are display names ("Metro", "Walmart", ...); unknown names are
// listed without a domain.
export function SourceNote({ retailers, className = "" }) {
  const unique = [...new Set((retailers ?? []).filter(Boolean))];
  if (unique.length === 0) return null;

  const sources = unique
    .map((name) => {
      const domain = RETAILER_META[name]?.domain;
      return domain ? `${name} (${domain})` : name;
    })
    .join(", ");

  return (
    <Text className={`font-sans-medium text-[10.5px] text-muted leading-4 ${className}`}>
      Prices, product details and images come from the {unique.length === 1 ? "website" : "websites"} of {sources}
      {" "}and belong to {unique.length === 1 ? "that retailer" : "those retailers"}. They are not {config.appName}'s own
      products, and {config.appName} is not affiliated with them.
    </Text>
  );
}
