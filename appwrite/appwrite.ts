// src/lib/appwrite/appwrite.ts
import Constants from 'expo-constants'
import 'react-native-url-polyfill/auto';   // required polyfill
import { Client, Account, Databases, Storage, TablesDB } from 'react-native-appwrite';


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
