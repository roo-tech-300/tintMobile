// src/lib/appwrite/appwrite.ts
import Constants from 'expo-constants';
import { Account, Client, Storage, TablesDB } from 'react-native-appwrite';
import 'react-native-url-polyfill/auto'; // required polyfill


const extra = Constants.expoConfig?.extra as {
  appBundleId: string;
  appwriteEndpoint: string;
  appwriteProjectId: string;
};


const { appBundleId, appwriteEndpoint, appwriteProjectId } = extra;

const API_URL = Constants.expoConfig?.extra?.apiUrl || '';

const client = new Client()
  .setEndpoint(appwriteEndpoint)
  .setProject(appwriteProjectId)
  .setPlatform(appBundleId);

export const account = new Account(client);
export const databases = new TablesDB(client);
export const storage = new Storage(client);

export default client;
