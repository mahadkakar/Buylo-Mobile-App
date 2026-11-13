import { useBasketStore } from "./basketStore";
import { useComparisonStore } from "./comparisonStore";
import { usePreferencesStore } from "./preferencesStore";

// Wipes what the app keeps on the device for the signed-in user. Called on sign-out (root _layout.js).
//
// Saved baskets are deliberately NOT cleared here: they stay on the phone after a log out. They belong to the account
// that saved them (savedBasketsStore.claimFor clears them if a different account signs in) and are removed when the
// account is deleted (settings/delete-account.js).
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
