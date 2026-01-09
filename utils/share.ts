import * as Sharing from "expo-sharing";
import { Share } from "react-native";

export async function sharePost(caption: string) {
  try {
    if (!caption) {
      throw new Error("Nothing to share");
    }

    await Share.share({
      message: caption,
    });

  } catch (error) {
    console.error("Share failed:", error);
  }
}
