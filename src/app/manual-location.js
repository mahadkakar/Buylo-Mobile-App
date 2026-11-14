import { confirmDialog, showNotice, showToast } from "../store/uiStore";
import { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Linking,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import { ArrowLeft, LocateFixed, MapPin } from "lucide-react-native";

import { colors } from "../theme/colors";
import { usePreferencesStore } from "../store/preferencesStore";
import { searchFsa, nearestFsaLabel } from "../lib/postalCode";
import { roundCoord } from "../lib/location";
import { neighbourhoodName } from "../lib/text";

const FSA_LABEL_MAX_KM = 40;
const LOCATION_TIMEOUT_MS = 15000;

function withTimeout(promise, ms) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error("timeout")), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

function offerSettings(title, message) {
  confirmDialog({
    title,
    message,
    confirmLabel: "Open Settings",
    cancelLabel: "Not now",
    icon: MapPin,
    onConfirm: () => Linking.openSettings(),
  });
}

export default function ManualLocation() {
  const router = useRouter();
  const location = usePreferencesStore((state) => state.location);
  const setLocation = usePreferencesStore((state) => state.setLocation);

  const [query, setQuery] = useState("");
  const [locating, setLocating] = useState(false);

  const results = useMemo(() => (query.trim() ? searchFsa(query) : []), [query]);

  const handleSelect = (entry) => {
    setLocation({ fsa: entry.fsa, label: `${entry.label} (${entry.fsa})`, lat: entry.lat, lng: entry.lng });
    showToast("Location updated");
    router.back();
  };

  const handleUseCurrentLocation = async () => {
    setLocating(true);
    try {
      if (!(await Location.hasServicesEnabledAsync())) {
        offerSettings(
          "Location is turned off",
          "Turn on location services on your phone, or search for your postal code below."
        );
        return;
      }
      const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        if (canAskAgain) {
          showNotice("Location permission denied", "Search for your postal code below instead.", { icon: MapPin });
        } else {
          offerSettings(
            "Location permission is off",
            "Allow location for this app in your phone's Settings, or search for your postal code below."
          );
        }
        return;
      }
      const position = await withTimeout(
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
        LOCATION_TIMEOUT_MS
      );
      const latitude = roundCoord(position.coords.latitude);
      const longitude = roundCoord(position.coords.longitude);
      const nearest = nearestFsaLabel(latitude, longitude);
      const labelled = nearest && nearest.distanceKm <= FSA_LABEL_MAX_KM;
      setLocation({
        fsa: labelled ? nearest.fsa : undefined,
        label: labelled ? `Near ${nearest.label}` : "Current location",
        lat: latitude,
        lng: longitude,
      });
      showToast("Location updated");
      router.back();
    } catch (error) {
      if (error?.message === "timeout") {
        showNotice("Couldn't find you in time", "Try again, or search for your postal code below.", { icon: MapPin });
      } else {
        showNotice("Something went wrong", "Search for your postal code below instead.", { tone: "danger" });
      }
    } finally {
      setLocating(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-base"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "android" ? 24 : 0}
    >
      <View className="flex-1 px-6 pt-16">
        <Pressable onPress={() => router.back()} hitSlop={6} className="w-10 h-10 items-center justify-center -ml-2 mb-6">
          <ArrowLeft color={colors.ink} size={22} />
        </Pressable>

        <Text className="font-sans-extrabold text-2xl text-ink mb-1">Set your location</Text>
        <Text className="font-sans-medium text-sm text-muted mb-6 leading-5">
          Pick a postal area or use your phone's location. We never track you after that.
        </Text>

        {location && (
          <View className="flex-row items-center gap-2 bg-accent-soft rounded-2xl px-4 py-3 mb-4">
            <MapPin color={colors.accent} size={16} />
            <Text className="font-sans-semibold text-sm text-accent flex-1" numberOfLines={1}>
              Currently: {neighbourhoodName(location.label)}
            </Text>
          </View>
        )}

        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search by postal code or neighbourhood"
          placeholderTextColor={colors.muted}
          autoCapitalize="characters"
          className="font-sans text-base text-ink bg-white border border-border rounded-2xl px-4 py-4 mb-3"
        />

        <Pressable
          onPress={handleUseCurrentLocation}
          disabled={locating}
          className="flex-row items-center justify-center gap-2 bg-white border border-border rounded-2xl py-4 mb-4 active:opacity-80"
        >
          {locating ? (
            <ActivityIndicator color={colors.accent} size="small" />
          ) : (
            <LocateFixed color={colors.accent} size={17} />
          )}
          <Text className="font-sans-bold text-sm text-accent">Use my current location</Text>
        </Pressable>

        <FlatList
          className="flex-1"
          data={results}
          keyExtractor={(item) => item.fsa}
          contentContainerStyle={{ gap: 6, paddingBottom: 24 }}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <Pressable
              onPress={() => handleSelect(item)}
              className="flex-row items-center justify-between bg-white border border-border rounded-xl px-4 py-3 active:opacity-80"
            >
              <Text className="font-sans-semibold text-sm text-ink flex-1 pr-2" numberOfLines={1}>
                {item.label}
              </Text>
              <Text className="font-mono text-xs text-muted">{item.fsa}</Text>
            </Pressable>
          )}
          ListEmptyComponent={
            <Text className="font-sans-medium text-sm text-muted text-center mt-6">
              {query.trim() ? `No GTA postal code matches "${query}"` : "Type a postal code or neighbourhood to search"}
            </Text>
          }
        />
      </View>
    </KeyboardAvoidingView>
  );
}
