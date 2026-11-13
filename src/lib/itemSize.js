// The package size a basket line stands for: the one picked on the product screen (`sizeLabel`), else the size shown on
// the card it was quick-added from (`displaySize`, e.g. "2 L" next to the price and store on that card). The comparison
// prices this same package at every store, so what the basket shows is what gets compared.
export function chosenSize(item) {
  return item.sizeLabel ?? item.displaySize ?? undefined;
}

// What makes one basket line: the product AND its package size. The same product in two sizes (a 2 L bottle and a 12 pack of
// cans) is two lines, each with its own quantity, swaps and totals. The size is compared without spaces, case or the
// "about" sign ("≈175 g" is "175 g"). A line without any size is just the product, as baskets saved earlier have it.
// The server echoes this key back as each line's `slug`, so swaps and suggestions find their line again.
export function lineId(item) {
  const size = chosenSize(item);
  const key = size ? size.replace(/[≈~\s]/g, "").toLowerCase() : "";
  return key ? `${item.canonicalProductId}::${key}` : item.canonicalProductId;
}

// The line a product card stands for (a card shows one size: the one it adds).
export function cardLineId(product) {
  return lineId({ canonicalProductId: product.id, displaySize: product.sizeLabel });
}
