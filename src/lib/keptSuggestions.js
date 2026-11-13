// Hides the cheaper brand suggestions the shopper already turned down ("Keep mine", remembered on the basket line as
// `keptAlternatives: { [storeId]: [alternative slug] }`, found by the line's key, see lib/itemSize.js) and says how many were hidden. Pure, so any screen that reads
// suggestions sees the same list, and the "Save up to" figures never count a suggestion that is not shown.
import { lineId } from "./itemSize";

export function applyKept(data, items) {
  if (!data?.retailers) return data;
  const kept = {};
  for (const item of items) if (item.keptAlternatives) kept[lineId(item)] = item.keptAlternatives;
  let hiddenCount = 0;
  const retailers = data.retailers.map((retailer) => {
    const suggestions = retailer.suggestions.filter((s) => {
      const hidden = kept[s.slug]?.[retailer.id]?.includes(s.alternative.slug);
      if (hidden) hiddenCount += 1;
      return !hidden;
    });
    if (suggestions.length === retailer.suggestions.length) return retailer;
    const potentialSaving = Math.round(suggestions.reduce((sum, s) => sum + s.saving, 0) * 100) / 100;
    return { ...retailer, suggestions, potentialSaving };
  });
  return { ...data, retailers, hiddenCount };
}
