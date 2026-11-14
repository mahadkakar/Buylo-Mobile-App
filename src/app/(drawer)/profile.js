import { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Pencil,
  Check,
  X,
  BadgeCheck,
  Leaf,
  CalendarDays,
  MapPin,
  Ruler,
  HelpCircle,
  Bell,
  Lock,
  ShieldCheck,
  FileText,
  Trash2,
  LogOut,
  ChevronRight,
  CheckCircle2,
} from "lucide-react-native";

import { colors } from "../../theme/colors";
import { AppHeader } from "../../components/AppHeader";
import { BottomNav } from "../../components/BottomNav";
import { supabase } from "../../api/supabase";
import { logOut } from "../../lib/session";
import { tapSuccess } from "../../lib/haptics";
import { confirmDialog, showNotice, showToast } from "../../store/uiStore";
import { useAuthStore } from "../../store/authStore";
import { usePreferencesStore } from "../../store/preferencesStore";
import { APP_NAME } from "../../lib/brand";
import { neighbourhoodName } from "../../lib/text";
import { ignoreParentRenders } from "../../lib/ignoreParentRenders";

function memberSince(createdAt) {
  if (!createdAt) return null;
  return new Date(createdAt).toLocaleDateString("en-CA", { month: "short", year: "numeric" });
}

function SectionCard({ title, eyebrow, children }) {
  return (
    <View className="gap-2.5">
      {title && (
        <View className="flex-row items-center justify-between px-1">
          <Text className="font-sans-bold text-base text-ink">{title}</Text>
          {eyebrow && <Text className="font-sans-bold text-[10.5px] text-accent uppercase tracking-wide">{eyebrow}</Text>}
        </View>
      )}
      <View className="bg-white border border-border rounded-2xl overflow-hidden">{children}</View>
    </View>
  );
}

const PHONE_PATTERN = /^\+?[\d\s().-]{7,20}$/;

function ToggleRow({ label, description, value, onValueChange, isLast }) {
  return (
    <View className={`flex-row items-center justify-between px-4 py-3.5 ${isLast ? "" : "border-b border-border"}`}>
      <View className="flex-1 pr-3">
        <Text className="font-sans-semibold text-[13.5px] text-ink">{label}</Text>
        {description && <Text className="font-sans-medium text-[11px] text-muted mt-0.5">{description}</Text>}
      </View>
      <Pressable
        onPress={() => onValueChange(!value)}
        hitSlop={{ top: 14, bottom: 14, left: 8, right: 8 }}
        className="w-12 h-7 rounded-full justify-center px-0.5"
        style={{ backgroundColor: value ? colors.accent : "#E4E4EE" }}
      >
        <View
          className="w-6 h-6 rounded-full bg-white"
          style={{ transform: [{ translateX: value ? 20 : 0 }] }}
        />
      </Pressable>
    </View>
  );
}

function EditableField({ label, value, placeholder, keyboardType, onSave, isLast }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? "");
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(null);
  useEffect(() => setJustSaved(null), [value]);

  const startEditing = () => {
    setDraft(value ?? "");
    setEditing(true);
  };

  const save = async () => {
    if (saving) return;
    const next = draft.trim();
    if (next === (value ?? "")) {
      setEditing(false);
      return;
    }
    setSaving(true);
    const ok = await onSave(next);
    setSaving(false);
    if (ok) {
      setJustSaved(next);
      setEditing(false);
      tapSuccess();
      showToast(`${label} saved`);
    }
  };

  const shown = justSaved ?? value;

  return (
    <View className={`px-4 py-3.5 ${isLast ? "" : "border-b border-border"}`}>
      <Text className="font-sans-semibold text-[11px] text-muted mb-1.5">{label}</Text>
      {editing ? (
        <View className="flex-row items-center gap-2">
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder={placeholder}
            placeholderTextColor={colors.muted}
            keyboardType={keyboardType}
            editable={!saving}
            autoFocus
            className="flex-1 font-sans text-[15px] text-ink bg-base rounded-lg px-3 py-2"
            style={{ opacity: saving ? 0.6 : 1 }}
          />
          <Pressable
            onPress={save}
            disabled={saving}
            hitSlop={6}
            className="w-9 h-9 rounded-lg bg-savings items-center justify-center"
            style={{ opacity: saving ? 0.85 : 1 }}
          >
            {saving ? <ActivityIndicator color="#fff" size="small" /> : <Check color="#fff" size={17} />}
          </Pressable>
          <Pressable
            onPress={() => setEditing(false)}
            disabled={saving}
            hitSlop={6}
            className="w-9 h-9 rounded-lg bg-base items-center justify-center"
            style={{ opacity: saving ? 0.4 : 1 }}
          >
            <X color={colors.muted} size={17} />
          </Pressable>
        </View>
      ) : (
        <View className="flex-row items-center justify-between">
          <Text className="font-sans-semibold text-[15px] text-ink">{shown || "Not set"}</Text>
          <Pressable
            onPress={startEditing}
            hitSlop={10}
            className="w-8 h-8 items-center justify-center"
          >
            <Pencil color={colors.muted} size={16} />
          </Pressable>
        </View>
      )}
    </View>
  );
}

