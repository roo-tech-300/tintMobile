import { Tabs } from "expo-router";
import { colors } from "@/theme/theme";
import TintIcon from "@/components/Icon";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.darkText,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: colors.black,
          borderTopWidth: 0,
          height: 65,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <TintIcon name="house-blank" size={25} color={color} />,
        }}
      />

      <Tabs.Screen
        name="search"
        options={{
          title: "search",
          tabBarIcon: ({ color }) => <TintIcon name="search" size={25} color={color} />,
        }}
      />

      <Tabs.Screen
        name="addPost"
        options={{
          title: "Add",
          tabBarIcon: ({ color }) => <TintIcon name="add" size={25} color={color} />,
        }}
      />

      <Tabs.Screen
        name="communities"
        options={{
          title: "Communities",
          tabBarIcon: ({ color }) => <TintIcon name="users-alt" size={25} color={color} />,
        }}
      />

      <Tabs.Screen
        name="courses"
        options={{
          title: "Courses",
          tabBarIcon: ({ color }) => <TintIcon name="graduation-cap-2" size={25} color={color} />,
        }}
      />

    </Tabs>
  );
}
