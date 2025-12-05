import * as SecureStore from 'expo-secure-store';

const AUTH_KEY = "tint-auth";

export async function saveAuth(data: any) {
  await SecureStore.setItemAsync(AUTH_KEY, JSON.stringify(data));
}

export async function getAuth() {
  const stored = await SecureStore.getItemAsync(AUTH_KEY);
  return stored ? JSON.parse(stored) : null;
}

export async function clearAuth() {
  await SecureStore.deleteItemAsync(AUTH_KEY);
}