function LinkRow({ icon: Icon, label, danger, onPress, isLast }) {
  return (
    <Pressable hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
      onPress={onPress}
      className={`flex-row items-center gap-3 px-4 py-3.5 ${isLast ? "" : "border-b border-border"}`}
    >
      <View className={`w-9 h-9 rounded-xl items-center justify-center ${danger ? "bg-red-50" : "bg-base"}`}>
        <Icon color={danger ? "#DC2626" : colors.muted} size={18} />
      </View>
      <Text className={`font-sans-semibold text-[13.5px] flex-1 ${danger ? "text-red-600" : "text-ink"}`}>{label}</Text>
      <ChevronRight color={danger ? "#DC2626" : colors.muted} size={17} />
    </Pressable>
  );
}

function Profile() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const session = useAuthStore((state) => state.session);

  const suggestBrands = usePreferencesStore((state) => state.suggestBrands);
  const setSuggestBrands = usePreferencesStore((state) => state.setSuggestBrands);
  const location = usePreferencesStore((state) => state.location);

  const fullName = session?.user?.user_metadata?.full_name;
  const savedPhone = session?.user?.user_metadata?.phone;
  const phone = PHONE_PATTERN.test((savedPhone || "").trim()) ? savedPhone : undefined;
  const email = session?.user?.email ?? "";
  const initial = (fullName || email)?.[0]?.toUpperCase() ?? "?";
  const emailVerified = !!session?.user?.email_confirmed_at;

  const saveField = async (key, value) => {
    if (key === "phone" && value.trim() && !PHONE_PATTERN.test(value.trim())) {
      showNotice("Check the phone number", "Use digits only, for example 416 555 0123.");
      return false;
    }
    const { error } = await supabase.auth.updateUser({ data: { [key]: value } });
    if (error) {
      showNotice("Couldn't save", error.message, { tone: "danger" });
      return false;
    }
    return true;
  };

  const confirmLogout = () => {
    confirmDialog({
      title: "Log out of Buylo?",
      message: "Your current basket will be cleared. Your saved baskets stay on this phone for when you sign back in.",
      confirmLabel: "Log out",
      tone: "danger",
      icon: LogOut,
      onConfirm: logOut,
    });
  };

  return (
    <View className="flex-1 bg-base" style={{ paddingTop: insets.top }}>
      <AppHeader />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: Math.max(insets.bottom, 12) + 120, gap: 20 }}>
        <View>
          <Text className="font-sans-extrabold text-[22px] text-ink">Settings & Profile</Text>
          <Text className="font-sans-medium text-[13px] text-muted mt-1">
            Manage your account, location & comparison preferences
          </Text>
        </View>

        <View
          className="bg-white border border-border rounded-2xl items-center"
          style={{ paddingHorizontal: 20, paddingVertical: 36 }}
        >
          <View className="w-20 h-20 rounded-full bg-accent items-center justify-center mb-3">
            <Text className="font-sans-extrabold text-white text-[28px]">{initial}</Text>
          </View>
          <Text className="font-sans-bold text-[17px] text-ink">{fullName || "Add your name"}</Text>
          <Text className="font-sans-medium text-[13px] text-muted mt-0.5">{email}</Text>
          <View className="flex-row flex-wrap items-center justify-center gap-2 mt-3">
            <View className="flex-row items-center gap-1 bg-savings-soft rounded-full px-2.5 py-1">
              <Leaf color={colors.savings} size={12} />
              <Text className="font-sans-bold text-[10.5px]" style={{ color: colors.savings }}>{APP_NAME}</Text>
            </View>
            {session?.user?.created_at && (
              <View className="flex-row items-center gap-1 bg-base rounded-full px-2.5 py-1">
                <CalendarDays color={colors.muted} size={12} />
                <Text className="font-sans-semibold text-[10.5px] text-muted">
                  Member since {memberSince(session.user.created_at)}
                </Text>
              </View>
            )}
          </View>
        </View>

        <SectionCard title="Personal Details">
          <EditableField
            label="Full Name"
            value={fullName}
            placeholder="Your name"
            onSave={(value) => saveField("full_name", value)}
          />
          <View className="px-4 py-3.5 border-b border-border">
            <Text className="font-sans-semibold text-[11px] text-muted mb-1.5">Email Address</Text>
            <View className="flex-row items-center justify-between">
              <Text className="font-sans-semibold text-[15px] text-ink flex-1 pr-2" numberOfLines={1}>{email}</Text>
              <View className={`flex-row items-center gap-1 rounded-full px-2 py-1 ${emailVerified ? "bg-savings-soft" : "bg-base"}`}>
                <BadgeCheck color={emailVerified ? colors.savings : colors.muted} size={12} />
                <Text className="font-sans-bold" style={{ fontSize: 10, color: emailVerified ? colors.savings : colors.muted }}>
                  {emailVerified ? "Verified" : "Unverified"}
                </Text>
              </View>
            </View>
          </View>
          <EditableField
            label="Phone Number"
            value={phone}
            placeholder="e.g. +1 416 555 0192"
            keyboardType="phone-pad"
            onSave={(value) => saveField("phone", value)}
            isLast
          />
        </SectionCard>

        <SectionCard title="Shopping Location">
          <View className="px-4 py-3.5 flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-xl bg-accent items-center justify-center">
              <MapPin color="#fff" size={18} />
            </View>
            <View className="flex-1">
              <Text className="font-sans-semibold text-[14px] text-ink" numberOfLines={1}>
                {location?.label ? neighbourhoodName(location.label) : "No location set"}
              </Text>
              <Text className="font-sans-medium text-[11px] text-muted mt-0.5">
                Used to find nearby participating stores
              </Text>
            </View>
            <Pressable
              hitSlop={8}
              onPress={() => router.push("/manual-location")}
              className="bg-base rounded-lg px-3 py-2"
            >
              <Text className="font-sans-semibold text-[12px] text-accent">Change</Text>
            </Pressable>
          </View>
        </SectionCard>

        <SectionCard title="Comparison Preferences">
          <ToggleRow
            label="Suggest cheaper brands"
            description="After comparing, offer the same product from a cheaper brand"
            value={suggestBrands}
            onValueChange={setSuggestBrands}
            isLast
          />
        </SectionCard>

        <SectionCard title="Account & Privacy">
          <LinkRow icon={HelpCircle} label="How Buylo works" onPress={() => router.push("/onboarding")} />
          <LinkRow icon={Lock} label="Change Password" onPress={() => router.push("/settings/change-password")} />
          <LinkRow icon={ShieldCheck} label="Privacy Policy" onPress={() => router.push("/settings/privacy-policy")} />
          <LinkRow icon={FileText} label="Terms of Service" onPress={() => router.push("/settings/terms")} />
          <LinkRow icon={Trash2} label="Delete Account" danger onPress={() => router.push("/settings/delete-account")} />
          <LinkRow icon={LogOut} label="Log Out" danger onPress={confirmLogout} isLast />
        </SectionCard>

        <Pressable
          onPress={() => showToast("Everything is saved")}
          className="bg-accent rounded-2xl py-4 items-center flex-row justify-center gap-2 active:opacity-90"
        >
          <CheckCircle2 color="#fff" size={18} />
          <Text className="font-sans-bold text-base text-white">Save Changes</Text>
        </Pressable>

        <Text className="font-sans-medium text-[10.5px] text-muted text-center mt-4 opacity-70">
          Postal code data © GeoNames.org, CC BY 4.0
        </Text>
        <Text className="font-sans-medium text-[10.5px] text-muted text-center mt-1 opacity-70">
          Walmart store locations © OpenStreetMap contributors, ODbL
        </Text>
      </ScrollView>

      <BottomNav active="profile" />
    </View>
  );
}

export default ignoreParentRenders(Profile);
