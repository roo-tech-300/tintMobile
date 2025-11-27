import { ThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { View, Text } from 'react-native';
import { colors } from '@/theme/theme';
import Ionicons from '@expo/vector-icons/Ionicons';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {

  // Load custom fonts
  const [fontsLoaded] = useFonts({
    'Hero-Bold': require('../assets/fonts/HeroLight-Bold.otf'),
    'Hero-Light': require('../assets/fonts/HeroLight-Light.otf'),
    'Hero-Regular': require('../assets/fonts/HeroLight-Regular.otf'),
    "TintIcons": require('../assets/icons/icomoon.ttf')
  });

  // Wait for fonts to load before rendering any screen
if (!fontsLoaded) {
  return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Loading...</Text></View>;
}


  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      />
      <StatusBar style="auto" />
    </>
  );
}
