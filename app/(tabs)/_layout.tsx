import TintIcon from "@/components/Icon";
import { colors } from "@/theme/theme";
import { createMaterialTopTabNavigator, MaterialTopTabNavigationEventMap, MaterialTopTabNavigationOptions } from "@react-navigation/material-top-tabs";
import { ParamListBase, TabNavigationState } from "@react-navigation/native";
import { withLayoutContext } from "expo-router";
import { Platform } from "react-native";

const { Navigator } = createMaterialTopTabNavigator();

export const MaterialTabs = withLayoutContext<
  MaterialTopTabNavigationOptions,
  typeof Navigator,
  TabNavigationState<ParamListBase>,
  MaterialTopTabNavigationEventMap
>(Navigator);

export default function TabsLayout() {
  return (
    <MaterialTabs
      tabBarPosition="bottom"
      initialRouteName="home"
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.darkText,
        tabBarShowLabel: false,
        tabBarIndicatorStyle: { height: 0 }, // Hide top indicator
        tabBarPressColor: "transparent", // Remove android ripple if preferred, or set to a color
        tabBarPressOpacity: 1, // Ensure it feels responsive
        tabBarStyle: {
          backgroundColor: colors.black,
          borderTopWidth: 0,
          height: Platform.OS === 'ios' ? 85 : 65,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarItemStyle: {
          height: 65,
          justifyContent: "center",
          alignItems: "center",
        },
        swipeEnabled: true,
      }}
    >
      <MaterialTabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <TintIcon name="house-blank" size={24} color={color} />,
        }}
      />

      <MaterialTabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ color }) => <TintIcon name="search" size={24} color={color} />,
        }}
      />

      <MaterialTabs.Screen
        name="addPost"
        options={{
          title: "Add",
          tabBarIcon: ({ color }) => <TintIcon name="add" size={24} color={color} />,
        }}
      />

      <MaterialTabs.Screen
        name="communities"
        options={{
          title: "Communities",
          tabBarIcon: ({ color }) => <TintIcon name="users-alt" size={24} color={color} />,
        }}
      />

      <MaterialTabs.Screen
        name="courses"
        options={{
          title: "Courses",
          tabBarIcon: ({ color }) => <TintIcon name="graduation-cap-2" size={24} color={color} />,
        }}
      />
    </MaterialTabs>
  );
}
