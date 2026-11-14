import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const usePreferencesStore = create(
  persist(
    (set) => ({
      units: "metric",
      radiusKm: 5,
      suggestBrands: true,
      location: null,
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
      version: 2,
      migrate: (saved) => {
        const { priceDropAlertsEnabled: _removed, ...rest } = saved ?? {};
        return rest;
      },
    }
  )
);
