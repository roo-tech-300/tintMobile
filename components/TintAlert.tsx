import { borderRadius, colors, fonts } from "@/theme/theme";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface AlertProps {
  message: string;
  type?: "error" | "success" | "info";
  onClose: () => void;
  visible: boolean;
}

const TintAlert: React.FC<AlertProps> = ({ message, type = "error", onClose, visible }) => {
  const insets = useSafeAreaInsets();

  if (!visible) return null;

  const getBackgroundColor = () => {
    switch (type) {
      case "error": return colors.error;
      case "success": return "#22c55e"; // green-500
      case "info": return "#3b82f6"; // blue-500
      default: return colors.error;
    }
  };

  return (
    <View style={[styles.container, { top: insets.top + 10 }]}>
      <View style={[styles.alertBox, { backgroundColor: getBackgroundColor() }]}>
        <Text style={styles.message}>{message}</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeText}>×</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
    elevation: 5,
  },
  alertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: borderRadius.small,
    width: '90%',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  message: {
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 14,
    flex: 1,
  },
  closeButton: {
    marginLeft: 10,
    padding: 4,
  },
  closeText: {
    color: colors.text,
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 24,
  },
});

export default TintAlert;