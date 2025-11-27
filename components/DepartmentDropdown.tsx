import TintIcon from '@/components/Icon';
import departments from '@/data/departments.json';
import { borderRadius, colors, fonts } from '@/theme/theme';
import React, { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  selectedDept: string | null;
  onSelectDept: (deptId: string) => void;
};

export default function DepartmentDropdown({ selectedDept, onSelectDept }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedDeptName = departments.find((d) => d.id === selectedDept)?.name || 'Select department';

  return (
    <>
      <TouchableOpacity
        style={[
          styles.dropdown,
        ]}
        onPress={() => setIsOpen(true)}
      >
        <Text style={styles.dropdownText}>{selectedDeptName}</Text>
        <TintIcon name="angle-small-down" size={20} color={colors.lightBunker} />
      </TouchableOpacity>

      <Modal visible={isOpen} transparent animationType="slide">
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setIsOpen(false)}
        >
          <Pressable 
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Department</Text>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <TintIcon name="cross" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={departments}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.listItem,
                    selectedDept === item.id && styles.listItemActive,
                  ]}
                  onPress={() => {
                    onSelectDept(item.id);
                    setIsOpen(false);
                  }}
                >
                  <View>
                    <Text style={styles.listItemText}>{item.name}</Text>
                    <Text style={styles.listItemSub}>{item.faculty}</Text>
                  </View>
                  {selectedDept === item.id && (
                    <TintIcon name="check" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.text,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: borderRadius.small,
    width: '100%',
  },
  dropdownText: {
    color: colors.lightBunker,
    fontFamily: fonts.bold,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.black,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomColor: colors.text,
  },
  modalTitle: {
    color: colors.text,
    fontSize: 18,
    fontFamily: fonts.bold,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  listItemActive: {
    backgroundColor: 'rgba(255, 0, 255, 0.1)',
  },
  listItemText: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 16,
  },
  listItemSub: {
    color: colors.darkText,
    fontSize: 12,
    marginTop: 4,
  },
});