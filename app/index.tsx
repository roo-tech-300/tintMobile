import PrimaryBtn from '@/components/PrimaryBtn';
import { colors } from '@/theme/theme';
import { useRouter } from 'expo-router';
import { Dimensions, Image, StyleSheet, View } from 'react-native';

export default function GetStarted() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('./auth/login'); // Navigate to login page
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/Logo 2.png')} // Replace with your logo
        style={styles.logo}
        resizeMode="contain"
      />

      <PrimaryBtn title="Get Started" onPress={handleGetStarted} style={styles.button} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background, // Theme color
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    width: Dimensions.get('window').width * 0.5,
    height: Dimensions.get('window').width * 0.5,
    marginBottom: 50,
  },
  button: {
    position: 'absolute',
    bottom: 50,
  },
});
