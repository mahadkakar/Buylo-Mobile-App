// Per-query staleTime/gcTime policy — see the agreed plan (saved to
// project memory as "caching_plan_react_query") for the full reasoning
// per query. Centralized here so the numbers used in src/api/*.js trace
// back to one place instead of being re-typed as magic numbers.
const MINUTE = 60 * 1000;

// Catalog structure (names/categories/which products exist) only changes
// after a manual scrape+rematch run, not continuously — safe to treat as
// good for a while.
export const CATALOG_CACHE = { staleTime: 15 * MINUTE, gcTime: 60 * MINUTE };

// Product detail includes live prices — shorter than catalog browsing,
// since a shopper re-opening a product expects a current price.
export const PRODUCT_DETAIL_CACHE = { staleTime: 5 * MINUTE, gcTime: 30 * MINUTE };

// Store distance is static per location; lastScrapedAt freshness changes
// per scrape — moderate staleTime, and already keyed by lat/lng so a
// location change naturally refetches regardless of staleTime.
export const NEAREST_STORES_CACHE = { staleTime: 10 * MINUTE, gcTime: 30 * MINUTE };

// Live basket availability/totals — the one query where staleness is
// actively misleading (shows a wrong "cheapest store" claim), so this
// gets the shortest leash. Already keyed by basket contents + location.
export const COMPARISON_CACHE = { staleTime: 1 * MINUTE, gcTime: 5 * MINUTE };
