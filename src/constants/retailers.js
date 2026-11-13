// Maps a retailer's display name (as used throughout the mock data) to its
// route id, short badge mark, and the website its product data comes from.
// `domain` feeds the source attribution the retailers asked for (see
// components/SourceNote.js): shown prices and product details must be
// presented as coming from the retailer's website, not as our own product.
export const RETAILER_META = {
  "Food Basics": { id: "food-basics", mark: "FB", domain: "foodbasics.ca" },
  Metro: { id: "metro", mark: "MT", domain: "metro.ca" },
  Walmart: { id: "walmart", mark: "WM", domain: "walmart.ca" },
};
