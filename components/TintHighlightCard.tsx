import { borderRadius, colors, fonts } from "@/theme/theme";
import { StyleSheet, Text, View } from "react-native";
import TintIcon from "./Icon";


interface TintHighlightCardProps {
    icon: string;
    title: string;
    text: string;
}

export const TintHighlightCard = ({ icon, title, text }: TintHighlightCardProps) => {
    return (
       <View style={styles.highlightCard}>
              <View style={styles.highlightCardIcon}>
                <TintIcon name={icon} size={17} color={colors.text} />
              </View>
              <Text style={styles.highlightHeading}>{title}</Text>
              <Text style={styles.highlightText}>
                {(() => {
                  const fullText = text;
                  const maxLength = 43;
                  if (fullText.length > maxLength) {
                    return (
                      <>
                        {fullText.substring(0, maxLength)}...{' '}
                        <Text style={styles.readMore}>Read more</Text>
                      </>
                    );
                  }
                  return fullText;
                })()}
              </Text>
            </View>
    );
};

 const styles = StyleSheet.create(
        { 
            highlightCard: {
            paddingVertical: 10,
            width: 117,
            height: 160,
            backgroundColor: colors.lightBunker,
            borderRadius: borderRadius.small,
            marginTop: 20,
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          },
          highlightCardIcon: {
            width: 33,
            height: 33,
            backgroundColor: colors.primary,
            borderRadius: borderRadius.round,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          },
          highlightHeading: {
            color: colors.primary,
            fontSize: 18,
            fontFamily: fonts.bold,
            marginTop: 10,
          },
          highlightText: {
            color: colors.darkText,
            fontSize: 14,
            fontFamily: fonts.regular,
            width: 80,
            textAlign: "center"
          },
          readMore: {
            color: colors.primary,
            fontSize: 12,
            fontFamily: fonts.bold,
          },
        }
    )

