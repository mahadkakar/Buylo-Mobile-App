import { useBasketStore } from "./basketStore";
import { useComparisonStore } from "./comparisonStore";
import { usePreferencesStore } from "./preferencesStore";

export function resetUserData() {
  useBasketStore.getState().clear();
  useComparisonStore.getState().dismiss();
  usePreferencesStore.setState({
    units: "metric",
    radiusKm: 5,
    suggestBrands: true,
    location: null,
    hasPromptedLocation: false,
  });
}
