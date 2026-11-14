import { Drawer } from "expo-router/drawer";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { Sidebar } from "../../components/Sidebar";

export default function DrawerLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        screenOptions={{
          headerShown: false,
          drawerType: "front",
          overlayColor: "rgba(26,27,38,0.4)",
          drawerStyle: { width: "82%" },
        }}
        drawerContent={(props) => <Sidebar {...props} />}
      >
        <Drawer.Screen name="index" />
        <Drawer.Screen name="categories" />
        <Drawer.Screen name="saved-baskets" />
        <Drawer.Screen name="basket" />
        <Drawer.Screen name="profile" />
        <Drawer.Screen name="search" />
      </Drawer>
    </GestureHandlerRootView>
  );
}
