export default {
  "expo": {
    "name": "Tint-Mobile",
    "slug": "Tint-Mobile",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/Logo 1.png",
    "scheme": "tintmobile",
    "userInterfaceStyle": "automatic",
    "newArchEnabled": true,
    "ios": {
      "supportsTablet": true
    },
    "android": {
      "adaptiveIcon": {
        "backgroundColor": "#E6F4FE",
        "foregroundImage": "./assets/images/Logo 1.png",
        "backgroundImage": "./assets/images/Logo 1.png",
        "monochromeImage": "./assets/images/Logo 1.png",
      },
      "edgeToEdgeEnabled": true,
      "predictiveBackGestureEnabled": false,
      "package": "com.eluzia.TintMobile"
    },
    "web": {
      "output": "static",
      "favicon": "./assets/images/favicon.png"
    },
    "plugins": [
      "expo-router",
      "expo-secure-store",
      [
        "expo-splash-screen",
        {
          "image": "./assets/images/Logo 1.png",
          "imageWidth": 200,
          "resizeMode": "contain",
          "backgroundColor": "#44002B",
          "dark": {
            "backgroundColor": "#000000"
          }
        }
      ]
    ],
    "experiments": {
      "typedRoutes": true,
      "reactCompiler": true
    },
    "extra": {
      "router": {},
      "projectId": "7fa48483-b064-4e6d-82bb-016b843c0021",
      "appBundleId": process.env.EXPO_PUBLIC_APP_BUNDLE_ID,
      "appwriteEndpoint": process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
      "appwriteProjectId": process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
      "databaseId": process.env.EXPO_PUBLIC_DATABASE_ID,
      "usersCollectionId": process.env.EXPO_PUBLIC_USERS_COLLECTION_ID,
      'mediaBucketId': process.env.EXPO_PUBLIC_MEDIA_BUCKET_ID,
      "postsCollectionId": process.env.EXPO_PUBLIC_POSTS_COLLECTION_ID,
      "commentsCollectionId": process.env.EXPO_PUBLIC_COMMENTS_COLLECTION_ID
    },
    "owner": "eluzia"
  }
}
