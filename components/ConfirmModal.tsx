import React from 'react';
import { Modal, View, Text, Pressable, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import { colors, fonts, borderRadius } from '@/theme/theme';

interface ConfirmModalProps {
    visible: boolean;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    visible,
    message,
    onConfirm,
    onCancel,
}) => {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onCancel}
        >
            <TouchableWithoutFeedback onPress={onCancel}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <View style={styles.modalContainer}>
                            <Text style={styles.message}>{message}</Text>

                            <View style={styles.buttonRow}>
                                <Pressable style={[styles.button, styles.cancelButton]} onPress={onCancel}>
                                    <Text style={styles.cancelText}>Cancel</Text>
                                </Pressable>

                                <Pressable style={[styles.button, styles.confirmButton]} onPress={onConfirm}>
                                    <Text style={styles.confirmText}>Confirm</Text>
                                </Pressable>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

export default ConfirmModal;

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.6)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    modalContainer: {
        width: "85%",
        backgroundColor: colors.lightBunker,
        padding: 20,
        borderRadius: borderRadius.small,
    },
    message: {
        fontSize: 16,
        color: colors.text,
        textAlign: "center",
        fontFamily: fonts.bold,
        marginBottom: 25,
    },
    buttonRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 15,
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: borderRadius.small,
        alignItems: "center",
    },
    cancelButton: {
        backgroundColor: "transparent",
        borderWidth: 1,
        borderColor: colors.darkText,
    },
    confirmButton: {
        backgroundColor: colors.primary,
    },
    cancelText: {
        color: colors.darkText,
        fontFamily: fonts.bold,
        fontSize: 14,
    },
    confirmText: {
        color: colors.text,
        fontFamily: fonts.bold,
        fontSize: 14,
    },
});
