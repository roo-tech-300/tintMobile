// app/onboarding.tsx
import { updateDbUser, uploadAvatar } from '@/appwrite/apis/auth';
import DatePickerModal from '@/components/DatePicker';
import DepartmentDropdown from '@/components/DepartmentDropdown';
import DotIndicator from '@/components/DotIndicator';
import TintIcon from '@/components/Icon';
import LoadingSpinner from '@/components/LoadingSpinner';
import PrimaryBtn from '@/components/PrimaryBtn';
import TextPut from '@/components/TextPut';
import { useAuth } from '@/context/AuthContext';
import departments from '@/data/departments.json'; // see file below
import { borderRadius, colors, fonts } from '@/theme/theme';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SLIDE_COUNT = 5;

export default function Onboarding() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const scrollRef = useRef<ScrollView | null>(null);
  const [index, setIndex] = useState(0);

  // form state
  const [username, setUsername] = useState('');
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [selectedFaculty, setSelectedFaculty] = useState<string | null>(null);
  const [dob, setDob] = useState<string | null>(null); // ISO string or display
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [dobDate, setDobDate] = useState(new Date(2000, 0, 1));
  const [dateModal, setDateModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [usernameError, setUsernameError] = useState("");

  const validateUsername = (name: string) => {
    // 1. Regex for allowed chars, length (3-20), start/end with alphanumeric
    const mainRegex = /^[a-z0-9](?:[a-z0-9._]{1,18}[a-z0-9])$/;
    // 2. Regex for no consecutive dots/underscores
    const noConsecutiveSpecial = /^(?!.*[._]{2})/;

    if (!name) return "Username is required";
    if (name.length < 3) return "Username must be at least 3 characters";
    if (name.length > 20) return "Username must be at most 20 characters";
    if (!mainRegex.test(name)) {
      if (/^[^a-z0-9]/.test(name)) return "Must start with a letter or number";
      if (/[^a-z0-9]$/.test(name)) return "Must end with a letter or number";
      if (/[^a-z0-9._]/.test(name)) return "Only letters, numbers, . and _ allowed";
      return "Invalid username format";
    }
    if (!noConsecutiveSpecial.test(name)) return "Cannot have consecutive . or _";

    return "";
  };

  // handle dept selection -> auto fill faculty & default level
  const onSelectDept = (deptId: string) => {
    setSelectedDept(deptId);
    const entry = departments.find((d) => d.id === deptId);
    if (entry) {
      setSelectedFaculty(entry.faculty);
    } else {
      setSelectedFaculty(null);
    }
  };

  const goTo = (i: number) => {
    if (i < 0 || i >= SLIDE_COUNT) return;
    scrollRef.current?.scrollTo({ x: i * SCREEN_WIDTH, animated: true });
    // Remove setIndex(i) here - let onScroll handle it
  };

  const handleNext = () => {
    if (index < SLIDE_COUNT - 1) {
      goTo(index + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    if (index > 0) {
      goTo(index - 1);
    }
  };

  const handleSkip = () => {
    router.replace('/auth/login');
  };

  const handleFinish = async () => {
    setIsUploading(true); // Start loading

    const payload: Record<string, string | boolean> = {};

    if (username && username.trim()) {
      const error = validateUsername(username.trim());
      if (error) {
        setUsernameError(error);
        goTo(1); // Go back to username slide
        setIsUploading(false);
        return;
      }
      payload.username = username.trim();
    }
    if (selectedDept) {
      payload.department = selectedDept;
    }
    if (dob) {
      payload.birthday = dob;
    }

    // Mark onboarding as complete
    payload.onBoarding = true;

    console.log('Onboarding payload (before avatar upload):', payload);

    // Only update if we have a user ID
    if (user?.$id) {
      try {
        // Upload avatar first if one was selected
        if (avatarUri) {
          console.log('Uploading avatar...');
          try {
            const avatarFileId = await uploadAvatar(avatarUri);
            payload.avatar = avatarFileId;
            console.log('Avatar uploaded successfully. File ID:', avatarFileId);
          } catch (uploadError) {
            console.error('Error uploading avatar:', uploadError);
            Alert.alert('Upload Error', 'Failed to upload avatar. Continuing without it.');
          }
        }

        console.log('Final payload being sent to updateDbUser:', payload);

        // Update user with all data
        await updateDbUser(user.$id, payload);
        console.log('User updated successfully');
        setIsUploading(false);

        await refreshUser();
        router.replace('/(tabs)/home');
      } catch (error) {
        console.error('Error updating user:', error);
        setIsUploading(false); // Stop loading on error
        Alert.alert('Error', 'Failed to save your information. Please try again.');
      }
    } else {
      console.warn('No user ID found');
      setIsUploading(false); // Stop loading on error
      Alert.alert('Error', 'User not found. Please log in again.');
    }
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const page = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setIndex(page);
  };

  // Avatar picker (gallery only)
  const pickImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Permission required', 'Please allow gallery access to choose an avatar.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
        aspect: [1, 1],
      });
      if (!result.canceled) {
        const image = result.assets[0];
        setAvatarUri(image.uri);
      }
    } catch (err) {
      console.warn('ImagePicker error', err);
    }
  };



  return (
    <SafeAreaView style={styles.wrapper} edges={['top', 'bottom']}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ alignItems: 'center' }}
      >
        {/* Slide 1 - Welcome */}
        <View style={styles.slide}>
          {/* example image: use the uploaded screenshot path as file URI */}
          <Text style={styles.h1}>Welcome to Tint</Text>
          <Text style={styles.h2}>Let's get you started</Text>
        </View>

        {/* Slide 2 - Username */}
        <View style={styles.slide}>
          <Text style={styles.h1}>What should we call you</Text>
          <Text style={[styles.h2, { marginBottom: 24 }]}>Letters, numbers and underscores only</Text>

          <TextPut
            placeholder="username"
            value={username}
            onChangeText={(text) => {
              setUsername(text.toLowerCase());
              if (usernameError) setUsernameError("");
            }}
            autoCapitalize="none"
          />
          {usernameError ? (
            <Text style={{ color: colors.error, fontSize: 12, marginTop: 5, textAlign: 'center' }}>
              {usernameError}
            </Text>
          ) : (
            <Text style={styles.helperText}>
              Letters, numbers, underscores, periods (3-20 chars)
            </Text>
          )}
        </View>

        {/* Slide 3 - Department */}
        <View style={styles.slide}>
          <Text style={styles.h1}>Which department are you in?</Text>
          <Text style={styles.h2}>This helps us recommend communities</Text>

          <View style={{ height: 16 }} />

          <DepartmentDropdown
            selectedDept={selectedDept}
            onSelectDept={onSelectDept}
          />
        </View>

        {/* Slide 4 - DOB */}
        <View style={styles.slide}>
          <Text style={styles.h1}>Your birthday</Text>
          <Text style={styles.h2}>Let us know your birthday</Text>

          <View style={{ height: 24 }} />

          <TouchableOpacity
            style={styles.dateBtn}
            onPress={() => setDateModal(true)}
          >
            <Text style={styles.dateBtnText}>
              {dob ?? "Select date of birth"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Slide 5 - Avatar */}
        <View style={styles.slide}>
          <Text style={styles.h1}>Add a profile photo</Text>
          <Text style={styles.h2}>You can always change it later</Text>
          <View style={{ height: 24 }} />

          <TouchableOpacity style={styles.avatarPicker} onPress={pickImage}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatar} />
            ) : (
              <TintIcon name="user" size={48} color={colors.background} />
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* bottom controls */}
      {index === 0 ? (
        // FIRST SCREEN NAVIGATION
        <View style={{ alignItems: "center", marginTop: 30, paddingBottom: 20, marginBottom: 10 }}>
          <PrimaryBtn
            title="Next"
            onPress={() => handleNext()}
            style={{ width: "80%" }}
          />

          <TouchableOpacity onPress={handleSkip}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>

          <DotIndicator index={index} total={5} style={{ marginTop: 24 }} />
        </View>
      ) : index === 4 ? (
        // LAST SCREEN - FINISH BUTTON
        <View style={styles.navContainer}>
          <View style={styles.rowNav}>
            <TouchableOpacity
              onPress={() => handlePrev()}
              style={{ paddingVertical: 10, paddingHorizontal: 16 }}
            >
              <Text style={styles.navButton}>Previous</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleFinish()}
              disabled={isUploading}
              style={{
                backgroundColor: colors.primary,
                borderRadius: 12,
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 10,
                paddingHorizontal: 16,
                opacity: isUploading ? 0.7 : 1,
                minWidth: 80
              }}
            >
              {isUploading ? (
                <View style={{ height: 24, justifyContent: 'center' }}>
                  <LoadingSpinner size="small" color={colors.text} message="" />
                </View>
              ) : (
                <Text style={[styles.navButton, { color: colors.text }]}>Finish</Text>
              )}
            </TouchableOpacity>
          </View>
          <DotIndicator index={index} total={5} style={{ marginTop: 16 }} />
        </View>
      ) : (
        // SCREENS 2–4 NAVIGATION
        <View style={styles.navContainer}>
          <View style={styles.rowNav}>
            <TouchableOpacity
              onPress={() => handlePrev()}
            >
              <Text style={styles.navButton}>Previous</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleNext()}
            >
              <Text style={styles.navButton}>Next</Text>
            </TouchableOpacity>
          </View>

          <DotIndicator index={index} total={5} style={{ marginTop: 10 }} />
        </View>
      )}

      <DatePickerModal
        visible={dateModal}
        initialDate={dobDate}
        onClose={() => setDateModal(false)}
        onConfirm={(selectedDate) => {
          setDobDate(selectedDate);
          setDob(selectedDate.toISOString().slice(0, 10));
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: colors.background },
  slide: {
    width: SCREEN_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  heroImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.6,
    position: 'absolute',
    top: 0,
    opacity: 0.18,
  },
  h1: {
    color: colors.primary,
    fontSize: 22,
    fontFamily: fonts.bold,
    marginBottom: 8,
  },
  h2: {
    color: colors.text,
    fontSize: 14,
    textAlign: 'center',
  },
  helperText: {
    color: colors.text,
    fontSize: 12,
    marginTop: 12,
    textAlign: 'center',
  },

  dropdown: { width: '100%', marginTop: 12 },
  dropdownItem: {
    backgroundColor: colors.darkText,
    padding: 12,
    borderRadius: borderRadius.small,
    marginVertical: 8,
  },
  dropdownText: {
    color: colors.primary,
    fontFamily: fonts.bold,
  },
  dropdownSub: {
    color: colors.text,
    fontSize: 12,
    marginTop: 6,
  },

  dateBtn: {
    backgroundColor: colors.text,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: borderRadius.small,
    width: '100%',
  },
  dateBtnText: {
    color: colors.black,
    fontFamily: fonts.bold,
    fontSize: 16,
  },

  avatarPicker: {
    width: 120,
    height: 120,
    borderRadius: 120 / 2,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: { width: 120, height: 120, borderRadius: 120 / 2 },

  controls: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: Platform.OS === 'ios' ? 36 : 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  dots: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 8,
    backgroundColor: '#4a2339',
  },
  dotActive: { backgroundColor: colors.primary },

  nextBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: borderRadius.small,
    backgroundColor: colors.primary,
  },
  navContainer: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginTop: 20,
    alignItems: 'center', // Center children horizontally
  },
  rowNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    width: '100%', // Full width so buttons spread
  },
  navButton: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: colors.primary,
  },
  skipText: {
    marginTop: 10,
    fontSize: 14,
    color: colors.darkText,
  }

});
