import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const usePreferencesStore = create(
  persist(
    (set) => ({
      units: "metric", // "metric" | "imperial"
      radiusKm: 5,
      // Whether the comparison offers cheaper brands for the items in the basket.
      suggestBrands: true,
      // { fsa?, label, lat, lng } | null — lat/lng feed /api/comparison/ and
      // /api/stores/nearest/ directly; label is just for display. Set via
      // manual-location.js, either from the FSA picker (src/lib/postalCode.js)
      // or the device's GPS ("Use my current location").
      location: null,
      // Whether the dashboard has already auto-redirected to the location
      // picker once — a one-time nudge for new installs, not a recurring
      // prompt. Someone who backs out without picking a location still
      // sees this set to true (we only ask once); the dashboard's inline
      // "No location set yet" banner is the ongoing reminder after that.
      hasPromptedLocation: false,

      setUnits: (units) => set({ units }),
      setRadiusKm: (radiusKm) => set({ radiusKm }),
      setSuggestBrands: (suggestBrands) => set({ suggestBrands }),
      setLocation: (location) => set({ location }),
      setHasPromptedLocation: (hasPromptedLocation) => set({ hasPromptedLocation }),
    }),
    {
      name: "basket-compare-preferences",
      storage: createJSONStorage(() => AsyncStorage),
      // Bump `version` whenever the saved shape changes and convert old data in `migrate`; without it a phone that
      // saved the previous shape would load it as is.
      version: 2,
      // 2: the price drop alerts setting was removed.
      migrate: (saved) => {
        const { priceDropAlertsEnabled: _removed, ...rest } = saved ?? {};
        return rest;
      },
    }
  )
);
