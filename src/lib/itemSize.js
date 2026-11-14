export function chosenSize(item) {
  return item.sizeLabel ?? item.displaySize ?? undefined;
}

export function lineId(item) {
  const size = chosenSize(item);
  const key = size ? size.replace(/[≈~\s]/g, "").toLowerCase() : "";
  return key ? `${item.canonicalProductId}::${key}` : item.canonicalProductId;
}

export function cardLineId(product) {
  return lineId({ canonicalProductId: product.id, displaySize: product.sizeLabel });
}
