import { ScrollView, View, Text, Pressable } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import config from "../legal/config.json";

export function fillTokens(text) {
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => String(config[key] ?? ""));
}

export function LegalDocument({ doc, onlinePath }) {
  const insets = useSafeAreaInsets();
  const onlineUrl = config.publicBaseUrl ? `${config.publicBaseUrl.replace(/\/$/, "")}/${onlinePath}` : null;

  return (
    <ScrollView
      className="flex-1 bg-base"
      contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: insets.bottom + 32 }}
    >
      <Text className="font-sans-medium text-sm text-muted leading-5">{fillTokens(doc.intro)}</Text>

      {doc.sections.map((section) => (
        <View key={section.heading} className="mt-6">
          <Text className="font-sans-bold text-base text-ink">{fillTokens(section.heading)}</Text>
          {section.paragraphs?.map((p) => (
            <Text key={p} className="font-sans-medium text-sm text-muted leading-5 mt-2">
              {fillTokens(p)}
            </Text>
          ))}
          {section.bullets?.map((b) => (
            <View key={b} className="flex-row mt-2 pr-2">
              <Text className="font-sans-medium text-sm text-muted leading-5 mr-2">{"•"}</Text>
              <Text className="flex-1 font-sans-medium text-sm text-muted leading-5">{fillTokens(b)}</Text>
            </View>
          ))}
        </View>
      ))}

      {onlineUrl && (
        <Pressable hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }} onPress={() => WebBrowser.openBrowserAsync(onlineUrl)} className="mt-8">
          <Text className="font-sans-semibold text-sm text-accent">View this page online</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}
