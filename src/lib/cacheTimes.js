const MINUTE = 60 * 1000;

export const CATALOG_CACHE = { staleTime: 15 * MINUTE, gcTime: 60 * MINUTE };

export const PRODUCT_DETAIL_CACHE = { staleTime: 5 * MINUTE, gcTime: 30 * MINUTE };

export const NEAREST_STORES_CACHE = { staleTime: 10 * MINUTE, gcTime: 30 * MINUTE };

export const COMPARISON_CACHE = { staleTime: 1 * MINUTE, gcTime: 5 * MINUTE };
