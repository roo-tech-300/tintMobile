// storage/userCache.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export const USER_CACHE_KEY = "tint_user";
export const AUTH_FLAG_KEY = "tint_isLoggedIn";

export const saveUserToCache = async (user: any) => {
  await AsyncStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
};

export const getUserFromCache = async () => {
  const data = await AsyncStorage.getItem(USER_CACHE_KEY);
  return data ? JSON.parse(data) : null;
};

export const setLoggedInFlag = async (value: boolean) => {
  await AsyncStorage.setItem(AUTH_FLAG_KEY, value ? "true" : "false");
};

export const getLoggedInFlag = async () => {
  return (await AsyncStorage.getItem(AUTH_FLAG_KEY)) === "true";
};

export const clearAuthCache = async () => {
  await AsyncStorage.multiRemove([USER_CACHE_KEY, AUTH_FLAG_KEY]);
};
